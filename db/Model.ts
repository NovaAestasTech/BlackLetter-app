import mongoose from "mongoose";
const { Schema } = mongoose;

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
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },

  members: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
      email: { type: String, required: true },
      role: {
        type: String,

        enum: ["owner", "member"],
        default: "member",
      },
      joinedAt: { type: Date, default: Date.now },
    },
  ],

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

const userSchema = new Schema(
  {
    Email: {
      type: String,
      required: true,
      unique: true,
    },
    Password: {
      type: String,
      required: true,
    },
    editableDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    workspaces: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WorkSpaces",
      },
    ],
  },
  { timestamps: true },
);
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
const PermissionRequestSchema = new Schema(
  {
    requester: {
      id: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    documentId: { type: String },
    documentTitle: { type: String, required: true },
    requestedAccess: {
      type: String,
      enum: ["read", "edit"],
      default: "read",
    },
    message: { type: String, maxlength: 500 },
    status: {
      type: String,
      enum: ["pending", "approved", "denied"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);
PermissionRequestSchema.index({ ownerId: 1, status: 1 });
const WorkSpaces =
  mongoose.models.WorkSpaces || mongoose.model("WorkSpaces", WorkspaceSchema);
export default WorkSpaces;
const Documents =
  mongoose.models.Documents || mongoose.model("Documents", documentSchema);
export { Documents };
const Users = mongoose.models.Users || mongoose.model("Users", userSchema);
export { Users };
const PermissionRequest =
  mongoose.models.PermissionRequest ||
  mongoose.model("PermissionRequest", PermissionRequestSchema);
export { PermissionRequest };
