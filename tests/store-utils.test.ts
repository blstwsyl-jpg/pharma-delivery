import { describe, expect, it } from "vitest";

import { getCartTotal, getDeliveryFee, getOrderTotal } from "../lib/store-utils";

describe("store pricing", () => {
  it("calculates a cart subtotal from quantities", () => {
    expect(
      getCartTotal([
        { price: 18.5, quantity: 2 },
        { price: 32, quantity: 1 },
      ]),
    ).toBe(69);
  });

  it("waives delivery for orders of 100 SAR or more", () => {
    expect(getDeliveryFee(99.99)).toBe(12);
    expect(getDeliveryFee(100)).toBe(0);
  });

  it("returns the final order total including delivery", () => {
    expect(getOrderTotal(69)).toBe(81);
    expect(getOrderTotal(125)).toBe(125);
  });
});
