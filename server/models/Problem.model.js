import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
  },
  { _id: false }
);

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      unique: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: [true, 'Difficulty is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    constraints: [{ type: String }],
    examples: {
      type: [exampleSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one example is required',
      },
    },
    publicTestCases: {
      type: [testCaseSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one public test case is required',
      },
    },
    // Never returned by default, and stripped again in toJSON below - the
    // "first correct submission wins" mechanic only works if these stay
    // secret. The execution engine (Step 7) reads them directly via
    // Problem.findById(id).select('+hiddenTestCases') in server code; they
    // must never be serialized into an HTTP response, including to admins.
    hiddenTestCases: {
      type: [testCaseSchema],
      select: false,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one hidden test case is required',
      },
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

problemSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.hiddenTestCases;
    delete ret.__v;
    return ret;
  },
});

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
