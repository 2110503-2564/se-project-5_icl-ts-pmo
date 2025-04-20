import mongoose from "mongoose";

const schemaDefinition = {
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: [50, "Name can not be more than 50 characters"],
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [250, "Description can not be more than 50 characters"],
  },
  address: { type: String, required: true },
  province: { type: String, required: true },
  district: { type: String, required: true },
  subDistrict: { type: String, required: true },
  postalcode: { type: String, required: true, maxlength: [5, "Postal code can not be more than 5 digits"] },
  openTime: { type: Date, required: true },
  closeTime: { type: Date, required: true },
  tel: { type: String, required: false },
  picture: { type: String, required: false },
  owner: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
} as const;

export type CWS = mongoose.InferRawDocType<typeof schemaDefinition> & {
  _id: string;
  openTime: string;
  closeTime: string;
  owner: string;
};
const CoworkingSpaceSchema = new mongoose.Schema<CWS>(schemaDefinition, {
  id: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true, flattenObjectIds: true },
});

const createModel = () => mongoose.model("CoworkingSpace", CoworkingSpaceSchema);
export const getModel = () =>
  (mongoose.models?.CoworkingSpace as ReturnType<typeof createModel> | undefined) || createModel();
export default getModel();
