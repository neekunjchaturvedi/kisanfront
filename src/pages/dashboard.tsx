import { useState } from 'react';
import { StatsCard } from '../components/dashboard/stats-card';
import { SalesChart } from '../components/dashboard/sales-chart';
import { BestSellers } from '../components/dashboard/best-sellers';
import { RecentOrders } from '../components/dashboard/recent-orders';
import { TimeRange } from '../types/dashboard';

const statsData = [
  {
    title: "Total Orders",
    value: 726500,
    percentageChange: 34.7,
    comparedTo: "Oct 2023",
  },
  {
    title: "Active Orders",
    value: 726500,
    percentageChange: 34.7,
    comparedTo: "Oct 2023",
  },
  {
    title: "Completed Orders",
    value: 726500,
    percentageChange: -34.7,
    comparedTo: "Oct 2023",
  },
  {
    title: "Return Orders",
    value: 726500,
    percentageChange: 34.7,
    comparedTo: "Oct 2023",
  },
];

const bestSellers = [
  {
    id: "1",
    name: "Lorem Ipsum",
    sales: 999,
    amount: 126.50,
  },
  {
    id: "2",
    name: "Lorem Ipsum",
    sales: 999,
    amount: 126.50,
  },
  {
    id: "3",
    name: "Lorem Ipsum",
    sales: 999,
    amount: 126.50,
  },
];

const recentOrders = [
  {
    id: "1",
    product: "Lorem ipsum",
    orderId: "#25428",
    date: "Nov 9th 2024",
    customerName: "Bunny",
    status: "delivered" as "delivered" | "cancelled" | "pending",
    amount: 1200.00,
  },
  {
    id: "2",
    product: "Lorem ipsum",
    orderId: "#25427",
    date: "Nov 9th 2024",
    customerName: "Rahul",
    status: "cancelled" as "delivered" | "cancelled" | "pending",
    amount: 1200.00,
  },
  {
    id: "3",
    product: "Lorem ipsum",
    orderId: "#25426",
    date: "Nov 9th 2024",
    customerName: "Bunny",
    status: "delivered",
    amount: 1200.00,
  },
  {
    id: "4",
    product: "Lorem ipsum",
    orderId: "#25425",
    date: "Nov 9th 2024",
    customerName: "Rahul",
    status: "cancelled",
    amount: 1200.00,
  },
];

export function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("MONTHLY");

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>
      <div className="grid grid-cols-6 gap-4 mb-6">
        <SalesChart
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
        <BestSellers items={bestSellers} />
      </div>
      <RecentOrders orders={recentOrders} />
    </main>
  );
}