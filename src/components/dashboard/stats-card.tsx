import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStats } from "@/types/dashboard";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

export function StatsCard({ title, value, percentageChange, comparedTo }: OrderStats) {
  const isPositive = percentageChange > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">₹{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground mt-1">
          <span className={`inline-flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
            {Math.abs(percentageChange)}%
          </span>
          {" "}compared to {comparedTo}
        </p>
      </CardContent>
    </Card>
  );
}