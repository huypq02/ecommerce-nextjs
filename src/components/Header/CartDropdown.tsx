"use client";

import { Popover, Transition } from "@/app/headlessui";
import Prices from "@/components/Prices";
import { Fragment, useEffect, useState } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

interface CartItem {
  productId: string;
  productDetailId: string;
  productName: string;
  quantity: number;
  size: string;
  price: number;
  imageUrls: string[];
  color: string;
}

const fetchCartData = async () => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const response = await axios.get("http://localhost:8080/cart", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.data) {
      throw new Error("Failed to fetch cart data");
    }

    return response.data.data;
  } catch (error) {
    console.error("Error fetching cart data:", error);
    return [];
  }
};

export default function CartDropdown() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const loadCartData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCartData();
      if (Array.isArray(data)) {
        setCartItems(data);
        const subtotal = data.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);
        setSubtotal(subtotal);
      } else {
        console.error("Cart data is not an array:", data);
      }
    } catch (error) {
      console.error("Error loading cart data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load cart data when component mounts
  useEffect(() => {
    loadCartData();
  }, []);

  // Add this function to CartDropdown component
  const handleRemoveItem = async (productDetailId: string) => {
    try {
      const token = localStorage.getItem("token");
      // Call API to remove item from cart
      const response = await axios.delete(`http://localhost:8080/cart/${productDetailId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        // Update the local state by filtering out the removed item
        setCartItems(prevItems => prevItems.filter(item => item.productDetailId !== productDetailId));
        
        // Recalculate subtotal
        const updatedCartItems = cartItems.filter(item => item.productDetailId !== productDetailId);
        const newSubtotal = updatedCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setSubtotal(newSubtotal);
        
        // Update orderData in localStorage if it exists
        const storedOrderData = localStorage.getItem("orderData");
        if (storedOrderData) {
          try {
            const orderData = JSON.parse(storedOrderData);
            if (orderData.orderDetail) {
              // Filter out the removed item
              orderData.orderDetail = orderData.orderDetail.filter(
                (item: any) => item.productDetailId !== productDetailId
              );
              
              // Recalculate totals
              const newSubTotal = orderData.orderDetail.reduce(
                (acc: number, item: any) => acc + item.presentUnitPrice * item.quantity, 
                0
              );
              const newTax = newSubTotal * 0.1;
              const newTotal = newSubTotal + 9000 + newTax; // 9000 is shipping fee
              
              // Update the orderData
              orderData.tax = newTax;
              orderData.total = newTotal;
              
              // Save back to localStorage
              localStorage.setItem("orderData", JSON.stringify(orderData));
            }
          } catch (error) {
            console.error("Error updating localStorage:", error);
          }
        }
        
        console.log("Item removed successfully");
      } else {
        console.error("Failed to remove item from cart");
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const renderProduct = (item: CartItem, index: number, close: () => void) => {
    const { productName, price, imageUrls, size, quantity } = item;
    return (
      <div key={index} className="flex py-5 last:pb-0">
        <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
          <Image
            fill
            src={imageUrls[0]}
            alt={productName}
            className="h-full w-full object-contain object-center"
          />
          <Link
            onClick={close}
            className="absolute inset-0"
            href={"/product-detail"}
          />
        </div>

        <div className="ml-4 flex flex-1 flex-col">
          <div>
            <div className="flex justify-between ">
              <div>
                <h3 className="text-base font-medium ">
                  <Link onClick={close} href={"/product-detail"}>
                    {productName}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  <span>{`Natural`}</span>
                  <span className="mx-2 border-l border-slate-200 dark:border-slate-700 h-4"></span>
                  <span>{`${item.size}`}</span>
                </p>
              </div>
              <Prices price={price} className="mt-0.5" />
            </div>
          </div>
          <div className="flex flex-1 items-end justify-between text-sm">
            <p className="text-gray-500 dark:text-slate-400">{`Qty ${quantity}`}</p>

            <div className="flex">
              <button
                type="button"
                className="font-medium text-primary-6000 dark:text-primary-500 "
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveItem(item.productDetailId);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const handleCheckout = () => {
    const orderData = {
      orderDetail: cartItems.map((item) => ({
        productDetailId: item.productDetailId,
        productName: item.productName,
        quantity: item.quantity,
        presentUnitPrice: item.price,
        color: item.color,
        imageUrls: item.imageUrls,
        size: item.size,
      })),
      orderStatusHistory: null,
      userInfo: {
        fullName: "fullName",
        phone: "phone",
        address: "address",
        postalCode: "postalCode",
        city: "city",
        country: "country",
        province: "province",
        apt: "apt",
      },
      date: new Date().toISOString(),
      paymentMethod: "home",
      status: "new",
      shippingFee: 9000,
      tax: subtotal * 0.1,
      discount: 0,
      total: subtotal + 9000 + subtotal * 0.1,
    };

    console.log("orderData", orderData);
    
    localStorage.setItem("orderData", JSON.stringify(orderData));
    router.push("/checkout");
  };

  return (
    <Popover className="relative">
      {({ open, close }) => {
        // When popover opens, refresh cart data
        if (open && !isOpen) {
          setIsOpen(true);
          loadCartData();
        } else if (!open && isOpen) {
          setIsOpen(false);
        }
        
        return (
          <>
            <Popover.Button
              className={`
                  ${open ? "" : "text-opacity-90"}
                   group w-10 h-10 sm:w-12 sm:h-12 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 relative`}
            >
              <div className="w-3.5 h-3.5 flex items-center justify-center bg-primary-500 absolute top-1.5 right-1.5 rounded-full text-[10px] leading-none text-white font-medium">
                <span className="mt-[1px]">{cartItems.length}</span>
              </div>
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 2H3.74001C4.82001 2 5.67 2.93 5.58 4L4.75 13.96C4.61 15.59 5.89999 16.99 7.53999 16.99H18.19C19.63 16.99 20.89 15.81 21 14.38L21.54 6.88C21.66 5.22 20.4 3.87 18.73 3.87H5.82001"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.25 22C16.9404 22 17.5 21.4404 17.5 20.75C17.5 20.0596 16.9404 19.5 16.25 19.5C15.5596 19.5 15 20.0596 15 20.75C15 21.4404 15.5596 22 16.25 22Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.25 22C8.94036 22 9.5 21.4404 9.5 20.75C9.5 20.0596 8.94036 19.5 8.25 19.5C7.55964 19.5 7 20.0596 7 20.75C7 21.4404 7.55964 22 8.25 22Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 8H21"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <Link className="block md:hidden absolute inset-0" href={"/cart"} />
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="hidden md:block absolute z-10 w-screen max-w-xs sm:max-w-md px-4 mt-3.5 -right-28 sm:right-0 sm:px-0">
                <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                  <div className="relative bg-white dark:bg-neutral-800">
                    <div className="max-h-[60vh] p-5 overflow-y-auto hiddenScrollbar">
                      <h3 className="text-xl font-semibold">Shopping cart</h3>
                      <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {isLoading ? (
                          <div className="py-8 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
                          </div>
                        ) : Array.isArray(cartItems) && cartItems.length > 0 ? (
                          cartItems.map((item, index) => renderProduct(item, index, close))
                        ) : (
                          <div className="py-8 text-center text-neutral-500">
                            Your cart is empty
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-neutral-50 dark:bg-slate-900 p-5">
                      <p className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                        <span>
                          <span>Subtotal</span>
                          <span className="block text-sm text-slate-500 dark:text-slate-400 font-normal">
                            Shipping and taxes calculated at checkout.
                          </span>
                        </span>
                        <span className="">{subtotal.toFixed(2)} VND</span>
                      </p>
                      <div className="flex space-x-2 mt-5">
                        <ButtonSecondary
                          href="/cart"
                          className="flex-1 border border-slate-200 dark:border-slate-700"
                          onClick={close}
                        >
                          View cart
                        </ButtonSecondary>
                        <ButtonPrimary
                          onClick={() => {
                            handleCheckout();
                            close();
                          }}
                          className="flex-1"
                          disabled={cartItems.length === 0}
                        >
                          Check out
                        </ButtonPrimary>
                      </div>
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        );
      }}
    </Popover>
  );
}