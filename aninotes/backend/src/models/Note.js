import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title must be 150 characters or fewer'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, 
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Note', noteSchema);
