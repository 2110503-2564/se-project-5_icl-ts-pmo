import mongoose from "mongoose";

const schemaDefinition = {
  user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  coworkingSpace: { type: mongoose.Schema.ObjectId, ref: "CoworkingSpace", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  personCount: { type: Number, required: true },
  approvalStatus: { type: String, enum: ["pending", "canceled", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
} as const;

export type ReservationType = mongoose.InferRawDocType<typeof schemaDefinition> & {
  _id: string;
  user: string;
  coworkingSpace: string;
};

const ReservationSchema = new mongoose.Schema<ReservationType>(schemaDefinition, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true, flattenObjectIds: true },
});

const createModel = () => mongoose.model("Reservation", ReservationSchema);
export const getModel = () =>
  (mongoose.models?.Reservation as ReturnType<typeof createModel> | undefined) || createModel();
export default getModel();
