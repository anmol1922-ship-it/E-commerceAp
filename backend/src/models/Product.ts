import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp: number;
  category: "jar" | "case";
  size: string;
  bottlesPerCase: number;
  imageUrl: string;
  images: string[];
  stock: number;
  isAvailable: boolean;
  popularity: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    category: { type: String, enum: ["jar", "case"], required: true },
    size: { type: String, required: true },
    bottlesPerCase: { type: Number, default: 1 },
    imageUrl: { type: String, default: "/images/bisleri/default.svg" },
    images: [{ type: String }],
    stock: { type: Number, required: true, default: 100 },
    isAvailable: { type: Boolean, default: true },
    popularity: { type: Number, default: 0 },
  },
  { timestamps: true },
);

productSchema.index({ slug: 1 });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ isAvailable: 1 });

export const Product = mongoose.model<IProduct>("Product", productSchema);
