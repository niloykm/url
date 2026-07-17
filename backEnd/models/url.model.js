import { model, Schema } from "mongoose";
import { nanoid } from "nanoid";

const urlSchema = new Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    customUrl: {
      type: String,
      unique: true,
      sparse: true,
    },
    defaultId: {
      type: String,
      default: () => nanoid(6),
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
    },
    password: {
      type: String, // Hashed password
    },
    expiresAt: {
      type: Date,
    },
    clickLimit: {
      type: Number,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    customDomain: {
      type: String,
    },
    // Preview overrides (Open Graph)
    title: String,
    description: String,
    imageUrl: String,
  },
  { timestamps: true }
);

const URL = model("URL", urlSchema);
export default URL;
