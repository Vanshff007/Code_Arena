import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radar, TrendingDown, Sparkles, MessageSquareText } from 'lucide-react';
import { getSkillProfile, getXP, getRecommendations, getFeedback } from '../services/skillService';
import { DIFFICULTY_TONE } from '../utils/starterCode';
import SkillRadar from '../components/SkillRadar';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

function SkillDashboard() {
  const [skillProfile, setSkillProfile] = useState(null);
  const [xp, setXp] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getSkillProfile(), getXP(), getRecommendations(), getFeedback()])
      .then(([skillRes, xpRes, recRes, feedbackRes]) => {
        setSkillProfile(skillRes.data);
        setXp(xpRes.data.xp);
        setRecommendations(recRes.data);
        setFeedback(feedbackRes.data.feedback);
      })
      .catch(() => setError('Failed to load your skill dashboard.'));
  }, []);

  if (error) {
    return <main className="mx-auto max-w-md px-6 py-24 text-center text-error">{error}</main>;
  }

  if (!skillProfile || !xp || !recommendations || !feedback) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Spinner className="size-6 text-accent" />
      </div>
    );
  }

  const weakTopics = Object.entries(skillProfile.topicScores)
    .filter(([, score]) => score < 40)
    .sort((a, b) => a[1] - b[1]);

  return (
    <main className="animate-fade-in mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground">Skill Dashboard</h1>
      <p className="mt-1 text-sm text-muted">
        Your strengths, weak spots, and what to practice next - built from your LeetCode sync and every
        CodeArena submission.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
            <Radar className="size-4" />
            Skill Radar
          </h2>
          <SkillRadar scores={skillProfile.topicScores} />
        </Card>

        <Card>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
            <TrendingDown className="size-4" />
            Weak Areas
          </h2>
          {weakTopics.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No clear weak spots yet - keep practicing!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {weakTopics.map(([topic, score]) => (
                <div key={topic}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{topic}</span>
                    <span className="text-muted">{score}/100</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full bg-error" style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <h2 className="mt-8 mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Topic XP</h2>
      {xp.length === 0 ? (
        <Card className="py-8 text-center text-sm text-muted">
          Solve an accepted submission to start earning topic XP.
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {xp.map((t) => (
            <Card key={t.topic} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{t.topic}</span>
                <Badge tone="success">Level {t.level}</Badge>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.min(100, (t.xpIntoLevel / t.xpForNextLevel) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted">
                {t.xpIntoLevel}/{t.xpForNextLevel} XP to level {t.level + 1}
              </span>
            </Card>
          ))}
        </div>
      )}

      <h2 className="mt-8 mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
        <Sparkles className="size-4" />
        Recommended Problems
      </h2>
      <p className="mb-3 text-sm text-muted">{recommendations.reason}</p>
      {recommendations.problems.length === 0 ? (
        <Card className="py-8 text-center text-sm text-muted">
          No matching problems in the bank yet for {recommendations.concepts.join(', ') || 'your level'}.
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {recommendations.problems.map((p) => (
            <Link key={p._id} to={`/practice/${p._id}`}>
              <Card hover className="flex items-center justify-between py-3">
                <span className="text-sm text-foreground">{p.title}</span>
                <Badge tone={DIFFICULTY_TONE[p.difficulty]}>{p.difficulty}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <h2 className="mt-8 mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
        <MessageSquareText className="size-4" />
        Recent Feedback
      </h2>
      {feedback.length === 0 ? (
        <Card className="py-8 text-center text-sm text-muted">
          Submit a solution to get your first coaching feedback.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {feedback.map((f) => (
            <Card key={f._id}>
              <p className="mb-2 text-sm font-medium text-foreground">{f.problem?.title}</p>
              <div className="space-y-0.5 text-sm text-muted">
                {f.messages.map((m, i) => (
                  <p key={i}>{m}</p>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

export default SkillDashboard;
