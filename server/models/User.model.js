import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username must be at most 20 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned by default on queries (extra layer on top of toJSON below)
    },
    profilePicture: {
      type: String,
      default: '', // frontend falls back to a generated avatar when empty
    },
    rating: {
      type: Number,
      default: 1000, // starting ELO; matchmaking (later step) adjusts this after each battle
    },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    totalBattles: { type: Number, default: 0 },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

// Hash the password before saving, but only when it's new or changed.
// Without the isModified guard, updating unrelated fields later (e.g.
// incrementing `wins` after a battle) would re-hash an already-hashed
// password and permanently break the user's login.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Used by the login controller to check a plaintext password against the
// stored hash. Defined as an instance method so it always has `this.password`
// available, even though the schema field is select: false by default.
userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Strips sensitive/internal fields whenever a user document is serialized
// (res.json(user), JSON.stringify(user), etc.), so a password hash can never
// accidentally leak in an API response even if a controller forgets to
// exclude it manually.
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

export default User;
