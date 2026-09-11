import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { prisma } from "../config/db";
import { config } from "../config";
import { AuthRequest } from "../middleware/auth";
import { hashPassword, comparePassword } from "../models/User";
import { getDefaultCustomerType } from "../services/pricingService";

const publicUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  customerType: user.customerType
    ? {
        id: user.customerType.id,
        code: user.customerType.code,
        name: user.customerType.name,
      }
    : null,
});

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpire as string,
  } as jwt.SignOptions);
};

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await hashPassword(password);
    const endUserType = await getDefaultCustomerType();
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "customer",
        customerTypeId: endUserType.id,
      },
      include: { customerType: true },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { customerType: true },
    });

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        customerType: {
          select: { id: true, code: true, name: true },
        },
        addresses: true,
        createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      success: true,
      user: {
        ...publicUser(user),
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        customerType: {
          select: { id: true, code: true, name: true },
        },
      },
    });
    res.json({ success: true, user: publicUser(user) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addAddress = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { street, area, city, pincode } = req.body;
    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        street,
        area,
        city: city || "Vasai",
        pincode,
        isDefault: false,
      },
    });

    res.json({ success: true, address });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const { email } = req.user?.id ? req.body : req.body; // Use email from request body if user is not authenticated
    console.log("Delete account request received for email:", email);
    if (!email) {
      return res.status(400).json({
        message: "Email is  required.",
      });
    }
    const user = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });
    if (!user) {
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    // Verify password
    // const passwordValid = await bcrypt.compare(password, user.password);

    // if (!passwordValid) {
    //   return res.status(401).json({
    //     message: "Invalid email or password.",
    //   });
    // }
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    return res.status(200).json({
      message: "Account deleted successfully.",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
