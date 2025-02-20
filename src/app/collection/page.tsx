"use client"

import React, { FC, useEffect, useState } from "react";
import Pagination from "@/shared/Pagination/Pagination";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import SectionSliderCollections from "@/components/SectionSliderLargeProduct";
import SectionPromo1 from "@/components/SectionPromo1";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS } from "@/data/data";
import TabFilters from "@/components/TabFilters";
import axios from "axios";
import { variants } from "@/utils/animationVariants";

const API_BASE_URL = "http://localhost:8080/product";

interface Product {
  id: number;
  name: string;
  note: string; // API trả về 'note' thay vì 'description'
  rate: string;
  productDetailDtoList: ProductDetail[];
}

interface ProductDetail {
  id: number;
  color: string;
  size: string;
  quantity: number;
  price: number;
  imageDtoList: ImageDto[];
}

interface ImageDto {
  id: number;
  urlName: string;
}

export interface ProductExtend {
  id: number;
  name: string;
  description: string;
  variants: {
    price: number;
    color: string;
    size: string;
    images: string[];
  }[],
  category: "Category 1";
  tags: ["tag1", "tag2"];
  link: "/product-detail/";
  variantType?: "color";
  allOfSizes?: string[];
  rating?: string;
  status?: string;
  numberOfReviews?: number;
}
// export interface ProductsVariants{
//   id: number,
//   name: string,
//   thumbnail: string,
//   featuredImage: ImageDto[],
// }

const PageCollection = ({}) => {
  const [products, setProducts] = useState<ProductExtend[]>([]);
  const [pageNumber, setPageNumber] = useState(4); // Trang hiện tại
  const [pageSize, setPageSize] = useState(0);


  useEffect(() => {
    fetchProducts(pageNumber,pageSize,true);
  }, [pageNumber,pageSize,true]); // Gọi lại API khi pageNumber thay đổi


  const fetchProducts = async (page:number,pagSize:number,reset: boolean = false) => {
      try {
        const response = await axios.get(`${API_BASE_URL}?pageNumber=${page}&pageSize=${pagSize}`);
        if (response.data.code === 200) {
          // Chuyển đổi dữ liệu API sang ProductExtend
          const formattedProducts: ProductExtend[] = response.data.data.map(
            (product: Product) => ({
              id: product.id,
              name: product.name,
              description: product.note,  
              variants: product.productDetailDtoList.map((variant) => ({
                price: variant.price,
                color: variant.color,
                size: variant.size,
                images: variant.imageDtoList.map((img) => img.urlName),})),      
              category: "Category 1",
              tags: ["tag1", "tag2"],
              link: "/product-detail/",
              variantType: "color",
              allOfSizes: Array.from(new Set(product.productDetailDtoList.map((detail) => detail.size))),
              status: "",
              rating: product.rate.toString(),
              numberOfReviews: 99,
            })
          );
          if(reset){
            setProducts(formattedProducts);
          } else{
            setProducts((prev) => [...prev,...formattedProducts]);
          }


        } else {
          console.error("Lỗi API:", response.data.message);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };



    // Hàm tăng pageNumber khi bấm "Show me more"
    const handleLoadMore = () => {
        console.log(products.length,pageNumber)
        setPageNumber((prev) => prev + 4);
        //setPageSize((prev) => prev+1);
      
    };

  return (
    <div className={`nc-PageCollection`}>
      <div className="container py-16 lg:pb-28 lg:pt-20 space-y-16 sm:space-y-20 lg:space-y-28">
        <div className="space-y-10 lg:space-y-14">
          {/* HEADING */}
          <div className="max-w-screen-sm">
            <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
              Man collection
            </h2>
            <span className="block mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
              We not only help you design exceptional products, but also make it
              easy for you to share your designs with more like-minded people.
            </span>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />
          <main>
            {/* TABS FILTER */}
            <TabFilters />

            {/* LOOP ITEMS */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10 mt-8 lg:mt-10">
              {products.map((item, id) => (
                <ProductCard data={item} key={id} />
              ))}
            </div>
            

            {/* PAGINATION */}
            <div className="flex flex-col mt-12 lg:mt-16 space-y-5 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
              <Pagination />
              <ButtonPrimary onClick={handleLoadMore} disabled={pageNumber > products.length}>
              Show me more
                </ButtonPrimary>
            </div>
          </main>
        </div>

        {/* === SECTION 5 === */}
        <hr className="border-slate-200 dark:border-slate-700" />

        <SectionSliderCollections />
        <hr className="border-slate-200 dark:border-slate-700" />

        {/* SUBCRIBES */}
        <SectionPromo1 />
      </div>
    </div>
  );
};

export default PageCollection;
