"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Input from "@/shared/Input/Input";
import Select from "@/shared/Select/Select";
import Label from "@/components/Label/Label";

// Define interfaces based on API response
interface Order {
  id: number;
  orderDetail: any | null;
  orderStatusHistory: any | null;
  fullName: string | null;
  phone: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  country: string | null;
  province: string | null;
  apt: string | null;
  transactionId: string | null;
  date: string;
  paymentMethod: string;
  status: string;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
}

const AdminOrderPage = () => {
  // State for orders data
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for selected order and modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // State for sorting
  const [sortField, setSortField] = useState<keyof Order>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // State for filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  
  const router = useRouter();

  // Fetch orders data
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get<Order[]>("http://localhost:8080/order", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      setOrders(response.data);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to fetch orders. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format date string to more readable format
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Not specified";
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(amount);
  };

  // View order details
  const openOrderDetailsModal = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsModalOpen(true);
  };

  // Close order details modal
  const closeOrderDetailsModal = () => {
    setIsOrderDetailsModalOpen(false);
    setSelectedOrder(null);
  };

  // Handle sort changes
  const handleSort = (field: keyof Order) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Format payment method for display
  const formatPaymentMethod = (method: string | null) => {
    if (!method) return "Not specified";
    if (method === "Home") return "Home";
    if (method === "Credit-Card") return "Credit-Card";
    return "Others";
  };

  // Filter and sort orders
  const filteredOrders = orders.filter((order) => {
    // Search term matching
    const searchMatch =
      searchTerm === "" ||
      (order.fullName && order.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.id.toString().includes(searchTerm)) ||
      (order.transactionId && order.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));
      
    // Status filter
    const statusMatch = statusFilter === "" || order.status === statusFilter;
    
    // Payment method filter
    const paymentMatch = paymentMethodFilter === "" || 
      (paymentMethodFilter === "Home" && order.paymentMethod === "Home") ||
      (paymentMethodFilter === "Credit-Card" && order.paymentMethod === "Credit-Card") ||
      (paymentMethodFilter === "Others" && order.paymentMethod !== "Home" && order.paymentMethod !== "Credit-Card" && order.paymentMethod !== null && order.paymentMethod !== "");
    
    // Date filter
    const dateMatch = dateFilter === "" || 
      (order.date && order.date.startsWith(dateFilter));
      
    return searchMatch && statusMatch && paymentMatch && dateMatch;
  });

  // Sort the filtered orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (a[sortField] === null) return 1;
    if (b[sortField] === null) return -1;
    
    if (typeof a[sortField] === 'string' && typeof b[sortField] === 'string') {
      return sortDirection === "asc" 
        ? (a[sortField] as string).localeCompare(b[sortField] as string)
        : (b[sortField] as string).localeCompare(a[sortField] as string);
    }
    
    return sortDirection === "asc"
      ? (a[sortField] as number) - (b[sortField] as number)
      : (b[sortField] as number) - (a[sortField] as number);
  });
  
  // Paginate the sorted orders
  const paginatedOrders = sortedOrders.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  
  const totalPages = Math.ceil(sortedOrders.length / pageSize);

  // Get unique status values for filter dropdown
  const statusOptions = Array.from(new Set(orders.map(order => order.status)))
    .filter(Boolean)
    .sort();
    
  // Standard payment method options
  const paymentMethodOptions = ["Home", "Credit-Card", "Others"];

  // Order Details Modal
  const OrderDetailsModal = () => {
    if (!selectedOrder) return null;

    return (
      <div className="fixed inset-0 bg-neutral-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-3xl w-full mx-auto overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="text-xl font-semibold">
              Order #{selectedOrder.id}
            </h3>
            <button 
              onClick={closeOrderDetailsModal}
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-700 pb-4 mb-4">
              <div>
                <h4 className="font-medium">Order Information</h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Date: {formatDate(selectedOrder.date)}
                </p>
              </div>
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedOrder.status === "Completed" 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : selectedOrder.status === "Pending" 
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : selectedOrder.status === "Processing" 
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : selectedOrder.status === "Cancelled" 
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                }`}>
                  {selectedOrder.status || "Not specified"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
              <div>
                <h4 className="font-medium mb-2">Customer Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-neutral-500 dark:text-neutral-400">Name:</span> {selectedOrder.fullName || "Not specified"}</p>
                  <p><span className="text-neutral-500 dark:text-neutral-400">Phone:</span> {selectedOrder.phone || "Not specified"}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Shipping Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-neutral-500 dark:text-neutral-400">Address:</span> {selectedOrder.address || "Not specified"}</p>
                  <p><span className="text-neutral-500 dark:text-neutral-400">City:</span> {selectedOrder.city || "Not specified"}</p>
                  <p><span className="text-neutral-500 dark:text-neutral-400">Province:</span> {selectedOrder.province || "Not specified"}</p>
                  <p><span className="text-neutral-500 dark:text-neutral-400">Country:</span> {selectedOrder.country || "Not specified"}</p>
                  <p><span className="text-neutral-500 dark:text-neutral-400">Postal Code:</span> {selectedOrder.postalCode || "Not specified"}</p>
                  {selectedOrder.apt && <p><span className="text-neutral-500 dark:text-neutral-400">Apt/Suite:</span> {selectedOrder.apt}</p>}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-2">Payment Details</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-neutral-500 dark:text-neutral-400">Payment Method:</span> 
                  {formatPaymentMethod(selectedOrder.paymentMethod)}
                </p>
                {selectedOrder.transactionId && (
                  <p><span className="text-neutral-500 dark:text-neutral-400">Transaction ID:</span> {selectedOrder.transactionId}</p>
                )}
              </div>
            </div>
            
            <div className="mb-6 border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <h4 className="font-medium mb-2">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Subtotal:</span>
                  <span>{formatCurrency(selectedOrder.total - selectedOrder.tax - selectedOrder.shippingFee + selectedOrder.discount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Shipping Fee:</span>
                  <span>{formatCurrency(selectedOrder.shippingFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Tax:</span>
                  <span>{formatCurrency(selectedOrder.tax)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Discount:</span>
                    <span className="text-green-500">-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-lg pt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 dark:border-neutral-700 p-6 flex justify-end space-x-3">
            <ButtonPrimary onClick={closeOrderDetailsModal}>
              Close
            </ButtonPrimary>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="nc-AdminOrderPage container py-16 lg:pb-28 lg:pt-20">
      <div className="mb-14 lg:mb-16">
        <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
          Order Management
        </h2>
        <div className="mt-3 sm:mt-5 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
          View and manage all customer orders
        </div>
      </div>
      
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex-grow">
            <Input
              type="text"
              placeholder="Search by order ID, name or transaction ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 sm:flex-nowrap">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40"
            >
              <option value="">All Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </Select>
            
            <Select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full sm:w-40"
            >
              <option value="">All Payment Methods</option>
              {paymentMethodOptions.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </Select>
            
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-40"
            />
            
            <ButtonPrimary 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setPaymentMethodFilter("");
                setDateFilter("");
              }}
              className="!bg-neutral-200 !text-neutral-700 dark:!bg-neutral-700 dark:!text-neutral-300 hover:!bg-neutral-300 dark:hover:!bg-neutral-600"
            >
              Clear
            </ButtonPrimary>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Orders Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-300 border-t-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    <th onClick={() => handleSort("id")} className="px-4 py-3.5 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700">
                      <div className="flex items-center">
                        Order ID
                        {sortField === "id" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th onClick={() => handleSort("date")} className="px-4 py-3.5 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700">
                      <div className="flex items-center">
                        Date
                        {sortField === "date" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th onClick={() => handleSort("fullName")} className="px-4 py-3.5 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700">
                      <div className="flex items-center">
                        Customer
                        {sortField === "fullName" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th onClick={() => handleSort("status")} className="px-4 py-3.5 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700">
                      <div className="flex items-center">
                        Status
                        {sortField === "status" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th onClick={() => handleSort("paymentMethod")} className="px-4 py-3.5 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700">
                      <div className="flex items-center">
                        Payment Method
                        {sortField === "paymentMethod" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th onClick={() => handleSort("total")} className="px-4 py-3.5 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700">
                      <div className="flex items-center">
                        Total
                        {sortField === "total" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-right text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">
                        #{order.id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {formatDate(order.date)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                        {order.fullName || "Guest Customer"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "Completed" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : order.status === "Pending" 
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : order.status === "Processing" 
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : order.status === "Cancelled" 
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                        }`}>
                          {order.status || "Not specified"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {formatPaymentMethod(order.paymentMethod)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => openOrderDetailsModal(order)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                No orders found matching your criteria
              </div>
            )}
            
            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700 mt-6 pt-6">
              <div className="text-sm text-neutral-700 dark:text-neutral-300">
                Showing {filteredOrders.length > 0 ? currentPage * pageSize + 1 : 0} to {Math.min((currentPage + 1) * pageSize, filteredOrders.length)} of {filteredOrders.length} orders
              </div>
              <div className="flex items-center space-x-4">
                <select 
                  className="form-select rounded-md border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 dark:bg-neutral-800"
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
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
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
                    Page {currentPage + 1} of {totalPages || 1}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage >= totalPages - 1
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
      
      {/* Order Details Modal */}
      {isOrderDetailsModalOpen && <OrderDetailsModal />}
    </div>
  );
};

export default AdminOrderPage;