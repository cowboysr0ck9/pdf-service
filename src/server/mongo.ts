import mongoose from "mongoose";
/**
 * Set to Node.js native promises
 * Per https://mongoosejs.com/docs/promises.html
 */
mongoose.Promise = global.Promise;

export function safeConnect() {
  mongoose.set("debug", true);
  return mongoose.connect(`${process.env.MONGO_URI}`);
}

export default mongoose;
