export const CUSTOMER_TYPE_CODES = {
  END_USER: "END_USER",
  DISTRIBUTOR: "DISTRIBUTOR",
} as const;

export type CustomerTypeCode =
  (typeof CUSTOMER_TYPE_CODES)[keyof typeof CUSTOMER_TYPE_CODES];

export const DEFAULT_CUSTOMER_TYPE_CODE = CUSTOMER_TYPE_CODES.END_USER;

export const CUSTOMER_TYPE_NAMES: Record<CustomerTypeCode, string> = {
  [CUSTOMER_TYPE_CODES.END_USER]: "End User",
  [CUSTOMER_TYPE_CODES.DISTRIBUTOR]: "Distributor",
};
