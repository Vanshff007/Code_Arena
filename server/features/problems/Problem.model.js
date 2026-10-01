import mongoose from 'mongoose';
import { generateStarterCode, validateSignature, TYPE_NAMES } from '../execution/harness/index.js';

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

// Function-style problems (LeetCode format) have a signature: players write
// only a Solution class and test cases hold one JSON value per parameter
// per line. Problems without a signature are full-program problems (read
// stdin, print stdout) - kept so older admin-made problems still work.
const paramSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true, enum: TYPE_NAMES },
  },
  { _id: false }
);

const signatureSchema = new mongoose.Schema(
  {
    functionName: { type: String, required: true },
    params: { type: [paramSchema], default: undefined },
    returnType: { type: String, required: true, enum: TYPE_NAMES },
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
    signature: {
      type: signatureSchema,
      default: undefined,
      validate: {
        validator: (sig) => !sig || validateSignature(sig.toObject ? sig.toObject() : sig).length === 0,
        message: (props) => validateSignature(props.value?.toObject ? props.value.toObject() : props.value).join('; '),
      },
    },
    // How to solve it: shown after a battle ends, or in practice when the
    // player chooses to (that lowers their points - see EditorialView).
    // Never sent with the problem itself.
    editorial: {
      type: {
        approach: { type: String, default: '' },
        solutions: {
          cpp: { type: String, default: '' },
          java: { type: String, default: '' },
          python: { type: String, default: '' },
        },
      },
      select: false,
      default: undefined,
    },
    // 'any' accepts the returned arrays in any order (e.g. 3Sum triplets).
    outputOrder: { type: String, enum: ['exact', 'any'], default: 'exact' },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Starter code is generated from the signature on read, so changing a
// signature never leaves stale templates behind. Undefined (and so left out
// of JSON) for full-program problems and for list queries that don't select
// the signature.
problemSchema.virtual('starterCode').get(function starterCode() {
  return this.signature?.functionName ? generateStarterCode(this.signature.toObject()) : undefined;
});

problemSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.id;
    delete ret.hiddenTestCases;
    delete ret.editorial;
    delete ret.__v;
    return ret;
  },
});

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
