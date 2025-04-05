import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeRange } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "JUL", sales: 100 },
  { month: "AUG", sales: 150 },
  { month: "SEP", sales: 200 },
  { month: "OCT", sales: 250 },
  { month: "NOV", sales: 300 },
  { month: "DEC", sales: 400 },
];

interface SalesChartProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export function SalesChart({ timeRange, onTimeRangeChange }: SalesChartProps) {
  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Sale Graph</CardTitle>
        <div className="space-x-2">
          <Button 
            variant={timeRange === "WEEKLY" ? "default" : "outline"}
            size="sm"
            onClick={() => onTimeRangeChange("WEEKLY")}
          >
            WEEKLY
          </Button>
          <Button
            variant={timeRange === "MONTHLY" ? "default" : "outline"}
            size="sm"
            onClick={() => onTimeRangeChange("MONTHLY")}
          >
            MONTHLY
          </Button>
          <Button
            variant={timeRange === "YEARLY" ? "default" : "outline"}
            size="sm"
            onClick={() => onTimeRangeChange("YEARLY")}
          >
            YEARLY
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}