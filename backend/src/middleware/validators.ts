import { body } from "express-validator";

export const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const addressValidator = [
  body("street").trim().notEmpty().withMessage("Street is required"),
  body("area").trim().notEmpty().withMessage("Area is required"),
  body("pincode")
    .trim()
    .notEmpty()
    .withMessage("Pincode is required")
    .matches(/^40120[1-9]|4012[1-9][0-9]|401[3-5][0-9]{2}/)
    .withMessage(
      "Delivery available only in Vasai area pincodes (401201-401599)",
    ),
];

export const orderValidator = [
  body("items").isArray({ min: 1 }).withMessage("At least one item required"),
  body("shippingAddress.street")
    .trim()
    .notEmpty()
    .withMessage("Street is required"),
  body("shippingAddress.area")
    .trim()
    .notEmpty()
    .withMessage("Area is required"),
  body("shippingAddress.pincode")
    .trim()
    .notEmpty()
    .withMessage("Pincode is required"),
  body("deliverySlot")
    .trim()
    .notEmpty()
    .withMessage("Delivery slot is required"),
  body("paymentMethod")
    .isIn(["razorpay", "cod"])
    .withMessage("Invalid payment method"),
];
