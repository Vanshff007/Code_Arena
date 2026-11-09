import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { GUIDE_SECTIONS } from './guide';

const appSource = readFileSync(new URL('../../App.jsx', import.meta.url), 'utf8');

describe('beginner guide', () => {
  it('has titled sections with at least one point each', () => {
    expect(GUIDE_SECTIONS.length).toBeGreaterThan(0);
    for (const s of GUIDE_SECTIONS) {
      expect(s.title).toBeTruthy();
      expect(s.points.length).toBeGreaterThan(0);
    }
  });

  it('links only to routes the app has', () => {
    for (const { link } of GUIDE_SECTIONS.filter((s) => s.link)) {
      expect(appSource).toContain(`'${link.to}'`);
    }
  });

  it('is a public route', () => {
    expect(appSource).toMatch(/<Route path="\/guide"/);
  });
});
