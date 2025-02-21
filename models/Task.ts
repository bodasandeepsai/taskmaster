import mongoose from 'mongoose';
import { IUser } from "./User";

export interface ITask extends mongoose.Document {
  title: string;
  description: string;
  assignee: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  status: "pending" | "in-progress" | "completed" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  comments: {
    text: string;
    user: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
  attachments: {
    url: string;
    name: string;
  }[];
}

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'blocked'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: { type: Date },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [String],
  comments: [{
    text: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  attachments: [{
    url: String,
    name: String
  }]
}, { timestamps: true });

// Prevent model recompilation error in development
const Task = mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);
export default Task;
