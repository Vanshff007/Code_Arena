import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'fs';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js';

const readVersion = (relPath) => JSON.parse(readFileSync(new URL(relPath, import.meta.url), 'utf8')).version;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('health', () => {
  it('reports the server as up with a connected database', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.db).toBe('connected');
    expect(typeof res.body.uptime).toBe('number');
  });

  it('returns the server package version', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.version).toBe(readVersion('../../package.json'));
  });

  it('returns 404 JSON for an unknown API route', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// The version rule (docs/contributing.md): every committed change bumps the
// version, and client and server always ship the same number.
describe('version rule', () => {
  const server = readVersion('../../package.json');
  const client = readVersion('../../../client/package.json');

  it('uses MAJOR.MINOR.PATCH', () => {
    expect(server).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('keeps client and server versions in sync', () => {
    expect(client).toBe(server);
  });

  it('keeps package-lock.json versions in sync with package.json', () => {
    expect(readVersion('../../package-lock.json')).toBe(server);
    expect(readVersion('../../../client/package-lock.json')).toBe(client);
  });
});
