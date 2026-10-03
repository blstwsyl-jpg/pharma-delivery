import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { Product } from "@/data/catalog";
import { getCartTotal, getOrderTotal } from "@/lib/store-utils";
import { trpc } from "@/lib/trpc";

export type CartItem = Product & { quantity: number };

export type Order = {
  id: string;
  createdAt: string;
  items: CartItem[];
  total: number;
  address: string;
  status: "قيد التجهيز" | "في الطريق" | "تم التسليم";
};

type StoreContextValue = {
  cart: CartItem[];
  orders: Order[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  placeOrder: (address: string) => Promise<Order>;
  isPlacingOrder: boolean;
};

const CART_KEY = "pharma-delivery-cart";
const ORDERS_KEY = "pharma-delivery-orders";

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const remoteCreateOrder = trpc.orders.create.useMutation();
  const cartTotal = getCartTotal(cart);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(CART_KEY), AsyncStorage.getItem(ORDERS_KEY)]).then(
      ([savedCart, savedOrders]) => {
        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedOrders) setOrders(JSON.parse(savedOrders));
      },
    );
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  const value = useMemo<StoreContextValue>(() => {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
      cart,
      orders,
      cartCount,
      cartTotal,
      isPlacingOrder: remoteCreateOrder.isPending,
      addToCart: (product) => {
        setCart((current) => {
          const existing = current.find((item) => item.id === product.id);
          if (existing) {
            return current.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
            );
          }
          return [...current, { ...product, quantity: 1 }];
        });
      },
      updateQuantity: (productId, quantity) => {
        setCart((current) =>
          quantity <= 0
            ? current.filter((item) => item.id !== productId)
            : current.map((item) => (item.id === productId ? { ...item, quantity } : item)),
        );
      },
      removeFromCart: (productId) => {
        setCart((current) => current.filter((item) => item.id !== productId));
      },
      placeOrder: async (address) => {
        const localId = `PH-${Date.now().toString().slice(-6)}`;
        const remoteOrder = await remoteCreateOrder.mutateAsync({
          id: localId,
          customerName: "عميل صيدلي",
          deliveryAddress: address,
          total: getOrderTotal(cartTotal).toFixed(2),
          items: JSON.stringify(cart.map(({ id, name, quantity, price }) => ({ id, name, quantity, price }))),
        });
        const order: Order = {
          id: remoteOrder?.id ?? localId,
          createdAt: remoteOrder?.createdAt ? new Date(remoteOrder.createdAt).toISOString() : new Date().toISOString(),
          items: [...cart],
          total: getOrderTotal(cartTotal),
          address,
          status: "قيد التجهيز",
        };
        setOrders((current) => [order, ...current]);
        setCart([]);
        return order;
      },
    };
  }, [cart, orders, cartTotal, remoteCreateOrder]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
