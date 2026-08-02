import { Request, Response } from "express";
import {
  startOfDay,
  endOfDay,
  subMonths,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { prisma } from "../config/db";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

// ============ DASHBOARD CONTROLLERS ============

/**
 * Get all KPI data for dashboard
 */
export const getDashboardKPIs = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);

    // Today's orders
    const ordersToday = await prisma.order.findMany({
      where: {
        createdAt: { gte: dayStart, lte: dayEnd },
        paymentStatus: "paid",
      },
    });

    const ordersTodayCount = ordersToday.length;
    const ordersTodayAmount = ordersToday.reduce(
      (sum, o) => sum + o.totalAmount,
      0,
    );

    // Yesterday comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const ordersYesterday = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay(yesterday),
          lte: endOfDay(yesterday),
        },
        paymentStatus: "paid",
      },
    });

    const ordersYesterdayAmount = ordersYesterday.reduce(
      (sum, o) => sum + o.totalAmount,
      0,
    );
    const ordersTrend =
      ordersYesterdayAmount > 0
        ? Math.round(
            ((ordersTodayAmount - ordersYesterdayAmount) /
              ordersYesterdayAmount) *
              100,
          )
        : 0;

    // Active customers (last 30 days)
    const thirtyDaysAgo = subMonths(today, 1);
    const activeCustomers = await prisma.order.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    // Stock value
    const stockData = await prisma.product.aggregate({
      _sum: {
        stock: true,
      },
      _count: true,
    });

    const products = await prisma.product.findMany({
      select: { stock: true, costPrice: true },
    });
    const stockValue = products.reduce(
      (sum, p) => sum + p.stock * (p.costPrice || 0),
      0,
    );

    // Low stock items
    const lowStockItems = await prisma.product.count({
      where: { stock: { lte: 20 } },
    });

    // Calculate actual profit from today's orders using cost prices
    const todayOrdersWithItems = await prisma.order.findMany({
      where: {
        createdAt: { gte: dayStart, lte: dayEnd },
        paymentStatus: "paid",
      },
      include: {
        items: { include: { product: { select: { costPrice: true } } } },
      },
    });
    const todayCost = todayOrdersWithItems.reduce((sum, o) => {
      return (
        sum +
        o.items.reduce((itemSum, item) => {
          return itemSum + (item.product?.costPrice || 0) * item.quantity;
        }, 0)
      );
    }, 0);
    const profitTodayAmount = ordersTodayAmount - todayCost;

    // Pending orders
    const pendingOrders = await prisma.order.count({
      where: { status: { in: ["placed", "confirmed"] } },
    });

    // Pending orders yesterday for trend
    const pendingYesterday = await prisma.order.count({
      where: {
        status: { in: ["placed", "confirmed"] },
        createdAt: { lte: endOfDay(yesterday) },
      },
    });
    const pendingTrend =
      pendingYesterday > 0
        ? Math.round(
            ((pendingOrders - pendingYesterday) / pendingYesterday) * 100,
          )
        : 0;

    // Active customers trend (compare last 30d vs previous 30d)
    const sixtyDaysAgo = subMonths(today, 2);
    const prevActiveCustomers = await prisma.order.count({
      where: {
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    });
    const activeCustomersTrend =
      prevActiveCustomers > 0
        ? Math.round(
            ((activeCustomers - prevActiveCustomers) / prevActiveCustomers) *
              100,
          )
        : 0;

    // Jar returns pending
    const pendingReturns = await prisma.jarReturn.count({
      where: { returnStatus: { in: ["pending", "partial"] } },
    });

    res.json({
      success: true,
      data: {
        ordersTodayCount,
        ordersTodayAmount: Math.round(ordersTodayAmount),
        ordersTodayTrend: ordersTrend,
        revenueTodayAmount: Math.round(ordersTodayAmount),
        revenueTodayTrend: ordersTrend,
        profitTodayAmount: Math.round(profitTodayAmount),
        profitTodayTrend: ordersTrend,
        activeCustomersCount: activeCustomers,
        activeCustomersTrend,
        stockValueTotal: Math.round(stockValue),
        stockValueTrend: 0,
        lowStockItemsCount: lowStockItems,
        pendingDeliveriesCount: pendingOrders,
        pendingDeliveriesTrend: pendingTrend,
        pendingJarReturnsCount: pendingReturns,
        pendingJarReturnsTrend: 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard KPIs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get monthly statistics
 */
export const getMonthlyStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const monthOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
        paymentStatus: "paid",
      },
    });

    const revenueThisMonth = monthOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0,
    );

    // Calculate actual profit from cost prices
    const monthOrdersWithItems = await prisma.order.findMany({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
        paymentStatus: "paid",
      },
      include: {
        items: { include: { product: { select: { costPrice: true } } } },
      },
    });
    const monthCost = monthOrdersWithItems.reduce((sum, o) => {
      return (
        sum +
        o.items.reduce((itemSum, item) => {
          return itemSum + (item.product?.costPrice || 0) * item.quantity;
        }, 0)
      );
    }, 0);
    const profitThisMonth = revenueThisMonth - monthCost;
    const profitMargin =
      revenueThisMonth > 0
        ? Math.round((profitThisMonth / revenueThisMonth) * 100)
        : 0;

    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: yearStart, lte: monthEnd },
        paymentStatus: "paid",
      },
      include: {
        items: { include: { product: { select: { costPrice: true } } } },
      },
    });

    const yearToDateRevenue = yearOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0,
    );
    const yearToDateCost = yearOrders.reduce((sum, o) => {
      return (
        sum +
        o.items.reduce((itemSum, item) => {
          return itemSum + (item.product?.costPrice || 0) * item.quantity;
        }, 0)
      );
    }, 0);
    const yearToDateProfit = yearToDateRevenue - yearToDateCost;

    // Use last month's revenue as a rough target (can be made configurable via settings)
    const lastMonthStart = startOfMonth(subMonths(today, 1));
    const lastMonthEnd = endOfMonth(subMonths(today, 1));
    const lastMonthOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        paymentStatus: "paid",
      },
    });
    const lastMonthRevenue = lastMonthOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0,
    );
    const revenueTarget = Math.max(lastMonthRevenue * 1.1, 100000); // 10% growth target

    res.json({
      success: true,
      data: {
        revenueThisMonth: Math.round(revenueThisMonth),
        revenueTarget: Math.round(revenueTarget),
        revenueProgress: Math.round((revenueThisMonth / revenueTarget) * 100),
        profitThisMonth: Math.round(profitThisMonth),
        profitMargin,
        yearToDateRevenue: Math.round(yearToDateRevenue),
        yearToDateProfit: Math.round(yearToDateProfit),
        averageOrderValue:
          yearOrders.length > 0
            ? Math.round(yearToDateRevenue / yearOrders.length)
            : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching monthly stats",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get recent orders
 */
export const getRecentOrders = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const recentOrders = await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: true, items: true },
    });

    const formatted = recentOrders.map((o) => ({
      id: o.id,
      customerName: o.user?.name || "Unknown",
      amount: Math.round(o.totalAmount),
      status: o.status,
      itemCount: o.items.length,
      createdAt: o.createdAt,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching recent orders",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ============ INVENTORY CONTROLLERS ============

/**
 * Get inventory products with pagination
 */
export const getInventoryProducts = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = (req.query.search as string) || "";
    const status = req.query.status as string;

    const skip = (page - 1) * limit;
    const whereCondition: any = {};

    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "low") {
      whereCondition.stock = { lte: 50 };
    } else if (status === "out") {
      whereCondition.stock = 0;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereCondition,
        skip,
        take: limit,
        include: { supplier: true },
      }),
      prisma.product.count({ where: whereCondition }),
    ]);

    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      stock: p.stock,
      reorderLevel: p.reorderLevel,
      costPrice: p.costPrice,
      sellingPrice: p.price,
      supplier: p.supplier?.name,
      status: p.stock === 0 ? "out" : p.stock <= 50 ? "low" : "healthy",
    }));

    res.json({
      success: true,
      data: formatted,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching inventory products",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Add stock transaction
 */
export const addStock = async (req: Request, res: Response) => {
  try {
    const {
      productId,
      quantity,
      unitCost,
      supplierId,
      referenceNumber,
      notes,
    } = req.body;
    const userId = req.user?.id;

    if (!productId || !quantity || !unitCost || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const previousStock = product.stock;
    const totalCost = quantity * unitCost;

    // Create transaction
    await prisma.inventoryTransaction.create({
      data: {
        productId,
        type: "purchase",
        quantity,
        unitCost,
        totalCost,
        supplierId,
        referenceNumber,
        notes,
        createdBy: userId,
      },
    });

    // Update product stock
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { stock: product.stock + quantity },
    });

    res.json({
      success: true,
      message: "Stock added successfully",
      data: {
        productId,
        quantity,
        previousStock,
        newStock: updated.stock,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding stock",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get stock ledger
 */
export const getStockLedger = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const productId = req.query.productId as string;
    const transactionType = req.query.type as string;

    const skip = (page - 1) * limit;
    const whereCondition: any = {};

    if (productId) whereCondition.productId = productId;
    if (transactionType) whereCondition.type = transactionType;

    const [ledger, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { product: { select: { name: true, slug: true } } },
      }),
      prisma.inventoryTransaction.count({ where: whereCondition }),
    ]);

    const formatted = ledger.map((entry) => ({
      id: entry.id,
      date: entry.createdAt,
      type: entry.type,
      productName: entry.product?.name,
      quantity: entry.quantity,
      unitCost: entry.unitCost,
      totalCost: entry.totalCost,
      reference: entry.referenceNumber,
    }));

    res.json({
      success: true,
      data: formatted,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stock ledger",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get stock forecast
 */
export const getStockForecast = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, stock: true, reorderLevel: true },
    });

    const thirtyDaysAgo = subMonths(new Date(), 1);

    const forecasts = await Promise.all(
      products.map(async (product) => {
        const sales = await prisma.inventoryTransaction.aggregate({
          where: {
            productId: product.id,
            type: "sale",
            createdAt: { gte: thirtyDaysAgo },
          },
          _sum: { quantity: true },
        });

        const totalSales = sales._sum.quantity || 0;
        const avgDailyUsage = Math.ceil(totalSales / 30);
        const daysRemaining =
          avgDailyUsage > 0 ? Math.round(product.stock / avgDailyUsage) : 999;

        let forecastStatus = "adequate";
        if (daysRemaining < 2) forecastStatus = "critical";
        else if (daysRemaining < 7) forecastStatus = "warning";
        else if (daysRemaining > 60) forecastStatus = "excess";

        return {
          id: product.id,
          productName: product.name,
          currentStock: product.stock,
          dailyBurnRate: avgDailyUsage,
          daysRemaining,
          reorderLevel: product.reorderLevel,
          forecastStatus,
        };
      }),
    );

    res.json({ success: true, data: forecasts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stock forecast",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ============ PROFIT CONTROLLERS ============

/**
 * Get profit report for date range
 */
export const getProfitReport = async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    const start = new Date(startDate);
    const end = endOfDay(new Date(endDate));

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        paymentStatus: "paid",
      },
      include: {
        items: { include: { product: true } },
      },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const productCost = orders.reduce((sum, o) => {
      const cost = o.items.reduce(
        (itemSum, item) =>
          itemSum + (item.product?.costPrice || 0) * item.quantity,
        0,
      );
      return sum + cost;
    }, 0);

    const deliveryCost = Math.round(totalRevenue * 0.08);
    const operationalCost = Math.round(totalRevenue * 0.06);
    const grossProfit = totalRevenue - productCost;
    const netProfit = grossProfit - deliveryCost - operationalCost;
    const profitMargin =
      totalRevenue > 0
        ? Math.round((netProfit / totalRevenue) * 100 * 10) / 10
        : 0;

    res.json({
      success: true,
      data: {
        periodStart: startDate,
        periodEnd: endDate,
        totalRevenue: Math.round(totalRevenue),
        productCost: Math.round(productCost),
        deliveryCost,
        operationalCost,
        grossProfit: Math.round(grossProfit),
        netProfit: Math.round(netProfit),
        profitMargin,
        orderCount: orders.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profit report",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get monthly profit trends
 */
export const getMonthlyProfitTrends = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const trends = [];

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = endOfMonth(monthStart);

      const orders = await prisma.order.findMany({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd },
          paymentStatus: "paid",
        },
        include: { items: { include: { product: true } } },
      });

      const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const cost = orders.reduce((sum, o) => {
        const itemCost = o.items.reduce(
          (itemSum, item) =>
            itemSum + (item.product?.costPrice || 0) * item.quantity,
          0,
        );
        return sum + itemCost;
      }, 0);

      const profit = revenue - cost - Math.round(revenue * 0.14);
      const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

      trends.push({
        month: monthStart.toLocaleString("default", { month: "long" }),
        revenue: Math.round(revenue),
        cost: Math.round(cost),
        profit: Math.round(profit),
        marginPercent: margin,
      });
    }

    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profit trends",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ============ JAR RETURN CONTROLLERS ============

/**
 * Get jar returns
 */
export const getJarReturns = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const status = req.query.status as string;

    const skip = (page - 1) * limit;
    const whereCondition: any = {};

    if (status) whereCondition.returnStatus = status;

    const [jarReturns, total] = await Promise.all([
      prisma.jarReturn.findMany({
        where: whereCondition,
        skip,
        take: limit,
        include: { user: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.jarReturn.count({ where: whereCondition }),
    ]);

    const formatted = jarReturns.map((jr) => ({
      id: jr.id,
      customerName: jr.customerName,
      jarsIssued: jr.jarsIssued,
      jarsReturned: jr.jarsReturned,
      pendingJars: jr.pendingJars,
      deposit: jr.depositAmount,
      outstanding: jr.outstandingDeposit,
      status: jr.returnStatus,
      lastReturn: jr.lastReturnDate,
    }));

    res.json({
      success: true,
      data: formatted,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching jar returns",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Record jar return
 */
export const recordJarReturn = async (req: Request, res: Response) => {
  try {
    const { jarReturnId, quantityReturned, depositRefunded } = req.body;

    if (!jarReturnId || quantityReturned === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const jarReturn = await prisma.jarReturn.findUnique({
      where: { id: jarReturnId },
    });

    if (!jarReturn) {
      return res
        .status(404)
        .json({ success: false, message: "Jar return record not found" });
    }

    const newReturned = jarReturn.jarsReturned + quantityReturned;
    const newPending = jarReturn.jarsIssued - newReturned;
    const newOutstanding = Math.max(
      0,
      jarReturn.outstandingDeposit - (depositRefunded || 0),
    );
    const newStatus =
      newPending === 0 ? "complete" : newReturned > 0 ? "partial" : "pending";

    const updated = await prisma.jarReturn.update({
      where: { id: jarReturnId },
      data: {
        jarsReturned: newReturned,
        pendingJars: newPending,
        outstandingDeposit: newOutstanding,
        returnStatus: newStatus,
        lastReturnDate: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Jar return recorded",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error recording jar return",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get jar return summary
 */
export const getJarReturnSummary = async (req: Request, res: Response) => {
  try {
    const summary = await prisma.jarReturn.aggregate({
      _sum: {
        jarsIssued: true,
        jarsReturned: true,
        depositAmount: true,
        outstandingDeposit: true,
      },
      _count: true,
    });

    res.json({
      success: true,
      data: {
        totalRecords: summary._count,
        totalJarsIssued: summary._sum.jarsIssued || 0,
        totalJarsReturned: summary._sum.jarsReturned || 0,
        totalDeposit: summary._sum.depositAmount || 0,
        totalOutstanding: summary._sum.outstandingDeposit || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting jar return summary",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ============ REPORTS CONTROLLERS ============

/**
 * Export orders report
 */
export const exportOrders = async (req: Request, res: Response) => {
  try {
    const format = (req.query.format as string) || "json";
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const whereCondition: any = {};
    if (startDate && endDate) {
      whereCondition.createdAt = {
        gte: new Date(startDate),
        lte: endOfDay(new Date(endDate)),
      };
    }

    const orders = await prisma.order.findMany({
      where: whereCondition,
      include: { user: true, items: { include: { product: true } } },
    });

    if (format === "json") {
      res.json({ success: true, data: orders });
    } else if (format === "csv") {
      const csv =
        "OrderID,Date,CustomerName,Email,Total,Status,PaymentStatus\n" +
        orders
          .map(
            (o) =>
              `${o.id},${o.createdAt.toISOString()},${o.user?.name},${o.user?.email},${o.totalAmount},${o.status},${o.paymentStatus}`,
          )
          .join("\n");

      res.header("Content-Type", "text/csv");
      res.header("Content-Disposition", 'attachment; filename="orders.csv"');
      res.send(csv);
    } else {
      res.status(400).json({ success: false, message: "Invalid format" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error exporting orders",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
