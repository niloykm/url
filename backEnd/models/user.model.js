import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
    },
    name: {
      type: String,
    },
    tier: {
      type: String,
      enum: ["free", "paid"],
      default: "free",
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    workspaces: [
      {
        type: Schema.Types.ObjectId,
        ref: "Workspace",
      },
    ],
  },
  { timestamps: true }
);

const User = model("User", userSchema);
export default User;
