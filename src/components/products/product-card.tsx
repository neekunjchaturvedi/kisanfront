import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <div className="aspect-square bg-muted">
          {product.image1 ? (
            <img
              src={product.image1}
              alt={product.productName}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
        </div>
        <Button variant="ghost" size="icon" className="absolute top-2 right-2">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{product.productName}</h3>
            <span className="text-sm font-semibold">₹{product.price}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Sales: {product.sales}</span>
            <span>Stock: {product.remaining}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
