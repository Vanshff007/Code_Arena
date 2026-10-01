import Problem from '../problems/Problem.model.js';
import { runCustomInput, judgeSubmission } from './engine/judge.js';
import { JudgeQueueFullError } from './engine/concurrencyLimiter.js';
import { handleBattleSubmission } from '../battles/roomManager.js';
import { trackSubmission } from '../skills/performanceTracker.service.js';
import EditorialView from '../problems/EditorialView.model.js';
import logger from '../../core/utils/logger.js';

// POST /api/execute/run - "Run Code": compiles + runs against one ad-hoc
// input. No test cases involved. With a problemId, the code is wrapped in
// that problem's function harness (only its signature is read here).
export const runCode = async (req, res, next) => {
  try {
    const { language, code, input, problemId } = req.body;
    let signature;
    if (problemId) {
      const problem = await Problem.findById(problemId).select('signature');
      if (!problem) {
        return res.status(404).json({ success: false, message: 'Problem not found' });
      }
      signature = problem.signature?.functionName ? problem.signature.toObject() : undefined;
    }
    const result = await runCustomInput({ language, code, input, signature });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    if (err instanceof JudgeQueueFullError) {
      return res.status(503).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// POST /api/execute/submit - "Submit": judges the code against a problem's
// full test suite. This is the only controller that reads hiddenTestCases
// (via the explicit .select('+hiddenTestCases') below) - and judgeSubmission
// guarantees that content never makes it into the response.
export const submitCode = async (req, res, next) => {
  try {
    const { language, code, problemId, roomCode, startedAt } = req.body;

    const problem = await Problem.findById(problemId).select('+hiddenTestCases');
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const result = await judgeSubmission({
      language,
      code,
      publicTestCases: problem.publicTestCases,
      hiddenTestCases: problem.hiddenTestCases,
      signature: problem.signature?.functionName ? problem.signature.toObject() : undefined,
      outputOrder: problem.outputOrder,
    });

    logger.info(`Submission judged: ${req.user.username} -> "${problem.title}" -> ${result.verdict}`);

    // Practice-mode submissions omit roomCode and stop here. Battle
    // submissions feed the verdict into the room's real-time state so the
    // opponent gets notified and a win/timeout can be resolved.
    if (roomCode) {
      await handleBattleSubmission(roomCode, req.user._id.toString(), result, { language, code });
    }

    // Feeds the Skill Analyzer / XP / AI Coach pipeline. Wrapped so a bug
    // anywhere in that (still-new) pipeline can never break the actual
    // submit response the player is waiting on.
    const timeTakenMs = startedAt ? Date.now() - Number(startedAt) : null;
    const editorialViewed = Boolean(await EditorialView.exists({ user: req.user._id, problem: problem._id }));
    const tracking = await trackSubmission({
      userId: req.user._id,
      problem,
      language,
      editorialViewed,
      verdict: result.verdict,
      timeTakenMs,
      runtimeMs: result.runtimeMs,
      memoryKb: result.memoryKb,
    }).catch((err) => {
      logger.error(`trackSubmission failed: ${err.message}`);
      return null;
    });

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        coaching: tracking?.feedback?.messages ?? null,
        scoreAwarded: tracking?.score ?? null,
        xpAwarded: tracking?.xpAwarded ?? null,
      },
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid problem id' });
    }
    if (err instanceof JudgeQueueFullError) {
      return res.status(503).json({ success: false, message: err.message });
    }
    next(err);
  }
};
