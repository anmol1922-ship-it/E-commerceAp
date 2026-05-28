import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: {
    street: string;
    area: string;
    city: string;
    pincode: string;
  };
  deliverySlot: string;
  paymentMethod: "razorpay" | "cod";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  subtotal: number;
  gst: number;
  deliveryCharge: number;
  totalAmount: number;
  status: "placed" | "confirmed" | "dispatched" | "delivered" | "cancelled";
  trackingInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, default: "Vasai" },
      pincode: { type: String, required: true },
    },
    deliverySlot: { type: String, required: true },
    paymentMethod: { type: String, enum: ["razorpay", "cod"], required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    subtotal: { type: Number, required: true },
    gst: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["placed", "confirmed", "dispatched", "delivered", "cancelled"],
      default: "placed",
    },
    trackingInfo: { type: String },
  },
  { timestamps: true },
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

export const Order = mongoose.model<IOrder>("Order", orderSchema);
