import Problem from './Problem.model.js';
import EditorialView from './EditorialView.model.js';
import { judgeSubmission } from '../execution/engine/judge.js';
import { JudgeQueueFullError } from '../execution/engine/concurrencyLimiter.js';
import { findRoomByUserId } from '../battles/state.js';
import logger from '../../core/utils/logger.js';

// Fields an admin may set. Anything else in the body is ignored.
const EDITABLE = [
  'title',
  'difficulty',
  'description',
  'constraints',
  'examples',
  'publicTestCases',
  'hiddenTestCases',
  'tags',
  'signature',
  'outputOrder',
  'editorial',
];
// Changing any of these can change which solutions pass, so a reference
// solution must pass the judge again before the change is saved.
const JUDGED_FIELDS = ['publicTestCases', 'hiddenTestCases', 'signature', 'outputOrder'];

function pickEditable(body) {
  const out = {};
  for (const key of EDITABLE) if (body[key] !== undefined) out[key] = body[key];
  return out;
}

const plainSignature = (sig) => (sig?.functionName ? (sig.toObject ? sig.toObject() : sig) : undefined);

// Runs a reference solution against a problem's test cases. The admin's own
// draft cases count as public (so failures show input and output); stored
// hidden cases that the draft does not replace stay hidden.
function runReference({ problem, storedHidden = [], referenceSolution }) {
  const draftHidden = problem.hiddenTestCases ?? [];
  return judgeSubmission({
    language: referenceSolution.language,
    code: referenceSolution.code,
    publicTestCases: [...(problem.publicTestCases ?? []), ...draftHidden],
    hiddenTestCases: draftHidden.length ? [] : storedHidden,
    signature: plainSignature(problem.signature),
    outputOrder: problem.outputOrder ?? 'exact',
  });
}

function sendJudgeError(err, res, next) {
  if (err instanceof JudgeQueueFullError) return res.status(503).json({ success: false, message: err.message });
  return next(err);
}

// POST /api/problems (admin only). A reference solution is required and
// must be accepted on every test case, so broken test data never ships.
export const createProblem = async (req, res, next) => {
  try {
    const { referenceSolution } = req.body;
    if (!referenceSolution) {
      return res.status(400).json({ success: false, message: 'A reference solution is required' });
    }
    const fields = pickEditable(req.body);
    const draft = new Problem({ ...fields, createdBy: req.user._id });
    const invalid = draft.validateSync();
    if (invalid) {
      return res.status(400).json({ success: false, message: Object.values(invalid.errors)[0].message });
    }

    const check = await runReference({ problem: fields, referenceSolution });
    if (check.verdict !== 'Accepted') {
      return res.status(422).json({ success: false, message: 'The reference solution did not pass', data: { check } });
    }

    const problem = await draft.save();
    logger.info(`Problem created: "${problem.title}" by ${req.user.username}`);
    return res.status(201).json({ success: true, message: 'Problem created successfully', data: { problem } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A problem with this title already exists' });
    }
    sendJudgeError(err, res, next);
  }
};

// GET /api/problems - lightweight list view (title/difficulty/tags only),
// optionally filtered. Full descriptions aren't needed until a problem is
// actually opened.
export const getProblems = async (req, res, next) => {
  try {
    const { difficulty, tag } = req.query;
    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (tag) filter.tags = tag.toLowerCase();

    const problems = await Problem.find(filter).select('title difficulty tags createdAt').sort('-createdAt');

    return res.status(200).json({ success: true, data: { problems } });
  } catch (err) {
    next(err);
  }
};

// GET /api/problems/:id - full detail for solving a problem. hiddenTestCases
// and the editorial are never included (select: false on the schema +
// stripped again by toJSON), regardless of who's asking.
export const getProblemById = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }
    return res.status(200).json({ success: true, data: { problem } });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid problem id' });
    }
    next(err);
  }
};

// GET /api/problems/:id/admin (admin only) - everything needed to edit a
// problem, including the editorial. Hidden test cases are still never sent,
// even to admins: only how many there are.
export const getProblemForAdmin = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id).select('+editorial +hiddenTestCases');
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    const hiddenCount = problem.hiddenTestCases.length;
    const json = problem.toJSON();
    json.editorial = problem.editorial ?? null;
    return res.status(200).json({ success: true, data: { problem: json, hiddenCount } });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid problem id' });
    next(err);
  }
};

// POST /api/problems/check (admin only) - runs a reference solution
// against a draft without saving, for the admin form's "Check" button.
// With problemId and no draft hidden cases, the stored hidden cases are used.
export const checkProblem = async (req, res, next) => {
  try {
    const { problem: draft = {}, problemId, referenceSolution } = req.body;
    let storedHidden = [];
    if (problemId && !(draft.hiddenTestCases?.length > 0)) {
      const stored = await Problem.findById(problemId).select('+hiddenTestCases');
      storedHidden = stored?.hiddenTestCases ?? [];
    }
    const check = await runReference({ problem: draft, storedHidden, referenceSolution });
    return res.status(200).json({ success: true, data: { check } });
  } catch (err) {
    sendJudgeError(err, res, next);
  }
};

// PUT /api/problems/:id (admin only). Changing test cases, the signature or
// the output order needs a reference solution that passes the new version.
export const updateProblem = async (req, res, next) => {
  try {
    const existing = await Problem.findById(req.params.id).select('+hiddenTestCases +editorial');
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }
    const fields = pickEditable(req.body);
    const judgedChange = JUDGED_FIELDS.some((f) => fields[f] !== undefined);

    if (judgedChange) {
      const { referenceSolution } = req.body;
      if (!referenceSolution) {
        return res.status(400).json({
          success: false,
          message: 'Changing test cases, signature or output order needs a reference solution',
        });
      }
      const merged = {
        publicTestCases: fields.publicTestCases ?? existing.publicTestCases,
        hiddenTestCases: fields.hiddenTestCases,
        signature: fields.signature === undefined ? existing.signature : fields.signature,
        outputOrder: fields.outputOrder ?? existing.outputOrder,
      };
      const check = await runReference({
        problem: merged,
        storedHidden: fields.hiddenTestCases ? [] : existing.hiddenTestCases,
        referenceSolution,
      });
      if (check.verdict !== 'Accepted') {
        return res.status(422).json({ success: false, message: 'The reference solution did not pass', data: { check } });
      }
    }

    existing.set(fields);
    // An explicit null removes the signature (back to a full-program problem).
    if (req.body.signature === null) existing.signature = undefined;
    const problem = await existing.save();
    return res.status(200).json({ success: true, message: 'Problem updated successfully', data: { problem } });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid problem id' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: Object.values(err.errors)[0].message });
    }
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A problem with this title already exists' });
    }
    sendJudgeError(err, res, next);
  }
};

// DELETE /api/problems/:id (admin only)
export const deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }
    return res.status(200).json({ success: true, message: 'Problem deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid problem id' });
    }
    next(err);
  }
};

// GET /api/problems/:id/editorial - approach and reference solutions.
// Blocked while the player is in a live battle on this problem. Opening it
// is recorded: later accepted solutions to this problem score lower.
export const getEditorial = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id).select('title editorial');
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    const room = findRoomByUserId(req.user._id.toString());
    if (room?.status === 'in_progress' && room.problem?._id.equals(problem._id)) {
      return res.status(403).json({ success: false, message: 'The editorial opens when the battle ends' });
    }
    if (!problem.editorial?.approach && !problem.editorial?.solutions?.python) {
      return res.status(404).json({ success: false, message: 'No editorial for this problem yet' });
    }

    await EditorialView.updateOne(
      { user: req.user._id, problem: problem._id },
      { $setOnInsert: { user: req.user._id, problem: problem._id } },
      { upsert: true }
    );
    return res.status(200).json({ success: true, data: { title: problem.title, editorial: problem.editorial } });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid problem id' });
    next(err);
  }
};
