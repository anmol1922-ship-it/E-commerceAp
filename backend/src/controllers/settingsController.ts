import { Request, Response } from "express";
import { prisma } from "../config/db";

const SETTINGS_ID = "app_settings";

const getOrCreateSettings = async () => {
  let settings = await prisma.appSettings.findUnique({
    where: { id: SETTINGS_ID },
  });
  if (!settings) {
    settings = await prisma.appSettings.create({
      data: { id: SETTINGS_ID },
    });
  }
  return settings;
};

export const getPublicSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({
      success: true,
      data: {
        gstRate: settings.gstRate,
        deliveryCharge: settings.deliveryCharge,
        freeDeliveryThreshold: settings.freeDeliveryThreshold,
        minimumOrderAmount: settings.minimumOrderAmount,
        servicablePincodes: settings.servicablePincodes,
        deliverySlots: settings.deliverySlots,
        businessName: settings.businessName,
        supportPhone: settings.supportPhone,
        supportEmail: settings.supportEmail,
        businessHoursStart: settings.businessHoursStart,
        businessHoursEnd: settings.businessHoursEnd,
        privacyPolicyUrl: settings.privacyPolicyUrl,
        termsUrl: settings.termsUrl,
        aboutText: settings.aboutText,
        appVersion: settings.appVersion,
        maintenanceMode: settings.maintenanceMode,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching settings",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAdminSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching settings",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const allowedFields = [
      "gstRate",
      "deliveryCharge",
      "freeDeliveryThreshold",
      "minimumOrderAmount",
      "servicablePincodes",
      "deliverySlots",
      "businessName",
      "supportPhone",
      "supportEmail",
      "businessHoursStart",
      "businessHoursEnd",
      "privacyPolicyUrl",
      "termsUrl",
      "aboutText",
      "appVersion",
      "maintenanceMode",
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    // Validate numeric fields
    if (
      updateData.gstRate !== undefined &&
      (updateData.gstRate < 0 || updateData.gstRate > 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "GST rate must be between 0 and 1",
      });
    }
    if (
      updateData.deliveryCharge !== undefined &&
      updateData.deliveryCharge < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Delivery charge cannot be negative",
      });
    }
    if (
      updateData.freeDeliveryThreshold !== undefined &&
      updateData.freeDeliveryThreshold < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Free delivery threshold cannot be negative",
      });
    }

    await getOrCreateSettings();

    const settings = await prisma.appSettings.update({
      where: { id: SETTINGS_ID },
      data: updateData,
    });

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating settings",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
