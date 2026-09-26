export type PricedItem = { price: number; quantity: number };

export const getCartTotal = (items: PricedItem[]) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const getDeliveryFee = (subtotal: number) => (subtotal >= 100 ? 0 : 12);

export const getOrderTotal = (subtotal: number) => subtotal + getDeliveryFee(subtotal);
