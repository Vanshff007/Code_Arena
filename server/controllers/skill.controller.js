import SkillProfile from '../models/SkillProfile.model.js';
import XPProgress from '../models/XPProgress.model.js';
import AIFeedbackHistory from '../models/AIFeedbackHistory.model.js';
import { getRecommendedProblems } from '../services/recommendation.service.js';
import { xpProgressWithinLevel } from '../services/xp.service.js';

// GET /api/skills/me - the Skill Radar data source.
export const getMySkillProfile = async (req, res, next) => {
  try {
    const profile = await SkillProfile.findOne({ user: req.user._id });
    const topicScores = profile ? Object.fromEntries(profile.topicScores) : {};
    return res.status(200).json({
      success: true,
      data: { topicScores, lastUpdatedAt: profile?.lastUpdatedAt ?? null },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/skills/xp - per-topic XP + derived level for the Topic XP display.
export const getMyXP = async (req, res, next) => {
  try {
    const records = await XPProgress.find({ user: req.user._id }).sort('-xp');
    const xp = records.map((r) => ({ topic: r.topic, ...xpProgressWithinLevel(r.xp) }));
    return res.status(200).json({ success: true, data: { xp } });
  } catch (err) {
    next(err);
  }
};

// GET /api/skills/recommendations - concept-based "recommended problems".
export const getMyRecommendations = async (req, res, next) => {
  try {
    const profile = await SkillProfile.findOne({ user: req.user._id });
    const { problems, reason, concepts } = await getRecommendedProblems(req.user._id, profile);
    return res.status(200).json({ success: true, data: { problems, reason, concepts } });
  } catch (err) {
    next(err);
  }
};

// GET /api/skills/feedback - recent AI Coach feedback feed.
export const getMyFeedback = async (req, res, next) => {
  try {
    const feedback = await AIFeedbackHistory.find({ user: req.user._id })
      .populate('problem', 'title difficulty')
      .sort('-createdAt')
      .limit(20);
    return res.status(200).json({ success: true, data: { feedback } });
  } catch (err) {
    next(err);
  }
};
