// Seeds the built-in problem bank from seedData.js.
//
// Usage:
//   npm run seed-problems                # add missing problems, skip existing titles
//   npm run seed-problems -- --update    # also overwrite existing built-in problems
//
// --update replaces the content of problems whose title matches a built-in
// one (keeping their _id, so match history still links to them). Problems
// with other titles - e.g. ones an admin created - are never touched.
import mongoose from 'mongoose';
import env from '../../core/config/env.js';
import Problem from './Problem.model.js';
import User from '../auth/User.model.js';
import { SEED_PROBLEMS } from './seedData.js';

const update = process.argv.includes('--update');

async function seed() {
  await mongoose.connect(env.mongoUri);

  const owner = await User.findOne({ role: 'admin' }).select('_id');

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const p of SEED_PROBLEMS) {
    const exists = await Problem.findOne({ title: p.title });
    if (!exists) {
      await Problem.create({ ...p, createdBy: owner?._id });
      created += 1;
      console.log(`Created "${p.title}" (${p.difficulty})`);
    } else if (update) {
      // Fields not in the seed (e.g. an old signature-less format) are
      // reset to the seed's values; outputOrder defaults to exact.
      exists.set({ outputOrder: 'exact', ...p });
      await exists.save();
      updated += 1;
      console.log(`Updated "${p.title}"`);
    } else {
      skipped += 1;
    }
  }

  console.log(`\nDone. Created ${created}, updated ${updated}, skipped ${skipped}.`);
  if (skipped > 0) console.log('Run with -- --update to overwrite existing built-in problems.');
  console.log(`Total problems in DB: ${await Problem.countDocuments()}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
