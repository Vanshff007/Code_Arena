import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSkillProfile, getXP, getRecommendations, getFeedback } from './skillService';
import { weakTopics, strongTopics, xpPercent, WEAK_BELOW, STRONG_ABOVE } from './skills';
import SkillRadar from './SkillRadar';
import DifficultyMeter from '../problems/DifficultyMeter';
import LeetCodePractice from '../leetcode/LeetCodePractice';
import PageHeader, { SectionTitle, EmptyState, ErrorNote } from '../../shared/ui/PageHeader';
import { ButtonLink } from '../../shared/ui/Button';
import { PageSpinner } from '../../shared/ui/Spinner';

function ScoreBar({ topic, score, color }) {
  return (
    <li>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{topic}</span>
        <span className="font-tight text-base font-bold">{score}</span>
      </div>
      <div className="mt-1 h-1.5 bg-sunk">
        <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </li>
  );
}

function SkillDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getSkillProfile(), getXP(), getRecommendations(), getFeedback()])
      .then(([skillRes, xpRes, recRes, feedbackRes]) =>
        setData({
          scores: skillRes.data.topicScores,
          xp: xpRes.data.xp,
          recommendations: recRes.data,
          feedback: feedbackRes.data.feedback,
        })
      )
      .catch(() => setError('Could not load your skill profile. Refresh to try again.'));
  }, []);

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <ErrorNote>{error}</ErrorNote>
      </main>
    );
  }
  if (!data) return <PageSpinner label="Loading skill profile" />;

  const { scores, xp, recommendations, feedback } = data;
  const weak = weakTopics(scores);
  const strong = strongTopics(scores);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader title="Skills">
        Built from every submission you make here, plus your LeetCode history if you link it. Scores run from 0 to
        100 per topic.
      </PageHeader>

      <div className="mt-8 grid gap-10 lg:grid-cols-[3fr_2fr]">
        <section className="border border-rule bg-panel p-4 sm:p-6">
          <h2 className="sr-only">Skill radar</h2>
          <SkillRadar scores={scores} />
        </section>

        <div>
          <h2 className="text-lg font-bold">Needs work</h2>
          {weak.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No topic is below {WEAK_BELOW} right now.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {weak.map(([t, s]) => (
                <ScoreBar key={t} topic={t} score={s} color="bg-p2" />
              ))}
            </ul>
          )}

          <h2 className="mt-8 text-lg font-bold">Strongest</h2>
          {strong.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Get a topic above {STRONG_ABOVE} to see it here.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {strong.map(([t, s]) => (
                <ScoreBar key={t} topic={t} score={s} color="bg-p1" />
              ))}
            </ul>
          )}
        </div>
      </div>

      <SectionTitle>Practice next on CodeArena</SectionTitle>
      {recommendations.reason && <p className="mb-3 max-w-2xl text-sm text-muted">{recommendations.reason}</p>}
      {recommendations.problems.length === 0 ? (
        <EmptyState title="Nothing to recommend yet" action={<ButtonLink to="/problems" variant="secondary">Browse all problems</ButtonLink>}>
          No problems in the bank match {recommendations.concepts?.join(', ') || 'your profile'} yet.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-rule border-y border-rule">
          {recommendations.problems.map((p) => (
            <li key={p._id}>
              <Link to={`/practice/${p._id}`} className="group flex items-center justify-between gap-4 px-1 py-3 hover:bg-panel">
                <span className="min-w-0">
                  <span className="block truncate font-semibold group-hover:text-p1">{p.title}</span>
                  <span className="block truncate text-sm text-muted">{p.tags?.join(', ')}</span>
                </span>
                <DifficultyMeter difficulty={p.difficulty} />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <LeetCodePractice />

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <SectionTitle>Topic levels</SectionTitle>
          {xp.length === 0 ? (
            <p className="text-sm text-muted">An accepted submission earns XP in each of the problem's topics.</p>
          ) : (
            <ul className="space-y-4">
              {xp.map((t) => (
                <li key={t.topic}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-semibold">{t.topic}</span>
                    <span className="text-sm text-muted">
                      Level <span className="font-tight text-lg font-black text-ink">{t.level}</span>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 bg-sunk">
                    <div className="h-full bg-ink" style={{ width: `${xpPercent(t)}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {t.xpIntoLevel} of {t.xpForNextLevel} XP to level {t.level + 1}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <SectionTitle>Coach notes</SectionTitle>
          {feedback.length === 0 ? (
            <p className="text-sm text-muted">Submit a solution and you'll get notes on speed, memory and topics here.</p>
          ) : (
            <ul className="space-y-4">
              {feedback.map((f) => (
                <li key={f._id} className="border-l-2 border-ink pl-4">
                  <p className="font-semibold">{f.problem?.title}</p>
                  <div className="mt-1 space-y-0.5 text-sm text-muted">
                    {f.messages.map((m, i) => (
                      <p key={i}>{m}</p>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default SkillDashboardPage;
