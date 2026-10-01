import mongoose from 'mongoose';

// One document per pair of users: a pending request (requester -> recipient)
// or an accepted friendship. `pair` is the two ids sorted and joined, so a
// pair can never have two documents, whoever asked first.
const friendshipSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
    pair: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

friendshipSchema.index({ requester: 1, status: 1 });
friendshipSchema.index({ recipient: 1, status: 1 });

export function pairKey(a, b) {
  return [String(a), String(b)].sort().join(':');
}

const Friendship = mongoose.model('Friendship', friendshipSchema);

export default Friendship;
