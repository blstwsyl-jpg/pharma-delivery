import { COOKIE_NAME } from "../shared/const.js";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { assignOrder, claimOrder, createOrder, listCaptains, listOrdersForUser, setCaptainAvailability, updateOrderStatus } from "./db";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  orders: router({
    list: protectedProcedure
      .input(z.object({ scope: z.enum(["mine", "available", "all"]).default("mine") }))
      .query(({ ctx, input }) => listOrdersForUser(ctx.user.id, ctx.user.role, input.scope)),
    create: protectedProcedure
      .input(z.object({ id: z.string().min(3).max(32), customerName: z.string().min(2), deliveryAddress: z.string().min(5), total: z.string().min(1), items: z.string().min(2) }))
      .mutation(({ ctx, input }) => createOrder({ ...input, customerId: ctx.user.id, status: "new" })),
    claim: protectedProcedure
      .input(z.object({ orderId: z.string().min(3) }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "captain") throw new TRPCError({ code: "FORBIDDEN", message: "Captain role required" });
        return claimOrder(ctx.user.id, input.orderId);
      }),
    setStatus: protectedProcedure
      .input(z.object({ orderId: z.string().min(3), status: z.enum(["new", "preparing", "ready", "assigned", "in_transit", "delivered", "cancelled"]) }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "captain" && ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Captain or admin role required" });
        return updateOrderStatus(input.orderId, input.status, ctx.user.id, ctx.user.role);
      }),
    setCaptainAvailability: protectedProcedure
      .input(z.object({ availability: z.enum(["available", "busy", "offline"]) }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "captain") throw new TRPCError({ code: "FORBIDDEN", message: "Captain role required" });
        return setCaptainAvailability(ctx.user.id, input.availability);
      }),
    adminList: adminProcedure.query(() => listOrdersForUser(0, "admin", "all")),
    assign: adminProcedure
      .input(z.object({ orderId: z.string().min(3), captainId: z.number().int().positive() }))
      .mutation(({ input }) => assignOrder(input.orderId, input.captainId)),
  }),

  captains: router({
    list: adminProcedure.query(() => listCaptains()),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
