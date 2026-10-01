import mongoose from 'mongoose';

// Records that a player opened a problem's editorial. Scoring reads it
// (server-side, not trusted from the client): an accepted solution after
// reading the editorial earns fewer points.
const editorialViewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  },
  { timestamps: true }
);

editorialViewSchema.index({ user: 1, problem: 1 }, { unique: true });

const EditorialView = mongoose.model('EditorialView', editorialViewSchema);

export default EditorialView;
