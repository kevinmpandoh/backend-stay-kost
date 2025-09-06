import mongoose, { Schema, Document } from "mongoose";

export interface IRule extends Document {
  name: string;
}

const RuleSchema: Schema = new Schema<IRule>({
  name: { type: String, required: true },
});

export const Rule = mongoose.model<IRule>("Rule", RuleSchema);
