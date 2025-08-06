"use client";
import React, { FC, useState } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import LikeButton from "@/components/LikeButton";
import { StarIcon } from "@heroicons/react/24/solid";
import BagIcon from "@/components/BagIcon";
import NcInputNumber from "@/components/NcInputNumber";
import { PRODUCTS } from "@/data/data";
import {
  NoSymbolIcon,
  ClockIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import IconDiscount from "@/components/IconDiscount";
import Prices from "@/components/Prices";
import toast from "react-hot-toast";
import detail1JPG from "@/images/products/detail1.jpg";
import detail2JPG from "@/images/products/detail2.jpg";
import detail3JPG from "@/images/products/detail3.jpg";
import NotifyAddTocart from "./NotifyAddTocart";
import AccordionInfo from "@/components/AccordionInfo";
import Image from "next/image";
import Link from "next/link";
import { ProductExtend } from "@/app/collection/page";
import axios from "axios";

export interface ProductQuickViewProps {
  className?: string;
  data: ProductExtend;
}

const ProductQuickView: FC<ProductQuickViewProps> = ({ className = "",data }) => {
  const { variants, numberOfReviews } = data;
  const sizeList = Array.from(new Set(data.variants.map(item => item.size)));
  const colorList = Array.from(new Set(data.variants.map(item => item.color)));    

  // Định nghĩa màu sắc tương ứng (Map màu từ text -> mã màu HEX)
  const colorMap: { [key: string]: string } = {
    Xanh: "#008000",  // Màu xanh lá
    Đỏ: "#FF0000",    // Màu đỏ
    Vàng: "#FFD700",  // Màu vàng
    Hồng: "#FFC0CB",
    Tím: "#6A0DAD",
    Đen: "#000000",
    Trắng: "#FFFFFF"

  };

  const [variantActive, setVariantActive] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);

  const selectedVariant = data.variants.find(
    (variant) => variant.size === sizeList[selectedSize] && colorList[selectedColor] === variant.color
  );
  
  // Lấy giá (nếu không tìm thấy thì mặc định là 0)
  const selectedPrice = selectedVariant ? selectedVariant.price : "0";

  const [qualitySelected, setQualitySelected] = useState(1);

  const notifyAddTocart = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // Check if user is logged in
      if (!token) {
        toast.error("Please login to add items to cart");
        return;
      }
      
      // Prepare data for API call
      const cartItem = {
        productDetailID: data.id, // Use the selected variant ID or product ID
        quantity: qualitySelected,
      };
      
      // Make API call to add item to cart
      // Import axios at the top of the file if not already imported
      const response = await axios.post('http://localhost:8080/cart/add', cartItem, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Check if request was successful (axios throws error on non-2xx responses)
      // So we need to check response.data or any specific property your API returns
      if (!response.data) {
        throw new Error('Failed to add item to cart');
      }
      
      // Show success notification
      toast.custom(
        (t) => (
          <NotifyAddTocart
            productImage={variants[0].images[0]}
            qualitySelected={qualitySelected}
            show={t.visible}
            sizeSelected={sizeList[selectedSize]}
            colorSelected={colorList[selectedColor]}
          />
        ),
        { position: "top-right", id: "nc-product-notify", duration: 3000 }
      );
      
      // Optional: You can also refresh the cart count or update cart state here
      
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  const renderVariants = () => {
    if (!variants || !variants.length) {
      return null;
    }

    return (
      <div>
        <label htmlFor="">
          <span className="text-sm font-medium">
            Color:
            <span className="ml-1 font-semibold">
              {colorList[selectedColor]}
            </span>
          </span>
        </label>
        <div className="flex mt-2.5">
          {colorList.map((color, index) => (
            <div
              key={index}
              onClick={() => setSelectedColor(index)}
              className={`relative flex-1 max-w-[75px] h-10 rounded-full border-2 cursor-pointer 
                ${selectedColor === index
                  ? "border-primary-6000 dark:border-primary-500"
                  : "border-transparent"
              }`}
            >
              <div className="absolute inset-0.5 rounded-full overflow-hidden z-0">
                <Image
                  src={""}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="absolute w-full h-full object-cover"
                />
                
              </div>
              <div
            className="w-6 h-6 rounded-full border border-gray-300 cursor-pointer" 
            style={{
              backgroundColor: colorMap[color] || "#ccc", // Mặc định nếu không tìm thấy màu
            }}
            title={colorMap[index]} // Hiển thị tên màu khi hover
          ></div>
            
            </div>
            
          
          ))}
        </div>
      </div>
    );
  };

  const renderSizeList = () => {
    if (!sizeList || !sizeList || !sizeList.length) {
      return null;
    }
    return (
      <div>
        <div className="flex justify-between font-medium text-sm">
          <label htmlFor="">
            <span className="">
              Size:
              <span className="ml-1 font-semibold">{sizeList[selectedSize]}</span>
            </span>
          </label>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="##"
            className="text-primary-6000 hover:text-primary-500"
          >
          </a>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 mt-2.5">
          {sizeList.map((size, index) => {
            const isActive = size === sizeList[selectedSize];
            const sizeOutStock = !sizeList.includes(size);
            return (
              <div
                key={index}
                className={`relative h-10 sm:h-11 rounded-2xl border flex items-center justify-center 
                text-sm sm:text-base uppercase font-semibold select-none overflow-hidden z-0 ${
                  sizeOutStock
                    ? "text-opacity-20 dark:text-opacity-20 cursor-not-allowed"
                    : "cursor-pointer"
                } ${
                  isActive
                    ? "bg-primary-6000 border-primary-6000 text-white hover:bg-primary-6000"
                    : "border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                }`}
                onClick={() => {
                  if (sizeOutStock) {
                    return;
                  }
                  setSelectedSize(index);
                }}
              >
                {size}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStatus = () => {
    if (!status) {
      return null;
    }
    const CLASSES =
      "absolute top-3 left-3 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 nc-shadow-lg rounded-full flex items-center justify-center text-slate-700 text-slate-900 dark:text-slate-300";
    if (status === "New in") {
      return (
        <div className={CLASSES}>
          <SparklesIcon className="w-3.5 h-3.5" />
          <span className="ml-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === "50% Discount") {
      return (
        <div className={CLASSES}>
          <IconDiscount className="w-3.5 h-3.5" />
          <span className="ml-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === "Sold Out") {
      return (
        <div className={CLASSES}>
          <NoSymbolIcon className="w-3.5 h-3.5" />
          <span className="ml-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === "limited edition") {
      return (
        <div className={CLASSES}>
          <ClockIcon className="w-3.5 h-3.5" />
          <span className="ml-1 leading-none">{status}</span>
        </div>
      );
    }
    return null;
  };

  const renderSectionContent = () => {
    return (
      <div className="space-y-8">
        {/* ---------- 1 HEADING ----------  */}
        <div>
          <h2 className="text-2xl font-semibold hover:text-primary-6000 transition-colors">
            <Link href="/product-detail">{data.name}</Link>
          </h2>

          <div className="flex items-center mt-5 space-x-4 sm:space-x-5">
            {/* <div className="flex text-xl font-semibold">$112.00</div> */}
            <Prices
              contentClass="py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold"
              price={selectedPrice}
            />

            <div className="h-6 border-l border-slate-300 dark:border-slate-700"></div>

            <div className="flex items-center">
              <Link
                href="/product-detail"
                className="flex items-center text-sm font-medium"
              >
                <StarIcon className="w-5 h-5 pb-[1px] text-yellow-400" />
                <div className="ml-1.5 flex">
                  <span>{data.rating}</span>
                  <span className="block mx-2">·</span>
                  <span className="text-slate-600 dark:text-slate-400 underline">
                    {data.category || 99} reviews
                  </span>
                </div>
              </Link>
              <span className="hidden sm:block mx-2.5">·</span>
              <div className="hidden sm:flex items-center text-sm">
                <SparklesIcon className="w-3.5 h-3.5" />
                <span className="ml-1 leading-none">{status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- 3 VARIANTS AND SIZE LIST ----------  */}
        <div className="">{renderVariants()}</div>
        <div className="">{renderSizeList()}</div>

        {/*  ---------- 4  QTY AND ADD TO CART BUTTON */}
        <div className="flex space-x-3.5">
          <div className="flex items-center justify-center bg-slate-100/70 dark:bg-slate-800/70 px-2 py-3 sm:p-3.5 rounded-full">
            
            { selectedPrice !== "0" ? (
            <NcInputNumber
              defaultValue={qualitySelected}
              onChange={setQualitySelected}
            />
            ) : (
              <span className="text-red-500 font-semibold">Hết hàng</span>          
            )}
          </div>
          
          <ButtonPrimary
            className="flex-1 flex-shrink-0"
            onClick={notifyAddTocart}
            disabled={selectedPrice === "0"} // ✅ Nếu `selectedPrice === "0"`, nút sẽ bị vô hiệu
            >
            <BagIcon className="hidden sm:inline-block w-5 h-5 mb-0.5" />
            <span className="ml-3">Add to cart</span>
          </ButtonPrimary>
        </div>

        {/*  */}
        <hr className=" border-slate-200 dark:border-slate-700"></hr>
        {/*  */}

        {/* ---------- 5 ----------  */}
        <AccordionInfo
          data={[
            {
              name: "Description",
              content: data.description
                // "Fashion is a form of self-expression and autonomy at a particular period and place and in a specific context, of clothing, footwear, lifestyle, accessories, makeup, hairstyle, and body posture.",
            },
            {
              name: "Features",
              content: `<ul class="list-disc list-inside leading-7">
            <li>Material: 43% Sorona Yarn + 57% Stretch Polyester</li>
            <li>
             Casual pants waist with elastic elastic inside
            </li>
            <li>
              The pants are a bit tight so you always feel comfortable
            </li>
            <li>
              Excool technology application 4-way stretch
            </li>
          </ul>`,
            },
          ]}
        />
      </div>
    );
  };

  return (
    <div className={`nc-ProductQuickView ${className}`}>
      {/* MAIn */}
      <div className="lg:flex">
        {/* CONTENT */}
        <div className="w-full lg:w-[50%] ">
          {/* HEADING */}
          <div className="relative">
            <div className="aspect-w-16 aspect-h-16">
              <Image
                src={variants[0].images[0]}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="w-full rounded-xl object-cover"
                alt="product detail 1"
              />
            </div>

            {/* STATUS */}
            {renderStatus()}
            {/* META FAVORITES */}
            <LikeButton className="absolute right-3 top-3 " />
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-3 mt-3 sm:gap-6 sm:mt-6 xl:gap-5 xl:mt-5">
            {variants.map((item, index) => {
              return (
                <div key={index} className="aspect-w-3 aspect-h-4">
                  <Image
                    fill
                    
                    src={item.images[0]}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="w-full rounded-xl object-cover"
                    alt="product detail 1"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="w-full lg:w-[50%] pt-6 lg:pt-0 lg:pl-7 xl:pl-8">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;
