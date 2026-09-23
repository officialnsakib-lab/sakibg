// models/Category.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentCategory?: mongoose.Types.ObjectId | null; // সাব-ক্যাটাগরির জন্য প্যারেন্ট রেফারেন্স
  isActive: boolean;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String },
  icon: { type: String }, // Lucide icon নাম বা ইমোজি
  parentCategory: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null // যদি null হয় তবে এটি মেইন ক্যাটাগরি, আইডি থাকলে সাব-ক্যাটাগরি
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);