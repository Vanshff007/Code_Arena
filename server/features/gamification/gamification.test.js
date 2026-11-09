import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import Match from '../battles/Match.model.js';
import Problem from '../problems/Problem.model.js';
import { formFromMatches, getRecentForm, FORM_LENGTH } from './form.service.js';

const me = new mongoose.Types.ObjectId();
const other = new mongoose.Types.ObjectId();
const win = { winner: me, isDraw: false };
const loss = { winner: other, isDraw: false };
const draw = { winner: null, isDraw: true };

describe('formFromMatches', () => {
  it('lists the last five results oldest first and counts the win streak', () => {
    // Newest first, as the query returns them.
    const out = formFromMatches([win, win, loss, draw, win, loss, win], me);
    expect(out.form).toEqual(['W', 'D', 'L', 'W', 'W']);
    expect(out.form).toHaveLength(FORM_LENGTH);
    expect(out.streak).toBe(2);
  });

  it('gives an empty form and no streak to a new player', () => {
    expect(formFromMatches([], me)).toEqual({ form: [], streak: 0 });
  });

  it('ends a streak on a draw or a loss, and counts all wins when there is nothing else', () => {
    expect(formFromMatches([draw, win], me).streak).toBe(0);
    expect(formFromMatches([loss], me).streak).toBe(0);
    expect(formFromMatches([win, win, win], me).streak).toBe(3);
  });

  it('compares winner ids as strings', () => {
    expect(formFromMatches([{ winner: String(me), isDraw: false }], me).form).toEqual(['W']);
  });
});

describe('getRecentForm', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });
  beforeEach(async () => {
    await Promise.all([Match.deleteMany({}), Problem.deleteMany({})]);
  });

  it('reads completed matches newest first and skips unfinished ones', async () => {
    const problem = new mongoose.Types.ObjectId();
    const match = (minutesAgo, winner, status = 'completed') =>
      Match.create({
        problem,
        players: [
          { user: me, ratingBefore: 1000 },
          { user: other, ratingBefore: 1000 },
        ],
        status,
        winner,
        durationMs: 1000,
        startedAt: new Date(Date.now() - minutesAgo * 60_000 - 1000),
        endedAt: status === 'completed' ? new Date(Date.now() - minutesAgo * 60_000) : null,
      });
    await match(30, other);
    await match(20, me);
    await match(10, me);
    await match(1, null, 'in_progress');

    const forms = await getRecentForm([String(me), String(other)]);
    expect(forms[String(me)]).toEqual({ form: ['L', 'W', 'W'], streak: 2 });
    expect(forms[String(other)]).toEqual({ form: ['W', 'L', 'L'], streak: 0 });
  });
});
