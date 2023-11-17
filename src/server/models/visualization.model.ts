import mongoose from "mongoose";
import z from "zod";

const Schema = mongoose.Schema;

const visualizationSchema = new Schema(
  {
    name: String,
    description: String,
  },
  {
    collection: "visualizations",
  }
);

export const Visualization = mongoose.model(
  "Visualization",
  visualizationSchema
);

export const visualizationValidator = z.object({
  name: z.string().trim().default("Enter Visualization name here."),
  description: z.string().max(180),
});
