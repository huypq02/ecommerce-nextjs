"use client";

import React, { FC, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import LikeButton from "@/components/LikeButton";
import { StarIcon } from "@heroicons/react/24/solid";
import BagIcon from "@/components/BagIcon";
import NcInputNumber from "@/components/NcInputNumber";
import Prices from "@/components/Prices";
import toast from "react-hot-toast";
import SectionSliderProductCard from "@/components/SectionSliderProductCard";
import Policy from "./Policy";
import ReviewItem from "@/components/ReviewItem";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import SectionPromo2 from "@/components/SectionPromo2";
import NotifyAddTocart from "@/components/NotifyAddTocart";
import Image from "next/image";
import AccordionInfo from "@/components/AccordionInfo";
import { ProductExtend } from "../collection/page";
import axios from "axios";

export interface ProductQuickViewProps {
  className?: string;
}
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

const ProductDetailPage: FC<ProductQuickViewProps> = ({ className = "" }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id"); // ✅ Lấy ID từ URL



  const [product, setProduct] = useState<ProductExtend | null>(null);
  const [variantActive, setVariantActive] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [qualitySelected, setQualitySelected] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);


  useEffect(() => {
    const savedProduct = localStorage.getItem("selectedProduct");

    if (savedProduct) {
      setProduct(JSON.parse(savedProduct));
    } else {
      router.push("/"); // ✅ Nếu không có sản phẩm, quay về trang danh sách
    }
  }, [router]);

  const sizeList = Array.from(new Set(product?.variants.map(item => item.size)));
  const colorList = Array.from(new Set(product?.variants.map(item => item.color)));   

  const selectedVariant = product?.variants.find(
    (variant) => variant.size === sizeList[selectedSize] && colorList[selectedColor] === variant.color
  );

  // Lấy giá (nếu không tìm thấy thì mặc định là 0)
  const selectedPrice = selectedVariant ? selectedVariant.price : "0";

  const dataDescription = product
  ? [
      {
        name: "Description",
        content: product.description || "No description available.",
      },
    ]
  : [];

  const notifyAddTocart = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // Check if user is logged in
      if (!token) {
        toast.error("Please login to add items to cart");
        return;
      }
      
      // Check if product exists
      if (!product) {
        toast.error("Product information not available");
        return;
      }

      // Prepare data for API call
      const cartItem = {
        productDetailID: product.id, // Use the selected variant ID or product ID
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
            productImage={product?.variants[0].images[0] || ""}
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

  return (
    <div className={`nc-ProductDetailPage ${className}`}>
      <main className="container mt-5 lg:mt-11">
        <div className="lg:flex">
          {/* IMAGE SECTION */}
          <div className="w-full lg:w-[55%]">
            <div className="relative">
              <Image
                src={product?.variants[0].images[selectedImage] || ""}
                width={500}
                height={500}
                className="w-full rounded-2xl object-cover"
                alt="product detail"
              />
              {/* <LikeButton className="absolute right-3 top-3 " /> */}
            </div>
          </div>

          {/* PRODUCT DETAILS */}
          <div className="w-full lg:w-[45%] pt-10 lg:pt-0 lg:pl-7 xl:pl-9 2xl:pl-10">
            <h2 className="text-2xl sm:text-3xl font-semibold">{product?.name}</h2>
            <p className="text-sm text-gray-500 mt-2"></p>

            <div className="flex items-center mt-5 space-x-4 sm:space-x-5">
              <Prices price={selectedPrice || "0"} />
              <span className="ml-1.5">{99} Reviews</span>
            </div>

            {/* SIZE AND COLOR SELECTION */}
            <div className="mt-4">
              <label className="text-sm font-medium">Color: {colorList[selectedColor]}</label>
              <div className="flex space-x-2 mt-2">
                {colorList.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(index)}
                    className={`w-12 h-8 border-2 rounded-lg transition-all duration-200 flex items-center justify-center
                    ${selectedColor === index ? "border-black scale-110 shadow-md" : "border-gray-300"}
                  `}
                    style={{
                      backgroundColor: colorMap[item] || "#ddd", // Màu nền từ colorMap, nếu không có thì mặc định
                      color: selectedColor === index ? "white" : "black",
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">Size: {sizeList[selectedSize]}</label>
              <div className="flex space-x-2 mt-2">
                {sizeList.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(index)}
                    className={`w-12 h-8 border-2 rounded-lg transition-all duration-200 flex items-center justify-center
                    ${selectedSize === index ? "border-black scale-110 shadow-md" : "border-gray-300"}
                  `}
                    style={{
                      backgroundColor: colorMap[item] || "#ddd", // Màu nền từ colorMap, nếu không có thì mặc định
                      color: selectedSize === index ? "white" : "black",
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* ADD TO CART */}
            <div className="flex items-center justify-between space-x-3.5 mt-6">
              <div className="flex-1 flex justify-center">
                {selectedPrice !== "0" ? (
                  <NcInputNumber
                    defaultValue={qualitySelected}
                    onChange={setQualitySelected}
                    className="w-full min-w-[100px]"
                  />
                ) : (
                  <span className="text-red-500 font-semibold w-full min-w-[100px] text-center">
                    Hết hàng
                  </span>
                )}
              </div>

              <ButtonPrimary className="flex-1 flex-shrink-0" onClick={notifyAddTocart}>
                <BagIcon className="hidden sm:inline-block w-5 h-5 mb-0.5" />
                <span className="ml-3">Add to cart</span>
              </ButtonPrimary>
            </div>

            <hr className="mt-6 border-slate-200 dark:border-slate-700" />

            {/* POLICY & DETAILS */}
            <AccordionInfo   data={dataDescription} />
            <br></br>
            <Policy />
          </div>
        </div>

        {/* REVIEWS */}
        <div className="mt-12 sm:mt-16 space-y-10 sm:space-y-16">
          <h2 className="text-2xl font-semibold flex items-center">
            <StarIcon className="w-7 h-7 mb-0.5" />
            <span className="ml-1.5"> {product?.rating} · {99} Reviews</span>
          </h2>

          <div className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-11 gap-x-28">
              <ReviewItem />
              <ReviewItem
                data={{
                  comment: `The quality and sizing mentioned were accurate and really happy with the purchase.`,
                  date: "August 15, 2022",
                  name: "Gropishta keo",
                  starPoint: 5,
                }}
              />
            </div>
          </div>
        </div>

        {/* OTHER PRODUCTS */}
        {/* <SectionSliderProductCard heading="Customers also purchased" subHeading="" /> */}
        <div className="pb-20 xl:pb-28 lg:pt-14">
          <SectionPromo2 />
        </div>
      </main>
    </div>
  );
};

export default ProductDetailPage;