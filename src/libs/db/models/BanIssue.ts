import mongoose from "mongoose";

const schemaDefinition = {
  user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  admin: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, maxlength: [50, "Title can not be more than 50 characters"] },
  description: {
    type: String,
    required: true,
    maxlength: [500, "Description can not be more than 500 characters"],
  },
  createdAt: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  isResolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
} as const;

export type BanIssueType = mongoose.InferRawDocType<typeof schemaDefinition> & {
  _id: string;
  user: string;
  admin: string;
};

const BanIssueSchema = new mongoose.Schema<BanIssueType>(schemaDefinition, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true, flattenObjectIds: true },
});

const createModel = () => mongoose.model("BanIssue", BanIssueSchema);
export const getModel = () =>
  (mongoose.models?.BanIssue as ReturnType<typeof createModel> | undefined) || createModel();
export default getModel();
