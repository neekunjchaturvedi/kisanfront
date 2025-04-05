import React, { useEffect, useRef, useState } from "react";
import { UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

interface ProductImageUploadProps {
  file: File | null;
  setFile: (file: File | null) => void;
  imageLoadingState: boolean;
  uploadedImageUrl: string;
  setUploadedImageUrl: (url: string) => void;
  setImageLoadingState: (state: boolean) => void;
  imageNumber: number;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  file,
  setFile,
  imageLoadingState,
  uploadedImageUrl,
  setUploadedImageUrl,
  setImageLoadingState,
  imageNumber,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleImageFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file size
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      // Validate file type
      if (!selectedFile.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }
      setError(null);
      setFile(selectedFile);
    }
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      if (!droppedFile.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }
      setError(null);
      setFile(droppedFile);
    }
  }

  function handleRemoveImage() {
    setFile(null);
    setUploadedImageUrl("");
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function uploadImageToCloudinary() {
    try {
      setImageLoadingState(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file as Blob);

      const response = await axios.post(
        "http://localhost:5000/api/admin/products/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response?.data?.success) {
        setUploadedImageUrl(response.data.result.url);
        console.log("Upload successful:", response.data.result.url);
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setError(error.response?.data?.message || "Failed to upload image");
    } finally {
      setImageLoadingState(false);
    }
  }

  useEffect(() => {
    if (file) {
      uploadImageToCloudinary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  return (
    <div className="w-full mt-4">
      <Label className="text-lg font-semibold mb-2 block">
        {imageNumber === 1
          ? "Primary Image *"
          : `Additional Image ${imageNumber}`}
      </Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 ${
          error ? "border-red-500" : ""
        }`}
      >
        <Input
          id={`image-upload-${imageNumber}`}
          type="file"
          accept="image/*"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
        />
        {!uploadedImageUrl ? (
          <Label
            htmlFor={`image-upload-${imageNumber}`}
            className="flex flex-col items-center justify-center h-32 cursor-pointer"
          >
            <UploadCloudIcon
              className={`w-10 h-10 mb-2 ${
                error ? "text-red-500" : "text-muted-foreground"
              }`}
            />
            <span className="text-center">
              {imageNumber === 1
                ? "Upload primary image (required)"
                : "Upload additional image"}
            </span>
            {error && (
              <span className="text-sm text-red-500 mt-2 text-center">
                {error}
              </span>
            )}
          </Label>
        ) : imageLoadingState ? (
          <div className="h-32 flex items-center justify-center flex-col">
            <Skeleton className="h-24 w-24" />
            <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={uploadedImageUrl}
                alt={`Product ${imageNumber}`}
                className="w-24 h-24 object-cover rounded"
              />
              <div>
                <p className="text-sm font-medium">
                  {imageNumber === 1 ? "Primary Image" : `Image ${imageNumber}`}
                </p>
                {file && (
                  <p className="text-xs text-gray-500 mt-1">{file.name}</p>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemoveImage}
              className="text-muted-foreground hover:text-foreground"
            >
              <XIcon className="w-4 h-4" />
              <span className="sr-only">Remove Image</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageUpload;
