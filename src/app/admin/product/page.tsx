"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Input from "@/shared/Input/Input";
import Label from "@/components/Label/Label";
import Textarea from "@/shared/Textarea/Textarea";
import { Switch } from "@/app/headlessui";

// API Response interfaces - these match exactly with the backend response
interface ImageDto {
  id: number;
  urlName: string;
  allText: string;
}

interface ProductDetailDto {
  id: number;
  color: string;
  size: string;
  quantity: number;
  price: number;
  imageDtoList: ImageDto[];
}

interface Product {
  id: number;
  name: string;
  note: string;
  rate: number;
  productDetailDtoList: ProductDetailDto[];
}

interface ApiResponse {
  code: number;
  message: string;
  data: Product[];
}

// Request interfaces - these match what we send to the backend
interface ProductDetailRequest {
  color: string;
  size: string;
  quantityStock: number;
  price: number;
  images: { allText: string }[];
}

interface ProductRequest {
  name: string;
  note: string;
  rate: number;
  productDetailRequests: ProductDetailRequest[];
}

const AdminProductsPage = () => {
  // State for product form
  const [productName, setProductName] = useState("");
  const [productNote, setProductNote] = useState("");
  const [productRate, setProductRate] = useState(5);
  
  // State for product detail
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantityStock, setQuantityStock] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [imageDescription, setImageDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  
  // State for products list
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for form mode
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  // State for delete operation
  const [isDeleting, setIsDeleting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState({ type: "", text: "" });

  // Load products on initial load and when pagination changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Fix the parameter order: pageNumber should come first, then pageSize
      const response = await axios.get<ApiResponse>(
        `http://localhost:8080/product?pageNumber=${pageSize}&pageSize=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.code === 200) {
        const productData = response.data.data;
        setProducts(productData);
        
        // For estimating the total items when API doesn't provide total count
        // A very simple estimation based on current results
        if (productData.length < pageSize) {
          // If we have fewer items than the page size, we're likely on the last page
          setTotalElements(currentPage * pageSize + productData.length);
        } else {
          // If we have a full page, there might be more
          setTotalElements((currentPage + 1) * pageSize + pageSize); // Estimate one more page
        }
      } else {
        console.error("Error fetching products:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in as admin to add products");
        return;
      }
      
      // Prepare the product request
      const productRequest: ProductRequest = {
        name: productName,
        note: productNote,
        rate: productRate,
        productDetailRequests: [
          {
            color,
            size,
            quantityStock,
            price,
            images: [
              {
                allText: imageDescription
              }
            ]
          }
        ]
      };
      
      // Create form data for multipart/form-data request
      const formData = new FormData();
      formData.append(
        "productRequestJson", 
        JSON.stringify(productRequest)
      );
      
      // Append each file to the form data
      if (selectedFiles) {
        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append("files", selectedFiles[i]);
        }
      }
      
      // Send the request
      const response = await axios.post(
        "http://localhost:8080/product/add",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      
      if (response.status === 200) {
        alert("Product added successfully!");
        resetForm();
        fetchProducts();
        setIsAddingProduct(false);
      } else {
        alert("Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product. Please try again.");
    }
  };

  const resetForm = () => {
    setProductName("");
    setProductNote("");
    setProductRate(5);
    setColor("");
    setSize("");
    setQuantityStock(0);
    setPrice(0);
    setImageDescription("");
    setSelectedFiles(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleNextPage = () => {
    // If we have a full page of items, assume there might be a next page
    if (products.length === pageSize) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Delete product functionality
  const openDeleteConfirm = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
    setDeleteMessage({ type: "", text: "" });
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setProductToDelete(null);
    setDeleteMessage({ type: "", text: "" });
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    setDeleteMessage({ type: "", text: "" });
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setDeleteMessage({ type: "error", text: "You must be logged in as admin" });
        setIsDeleting(false);
        return;
      }
      
      // Call API to delete product
      const response = await axios.delete(
        `http://localhost:8080/product/${productToDelete.id}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 200) {
        setDeleteMessage({ type: "success", text: "Product deleted successfully" });
        
        // Close modal and refresh product list after brief delay
        setTimeout(() => {
          fetchProducts();
          closeDeleteConfirm();
        }, 1000);
      } else {
        setDeleteMessage({ type: "error", text: "Failed to delete product" });
      }
    } catch (error: any) {
      console.error("Error deleting product:", error);
      setDeleteMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Error deleting product. Please try again." 
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete confirmation modal component
  const DeleteConfirmModal = () => {
    if (!showDeleteConfirm || !productToDelete) return null;
    
    return (
      <div className="fixed inset-0 bg-neutral-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full mx-auto overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                <svg className="w-6 h-6 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-center text-neutral-900 dark:text-white mb-2">
              Delete Product
            </h3>
            
            <p className="text-neutral-500 dark:text-neutral-400 text-center mb-6">
              Are you sure you want to delete "{productToDelete.name}"? This action cannot be undone.
            </p>
            
            {deleteMessage.text && (
              <div className={`mb-4 p-3 rounded-lg ${
                deleteMessage.type === "success" 
                  ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                  : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                {deleteMessage.text}
              </div>
            )}
            
            <div className="flex justify-center space-x-4">
              <button
                className="px-4 py-2 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                onClick={closeDeleteConfirm}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600"
                onClick={handleDeleteProduct}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProductForm = () => {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6 mb-10">
        <h3 className="text-2xl font-semibold mb-4">Add New Product</h3>
        <form onSubmit={handleAddProduct} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Product Name</Label>
              <Input
                type="text"
                className="mt-1.5"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Product Rate (out of 5)</Label>
              <Input
                type="number"
                className="mt-1.5"
                min={0}
                max={5}
                step={0.1}
                value={productRate}
                onChange={(e) => setProductRate(parseFloat(e.target.value))}
                required
              />
            </div>
          </div>
          
          <div>
            <Label>Product Note/Description</Label>
            <Textarea
              className="mt-1.5"
              rows={3}
              value={productNote}
              onChange={(e) => setProductNote(e.target.value)}
              required
            />
          </div>
          
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
            <h4 className="text-lg font-medium mb-3">Product Variant Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Color</Label>
                <Input
                  type="text"
                  className="mt-1.5"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Size</Label>
                <Input
                  type="text"
                  className="mt-1.5"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Quantity in Stock</Label>
                <Input
                  type="number"
                  className="mt-1.5"
                  min={0}
                  value={quantityStock}
                  onChange={(e) => setQuantityStock(parseInt(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label>Price (VND)</Label>
                <Input
                  type="number"
                  className="mt-1.5"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
            <h4 className="text-lg font-medium mb-3">Product Images</h4>
            <div className="mb-4">
              <Label>Image Description</Label>
              <Input
                type="text"
                className="mt-1.5"
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Upload Images</Label>
              <div className="mt-1.5 flex items-center justify-center px-6 py-12 border-2 border-neutral-300 dark:border-neutral-700 border-dashed rounded-2xl">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-neutral-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-neutral-600 dark:text-neutral-300">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-primary-6000 dark:text-primary-500 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        onChange={handleFileChange}
                        required
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              {selectedFiles && (
                <div className="mt-3">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Selected {selectedFiles.length} file(s)
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <ButtonPrimary 
              type="button" 
              className="bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              onClick={() => {
                resetForm();
                setIsAddingProduct(false);
              }}
            >
              Cancel
            </ButtonPrimary>
            <ButtonPrimary type="submit">
              Add Product
            </ButtonPrimary>
          </div>
        </form>
      </div>
    );
  };

  const renderProductsList = () => {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold">Products</h3>
          <ButtonPrimary onClick={() => setIsAddingProduct(true)}>
            Add New Product
          </ButtonPrimary>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <svg className="animate-spin h-8 w-8 mx-auto text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-neutral-500 dark:text-neutral-400">Loading products...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Image
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Rate
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Variants
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Price Range
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">
                        {product.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.productDetailDtoList?.[0]?.imageDtoList?.[0]?.urlName && (
                          <div className="h-16 w-16 relative">
                            <Image 
                              src={product.productDetailDtoList[0].imageDtoList[0].urlName}
                              alt={product.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                        <div className="font-medium">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">
                        <div className="flex items-center">
                          {product.rate}
                          <span className="ml-1 text-yellow-500">★</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-300 max-w-xs truncate">
                        {product.note}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">
                        {product.productDetailDtoList.map(detail => 
                          `${detail.color}/${detail.size}`
                        ).join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">
                        {product.productDetailDtoList.length > 0 ? (
                          `${Math.min(...product.productDetailDtoList.map(d => d.price)).toLocaleString()} - ${Math.max(...product.productDetailDtoList.map(d => d.price)).toLocaleString()} VND`
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-primary-600 dark:text-primary-500 hover:underline mr-3">
                          Edit
                        </button>
                        <button 
                          className="text-red-600 dark:text-red-500 hover:underline"
                          onClick={() => openDeleteConfirm(product)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {products.length === 0 && (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                No products found
              </div>
            )}
            
            {/* Pagination - Simplified without total pages */}
            <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700 mt-6 pt-6">
              <div className="text-sm text-neutral-700 dark:text-neutral-300">
                {products.length > 0 ? (
                  <>Showing products {currentPage * pageSize + 1} to {currentPage * pageSize + products.length}</>
                ) : (
                  <>No products to display</>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <select 
                  className="form-select rounded-md border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 dark:bg-neutral-800 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(0);
                  }}
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 0
                        ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    Page {currentPage + 1}
                  </span>
                  <button 
                    onClick={handleNextPage}
                    // Enable next page button only if we have a full page of results
                    disabled={products.length < pageSize}
                    className={`px-3 py-1 rounded-md ${
                      products.length < pageSize
                        ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="nc-AdminProductsPage container py-16 lg:pb-28 lg:pt-20">
      <div className="mb-14 lg:mb-16">
        <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
          Product Management
        </h2>
        <div className="mt-3 sm:mt-5 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
          Add, edit, and manage your products from this dashboard
        </div>
      </div>
      
      {isAddingProduct ? renderProductForm() : renderProductsList()}
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal />
    </div>
  );
};

export default AdminProductsPage;