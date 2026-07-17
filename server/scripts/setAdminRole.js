// One-off CLI utility to promote a user to admin. There is deliberately no
// HTTP endpoint for this - exposing "become admin" over the API, even
// behind validation, is a privilege-escalation risk not worth taking.
//
// Usage: npm run make-admin -- user@example.com
import mongoose from 'mongoose';
import env from '../config/env.js';
import User from '../models/User.model.js';

const email = process.argv[2];
if (!email) {
  console.error('Usage: npm run make-admin -- <email>');
  process.exit(1);
}

await mongoose.connect(env.mongoUri);

const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });

if (!user) {
  console.error(`No user found with email ${email}`);
} else {
  console.log(`${user.username} (${user.email}) is now an admin`);
}

await mongoose.disconnect();
