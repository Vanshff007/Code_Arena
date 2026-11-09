import { Link } from 'react-router-dom';
import PageHeader from '../../shared/ui/PageHeader';
import { GUIDE_SECTIONS } from './guide';

function GuidePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader title="Beginner's guide">Everything you need for your first practice problem and your first battle.</PageHeader>

      <ol className="mt-8 grid gap-px border border-rule bg-rule md:grid-cols-2">
        {GUIDE_SECTIONS.map((section, i) => (
          <li key={section.title} className="flex flex-col bg-panel p-6">
            <span className="font-tight text-4xl font-black text-muted">{i + 1}</span>
            <h2 className="mt-2 text-lg font-bold">{section.title}</h2>
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-[15px] text-muted">
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            {section.link && (
              <Link to={section.link.to} className="mt-auto pt-4 text-sm font-semibold text-p1 hover:underline">
                {section.link.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </main>
  );
}

export default GuidePage;
