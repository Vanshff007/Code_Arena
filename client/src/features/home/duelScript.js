// Script for the landing page's mock duel. Everything on screen is derived
// from elapsed time by demoFrame(), so the animation is a pure function
// (tested in home.test.js) and the component only has to tick a clock.

export const DEMO_PROBLEM = 'Maximum Subarray Sum';
export const DEMO_TOTAL_CASES = 10;

export const LEFT = {
  name: 'ana_k',
  rating: 1482,
  language: 'Python',
  code: [
    'def solve():',
    '    n = int(input())',
    '    a = list(map(int, input().split()))',
    '    best = cur = a[0]',
    '    for x in a[1:]:',
    '        cur = max(x, cur + x)',
    '        best = max(best, cur)',
    '    print(best)',
    '',
    'solve()',
  ].join('\n'),
};

export const RIGHT = {
  name: 'rgupta',
  rating: 1519,
  language: 'C++',
  code: [
    'int main() {',
    '    int n; cin >> n;',
    '    vector<long long> a(n);',
    '    for (auto &x : a) cin >> x;',
    '    long long best = 0, cur = 0;',
    '    for (auto x : a) {',
    '        cur = max(0LL, cur + x);',
    '        best = max(best, cur);',
    '    }',
  ].join('\n'),
};

// Milliseconds.
export const TIMELINE = {
  rightSubmit: 5600, // rgupta submits first and misses the all-negative case
  leftSubmit: 8800, // ana_k submits and is accepted
  end: 13000, // hold the result, then loop
};

const CLOCK_START_MS = (9 * 60 + 42) * 1000;
const CLOCK_SPEED = 9; // the demo clock runs 9x real time

function typed(code, t, typeUntil) {
  const n = Math.round(Math.min(1, t / typeUntil) * code.length);
  return code.slice(0, n);
}

export function demoFrame(rawT) {
  const t = Math.max(0, rawT) % TIMELINE.end;
  const frozenAt = Math.min(t, TIMELINE.leftSubmit);

  const right =
    t >= TIMELINE.rightSubmit ? { passed: 6, total: DEMO_TOTAL_CASES, verdict: 'Wrong Answer' } : null;
  const left = t >= TIMELINE.leftSubmit ? { passed: 10, total: DEMO_TOTAL_CASES, verdict: 'Accepted' } : null;

  return {
    leftCode: typed(LEFT.code, t, TIMELINE.leftSubmit - 600),
    rightCode: typed(RIGHT.code, t, TIMELINE.rightSubmit - 400),
    left,
    right,
    // The clock stops when the battle is decided.
    clockMs: CLOCK_START_MS - frozenAt * CLOCK_SPEED,
    winner: left ? 'left' : null,
  };
}

// The last frame, shown as a still picture when motion is reduced.
export const FINAL_FRAME = demoFrame(TIMELINE.end - 1);
