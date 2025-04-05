import { useEffect, useState } from "react";
import { ProductCard } from "@/components/products/product-card";
import { CategoryList } from "@/components/products/category-list";
import { ProductFilters } from "@/components/products/product-filters";
import { Product, Category } from "@/types/product";
import axios from "axios";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://www.localhost:5000/api/admin/products/categories"
        );

        // Transform the API response to match our Category type
        const categoriesData = response.data.data.map((cat: any) => ({
          id: cat.name, // Using category name as ID
          name: cat.name,
          count: cat.count,
        }));

        // Add "All Categories" option
        const allCategoriesOption = {
          id: "all",
          name: "All Categories",
          count: categoriesData.reduce(
            (sum: number, cat: any) => sum + cat.count,
            0
          ),
        };

        setCategories([allCategoriesOption, ...categoriesData]);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  // Fetch products based on selected category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Construct the endpoint based on selected category
        const endpoint =
          selectedCategory === "all"
            ? "http://www.localhost:5000/api/admin/products/get"
            : `http://www.localhost:5000/api/admin/products/category/${encodeURIComponent(
                selectedCategory || ""
              )}`;

        const response = await axios.get(endpoint);

        // Update products from the API response
        setProducts(response.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]); // Re-fetch when category changes

  // Handle category selection
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  // Filter products based on search query
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.productName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="h-full flex">
      <aside className="w-64 border-r p-4 flex flex-col">
        <h2 className="font-semibold mb-4">Categories</h2>
        {categories.length > 0 ? (
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        ) : (
          <p>Loading categories...</p>
        )}
      </aside>
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-4">All Products</h1>
          <ProductFilters onSearch={setSearchQuery} />
        </div>
        {loading ? (
          <p>Loading products...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredProducts.length === 0 ? (
          <p>No products found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
