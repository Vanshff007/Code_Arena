// Runs before every test file's own imports. Sets env vars unconditionally
// (not just as fallbacks) so tests always run against an isolated database
// and never touch whatever real MONGO_URI happens to be in .env - the dev
// database this session seeded 20 real problems into must never be at risk
// of being cleared by a test run.
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/codearena_test';
process.env.JWT_SECRET = 'test_only_jwt_secret_at_least_32_characters_long_for_ci_runs';
process.env.CLIENT_URL = 'http://localhost:5173';
