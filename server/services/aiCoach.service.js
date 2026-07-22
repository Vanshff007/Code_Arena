import { CONCEPT_PROGRESSION } from '../constants/topics.js';

// Rule-based coaching feedback - deliberately not an LLM call. Every example
// in the spec ("solved in 9 minutes, average is 18, excellent speed",
// "struggled with this Graph problem, also struggled with BFS before") is a
// deterministic comparison against an aggregate or a topic-history lookup,
// filled into a template - there's no open-ended generation happening, so
// a rule-based engine is free, instant, and reproducible where an LLM call
// would just add latency, cost, and non-determinism for the same output.
// If more natural/varied phrasing is wanted later, only this function's
// internals need to change - callers (performanceTracker.service.js) don't.
//
// Consumes data computed elsewhere (skill scores from skillAnalyzer,
// aggregates from performanceTracker) rather than recomputing anything
// itself - single responsibility.
export function generateFeedback({
  verdict,
  timeTakenMs,
  averageTimeMs,
  memoryKb,
  averageMemoryKb,
  topic,
  topicScore,
  recentTopicStruggles = [],
}) {
  const recommendedNext = CONCEPT_PROGRESSION[topic] || [];
  const messages = [];

  if (verdict !== 'Accepted') {
    messages.push(`You struggled with this ${topic} problem.`);
    if (recentTopicStruggles.includes(topic)) {
      messages.push(`We noticed you've also struggled with ${topic} in previous submissions.`);
    }
    if (recommendedNext.length > 0) {
      messages.push(`Recommended next concepts: ${recommendedNext.join(', ')}.`);
    }
    return { messages, recommendedNext };
  }

  if (timeTakenMs != null) {
    const minutes = Math.max(1, Math.round(timeTakenMs / 60000));
    messages.push(`You solved this problem in ${minutes} minute${minutes === 1 ? '' : 's'}.`);

    if (averageTimeMs) {
      const avgMinutes = Math.max(1, Math.round(averageTimeMs / 60000));
      messages.push(`The average solving time is ${avgMinutes} minute${avgMinutes === 1 ? '' : 's'}.`);
      messages.push(timeTakenMs < averageTimeMs ? 'Excellent speed.' : 'Take your time - understanding beats speed.');
    }
  }

  if (memoryKb && averageMemoryKb) {
    if (memoryKb > averageMemoryKb * 1.2) {
      messages.push('However, your memory usage is higher than average.');
      messages.push('Consider using a hash map instead of repeated linear scans.');
    } else {
      messages.push('Your memory usage is right in line with other solutions.');
    }
  }

  if (topicScore < 40) {
    messages.push(`Your ${topic} skills are still developing - keep practicing.`);
  } else if (topicScore > 75) {
    messages.push(`Strong ${topic} performance.`);
    if (recommendedNext.length > 0) {
      messages.push(`Ready for a challenge? Try: ${recommendedNext.join(', ')}.`);
    }
  }

  return { messages, recommendedNext };
}
