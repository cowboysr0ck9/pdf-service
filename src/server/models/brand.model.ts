import mongoose from "mongoose";
import z from "zod";

const Schema = mongoose.Schema;

const brandModel = new Schema(
  {
    name: String,
    description: String,
  },
  { collection: "brands", id: true }
);

export const Brand = mongoose.model("Brand", brandModel);

export const brandSchemaValidator = z.object({
  name: z.string().default("Enter brand name here."),
  description: z.string().max(180),
});
