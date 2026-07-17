import Problem from '../models/Problem.model.js';
import logger from '../utils/logger.js';

// POST /api/problems (admin only)
export const createProblem = async (req, res, next) => {
  try {
    const problem = await Problem.create({ ...req.body, createdBy: req.user._id });

    logger.info(`Problem created: "${problem.title}" by ${req.user.username}`);

    return res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      data: { problem },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A problem with this title already exists' });
    }
    next(err);
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

    const problems = await Problem.find(filter)
      .select('title difficulty tags createdAt')
      .sort('-createdAt');

    return res.status(200).json({ success: true, data: { problems } });
  } catch (err) {
    next(err);
  }
};

// GET /api/problems/:id - full detail for solving a problem. hiddenTestCases
// is never included (select: false on the schema + stripped again by
// toJSON), regardless of who's asking.
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

// PUT /api/problems/:id (admin only)
export const updateProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Problem updated successfully',
      data: { problem },
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid problem id' });
    }
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A problem with this title already exists' });
    }
    next(err);
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
