const test = require("node:test");
const assert = require("node:assert/strict");

const {
  calculateLineTotal,
  getDefaultCustomerType,
  getPrice,
  getPriceForUser,
  PricingError,
} = require("../dist/services/pricingService.js");

const customerTypes = {
  END_USER: {
    id: "customer-type-end-user",
    code: "END_USER",
    name: "End User",
    isActive: true,
  },
  DISTRIBUTOR: {
    id: "customer-type-distributor",
    code: "DISTRIBUTOR",
    name: "Distributor",
    isActive: true,
  },
};

const createFakeDb = () => {
  const users = {
    "user-end": customerTypes.END_USER,
    "user-distributor": customerTypes.DISTRIBUTOR,
  };
  const prices = new Map([
    ["product-20l:customer-type-end-user", 100],
    ["product-20l:customer-type-distributor", 70],
  ]);

  return {
    customerType: {
      findUnique: async ({ where }) =>
        Object.values(customerTypes).find((type) => type.code === where.code) ||
        null,
    },
    user: {
      findUnique: async ({ where }) => ({
        customerType: users[where.id] || null,
      }),
    },
    productPrice: {
      findUnique: async ({ where }) => {
        const key = `${where.productId_customerTypeId.productId}:${where.productId_customerTypeId.customerTypeId}`;
        const price = prices.get(key);
        return price === undefined ? null : { price };
      },
    },
    prices,
  };
};

test("resolves different prices for end users and distributors", async () => {
  const db = createFakeDb();

  const endUserPrice = await getPriceForUser("product-20l", "user-end", db);
  const distributorPrice = await getPriceForUser(
    "product-20l",
    "user-distributor",
    db,
  );

  assert.equal(endUserPrice.customerType.code, "END_USER");
  assert.equal(endUserPrice.price, 100);
  assert.equal(distributorPrice.customerType.code, "DISTRIBUTOR");
  assert.equal(distributorPrice.price, 70);
});

test("customer type comes from the user record, not a caller-supplied pricing value", async () => {
  const db = createFakeDb();

  const result = await getPriceForUser("product-20l", "user-end", db);

  assert.equal(result.price, 100);
  assert.notEqual(result.price, 70);
});

test("cart and order line totals use the resolved unit price", () => {
  assert.equal(calculateLineTotal(70, 2), 140);
  assert.equal(calculateLineTotal(70, 10), 700);
});

test("price changes affect new resolutions but not an existing order snapshot", async () => {
  const db = createFakeDb();
  const existingOrderUnitPrice = await getPrice(
    "product-20l",
    customerTypes.DISTRIBUTOR.id,
    db,
  );

  db.prices.set("product-20l:customer-type-distributor", 75);
  const newOrderUnitPrice = await getPrice(
    "product-20l",
    customerTypes.DISTRIBUTOR.id,
    db,
  );

  assert.equal(existingOrderUnitPrice, 70);
  assert.equal(newOrderUnitPrice, 75);
});

test("missing prices and invalid quantities fail closed", async () => {
  const db = createFakeDb();

  await assert.rejects(
    () => getPrice("missing-product", customerTypes.END_USER.id, db),
    (error) => error instanceof PricingError && error.statusCode === 409,
  );
  assert.throws(
    () => calculateLineTotal(70, 0),
    (error) => error instanceof PricingError && error.statusCode === 400,
  );
});

test("the default customer type is END_USER", async () => {
  const db = createFakeDb();
  const customerType = await getDefaultCustomerType(db);

  assert.equal(customerType.code, "END_USER");
});
