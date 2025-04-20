import mongoose from "mongoose";
import { getModel as createUserModel } from "./models/User";
import { getModel as createCoworkingSpaceModel } from "./models/CoworkingSpace";
import { getModel as createReservationModel } from "./models/Reservation";
import { getModel as createBanIssueModel } from "./models/BanIssue";
import { getModel as createBanAppealModel } from "./models/BanAppeal";

declare global {
  // eslint-disable-next-line no-var
  var instance: { connection?: typeof mongoose; promise?: Promise<typeof mongoose> };
}

let cached = global.instance;

if (!cached) {
  cached = global.instance = { connection: undefined, promise: undefined };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI!;
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  if (!cached.connection) {
    if (!cached.promise) {
      const opts = { bufferCommands: false };
      cached.promise = mongoose
        .set("strictQuery", true)
        .connect(MONGODB_URI, opts)
        .then((mongoose) => mongoose);
    }
    try {
      cached.connection = await cached.promise;
      console.log("connected to the database");
      createUserModel();
      createCoworkingSpaceModel();
      createReservationModel();
      createBanIssueModel();
      createBanAppealModel();
    } catch (err) {
      cached.promise = undefined;
      console.error(err);
      // throw err;
    }
  }

  return cached.connection;
}

export default dbConnect;
