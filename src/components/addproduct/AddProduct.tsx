import React, { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import ProductImageUpload from "../common/imageupload";

const AddProduct: React.FC = () => {
  // Form state
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [productType, setProductType] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [sku, setSku] = useState("");
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [sales, setSales] = useState<number>(0);
  const [remaining, setRemaining] = useState<number>(0);

  // Image state
  const [imageUrls, setImageUrls] = useState<string[]>(["", "", "", ""]);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [imageLoadingStates, setImageLoadingStates] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);

  // Tags state
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle image file selection
  const handleSetFile = (file: File | null, index: number) => {
    if (file) {
      // Create a copy of the current files array and update the specified index
      const newFiles = [...imageFiles];
      newFiles[index] = file;
      setImageFiles(newFiles);

      // Set loading state for this image
      const newLoadingStates = [...imageLoadingStates];
      newLoadingStates[index] = true;
      setImageLoadingStates(newLoadingStates);

      // Upload the image to server
      uploadImage(file, index);
    }
  };

  // Handle image upload
  const uploadImage = async (file: File, index: number) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://www.localhost:5000/api/admin/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        // Update the image URL in state
        const newUrls = [...imageUrls];
        newUrls[index] = response.data.result.url;
        setImageUrls(newUrls);
      } else {
        console.error("Image upload failed:", response.data.message);
        setFormErrors((prev) => ({
          ...prev,
          [`image${
            index + 1
          }`]: `Failed to upload image: ${response.data.message}`,
        }));
      }
    } catch (error) {
      console.error("Image upload error:", error);
      setFormErrors((prev) => ({
        ...prev,
        [`image${index + 1}`]: "Failed to upload image. Please try again.",
      }));
    } finally {
      // Clear loading state
      const newLoadingStates = [...imageLoadingStates];
      newLoadingStates[index] = false;
      setImageLoadingStates(newLoadingStates);
    }
  };

  // Set uploaded image URL
  const handleSetUploadedImageUrl = (url: string, index: number) => {
    const newUrls = [...imageUrls];
    newUrls[index] = url;
    setImageUrls(newUrls);
  };

  // Handle setting image loading state
  const setImageLoadingState = (isLoading: boolean, index: number) => {
    const newStates = [...imageLoadingStates];
    newStates[index] = isLoading;
    setImageLoadingStates(newStates);
  };

  // Handle tag addition
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentTag.trim()) {
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Validate the form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Check required fields
    if (!productName.trim()) {
      errors.productName = "Product name is required";
    }

    if (!description.trim()) {
      errors.description = "Description is required";
    }

    if (!productType.trim()) {
      errors.productType = "Product type is required";
    }

    // Check if at least one image URL exists
    if (!imageUrls[0]) {
      errors.image1 = "At least one image is required";
    }

    // Validate numeric fields
    if (isNaN(price) || price < 0) {
      errors.price = "Price must be a valid number";
    }

    if (isNaN(stockQuantity) || stockQuantity < 0) {
      errors.stockQuantity = "Stock quantity must be a valid number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create product data object
      const productData = {
        image1: imageUrls[0],
        image2: imageUrls[1] || "",
        image3: imageUrls[2] || "",
        image4: imageUrls[3] || "",
        productName: productName.trim(),
        description: description.trim(),
        productType: productType.trim(),
        category: category.trim(),
        price: price,
        salePrice: salePrice || undefined,
        sku: sku.trim(),
        stockQuantity: stockQuantity,
        sales: sales || 0,
        remaining: remaining || 0,
        tags: tags.length > 0 ? tags : undefined,
      };

      console.log("Submitting product data:", productData);

      // Make API request to create product
      const response = await axios.post(
        "http://www.localhost:5000/api/admin/products/add",
        productData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        console.log("Product added successfully:", response.data.data);
        // Reset form after successful submission
        resetForm();
        alert("Product added successfully!");
      } else {
        console.error("Error adding product:", response.data.message);
        setFormErrors((prev) => ({ ...prev, form: response.data.message }));
      }
    } catch (error: any) {
      console.error("Add product error:", error);
      setFormErrors((prev) => ({
        ...prev,
        form:
          error.response?.data?.message ||
          "Failed to add product. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setProductName("");
    setDescription("");
    setProductType("");
    setCategory("");
    setPrice(0);
    setSalePrice(0);
    setSku("");
    setStockQuantity(0);
    setSales(0);
    setRemaining(0);
    setImageUrls(["", "", "", ""]);
    setImageFiles([null, null, null, null]);
    setTags([]);
    setCurrentTag("");
    setFormErrors({});
  };

  // Helper to display error message
  const errorMessage = (field: string) => {
    return formErrors[field] ? (
      <p className="text-red-500 text-xs mt-1">{formErrors[field]}</p>
    ) : null;
  };

  // Predefined categories (from controller)
  const predefinedCategories = [
    "Bearings & Bushings",
    "Hydraulic System Components",
    "Filters & Lubrication System",
    "Fasteners & Fittings",
    "Steering & Suspension Components",
    "Braking System",
  ];

  return (
    <div className="h-screen overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">
            Add New Product
          </h1>

          {formErrors.form && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{formErrors.form}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    formErrors.productName
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="Enter product name"
                />
                {errorMessage("productName")}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    formErrors.description
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="Enter product description"
                />
                {errorMessage("description")}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {predefinedCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Type *
                </label>
                <input
                  type="text"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    formErrors.productType
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="Enter product type"
                />
                {errorMessage("productType")}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter SKU"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Regular Price *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setPrice(isNaN(val) ? 0 : val);
                    }}
                    className={`w-full px-3 py-2 border ${
                      formErrors.price ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    placeholder="Enter price"
                  />
                  {errorMessage("price")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sale Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setSalePrice(isNaN(val) ? 0 : val);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter sale price"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setStockQuantity(isNaN(val) ? 0 : val);
                    }}
                    className={`w-full px-3 py-2 border ${
                      formErrors.stockQuantity
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    placeholder="Enter quantity"
                  />
                  {errorMessage("stockQuantity")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sales
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sales}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setSales(isNaN(val) ? 0 : val);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter sales"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remaining
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={remaining}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setRemaining(isNaN(val) ? 0 : val);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter remaining"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="flex-1 min-w-[120px] outline-none"
                    placeholder="Type and press Enter"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Gallery *
                </label>
                {/* {errorMessage("image1")} */}

                <div className="grid grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((index) => (
                    <ProductImageUpload
                      key={index}
                      file={imageFiles[index]}
                      setFile={(file) => handleSetFile(file, index)}
                      imageLoadingState={imageLoadingStates[index]}
                      uploadedImageUrl={imageUrls[index]}
                      setUploadedImageUrl={(url) =>
                        handleSetUploadedImageUrl(url, index)
                      }
                      setImageLoadingState={(isLoading) =>
                        setImageLoadingState(isLoading, index)
                      }
                      imageNumber={index + 1}
                    />
                  ))}
                </div>

                <div className="text-sm text-gray-500 mt-2">
                  * Image 1 is required. You can upload up to 4 images.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
