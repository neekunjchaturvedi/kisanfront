import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BestSeller } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface BestSellersProps {
  items: BestSeller[];
}

export function BestSellers({ items }: BestSellersProps) {
  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Best Sellers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.sales} sales
                </p>
              </div>
              <div className="ml-auto font-medium">₹{item.amount}</div>
            </div>
          ))}
        </div>
        <Button className="w-full mt-4" variant="outline">
          View All
        </Button>
      </CardContent>
    </Card>
  );
}