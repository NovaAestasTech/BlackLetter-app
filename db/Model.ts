import mongoose from "mongoose";
import { Schema } from "mongoose";
const WorkspaceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  owner: {
    type: String,
    required: true,
  },
  members: {
    type: [String],
    default: [],
  },
  sharewith: {
    type: [String],
    default: [],
  },
  documents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Documents",
    },
  ],
  lastModified: {
    type: String,
    default: Date.now,
  },
});

const documentSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
    required: true,
  },
  versions: {
    type: [String],
  },
  activeUsers: {
    type: [String],
  },
  sharedWith: {
    type: [String],
  },
  fileType: {
    type: String,
    required: true,
  },
  originalFileName: {
    type: String,
  },
  fileSize: {
    type: String,
  },
  isTemplate: {
    type: Boolean,
  },
  templateId: {
    type: String,
  },
});
const WorkSpaces =
  mongoose.models.WorkSpaces || mongoose.model("WorkSpaces", WorkspaceSchema);
export default WorkSpaces;
const Documents =
  mongoose.models.Documents || mongoose.model("Documents", documentSchema);
export { Documents };
