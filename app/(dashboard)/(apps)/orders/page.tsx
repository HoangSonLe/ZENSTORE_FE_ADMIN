"use client";

import { Metadata } from "next";
import OrderTable from "./OrderTable";

export const metadata: Metadata = {
  title: "Orders",
  description: "Order management page",
};

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 rounded-lg border border-slate-200 p-5 dark:border-slate-700">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            View and manage customer orders
          </p>
        </div>
        <OrderTable />
      </div>
    </div>
  );
}
