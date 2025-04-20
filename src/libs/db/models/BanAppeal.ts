import mongoose from "mongoose";

const comment = {
  user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, maxlength: [500, "Comment can not be more than 500 characters"] },
  createdAt: { type: Date, default: Date.now },
} as const;

export type Comment = mongoose.InferRawDocType<typeof comment> & { _id: string; user: string };

const schemaDefinition = {
  banIssue: { type: mongoose.Schema.ObjectId, ref: "BanIssue", required: true },
  description: {
    type: String,
    required: true,
    maxlength: [500, "Description can not be more than 500 characters"],
  },
  createdAt: { type: Date, default: Date.now },
  resolveStatus: { type: String, enum: ["pending", "denied", "resolved"], default: "pending" },
  resolvedAt: { type: Date },
  comment: [new mongoose.Schema<Comment>(comment)],
} as const;

export type BanAppealType = mongoose.InferRawDocType<typeof schemaDefinition> & {
  _id: string;
  banIssue: string;
};

const BanAppeal = new mongoose.Schema<BanAppealType>(schemaDefinition, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true, flattenObjectIds: true },
});

const createModel = () => mongoose.model("BanAppeal", BanAppeal);
export const getModel = () =>
  (mongoose.models?.BanAppeal as ReturnType<typeof createModel> | undefined) || createModel();
export default getModel();
