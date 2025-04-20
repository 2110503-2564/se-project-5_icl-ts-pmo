import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const schemaDefinition = {
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please add a valid email",
    ],
  },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: { type: Date, default: Date.now },
} as const;

export type UserType = mongoose.InferRawDocType<typeof schemaDefinition> & { _id: string };
const UserSchema = new mongoose.Schema<UserType>(schemaDefinition, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true, flattenObjectIds: true },
});

//Encrypt password using bcrypt
UserSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const createModel = () => mongoose.model("User", UserSchema);
export const getModel = () =>
  (mongoose.models?.User as ReturnType<typeof createModel> | undefined) || createModel();
export default getModel();
