"use client";  // Đánh dấu component này là Client Component

import React, { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "@/shared/Pagination/Pagination";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import SectionSliderCollections from "@/components/SectionSliderLargeProduct";
import SectionPromo1 from "@/components/SectionPromo1";
import ProductCard from "@/components/ProductCard";
import TabFilters from "@/components/TabFilters";


// Định nghĩa kiểu dữ liệu sản phẩm và hình ảnh
interface ImageDto {
  id: number;
  urlName: string;
  allText: string;
}

interface ProductDetail {
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
  productDetailDtoList: ProductDetail[];
}

// Mở rộng dữ liệu sản phẩm để thêm thông tin cho ProductCard
interface ExtendedProduct {
  id: number;
  name: string;
  note: string;
  rate: number;
  price: number;
  thumbnail: string;
  description: string;
}

const PageCollection = () => {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);

  // Gọi API khi component được render
  useEffect(() => {
    axios
      .get("http://localhost:8080/product?pageNumber=2&pageSize=0")
      .then((response) => {
        if (response.data && response.data.data) {
          // Xử lý dữ liệu từ API để tạo ExtendedProduct
          const formattedProducts: ExtendedProduct[] = response.data.data.map((product: Product) => {
            const firstDetail = product.productDetailDtoList[0] || {
              price: 0,
              imageDtoList: [{ urlName: "https://via.placeholder.com/150" }],
            };

            return {
              id: product.id,
              name: product.name,
              note: product.note,
              rate: product.rate,
              price: firstDetail.price,
              thumbnail: firstDetail.imageDtoList[0]?.urlName || "https://via.placeholder.com/150",
              description: `Màu sắc: ${firstDetail.color || "N/A"}, Kích thước: ${firstDetail.size || "N/A"}`,
            };
          });

          setProducts(formattedProducts);
        }
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API:", error);
      });
  }, []);

  return (
    <div className={`nc-PageCollection`}>
      <div className="container py-16 lg:pb-28 lg:pt-20 space-y-16 sm:space-y-20 lg:space-y-28">
        <div className="space-y-10 lg:space-y-14">
          {/* HEADING */}
          <div className="max-w-screen-sm">
            <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">Man collection</h2>
            <span className="block mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
              We not only help you design exceptional products, but also make it easy for you to share your designs with more like-minded people.
            </span>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          <main>
            {/* TABS FILTER */}
            <TabFilters />

            {/* LOOP ITEMS */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10 mt-8 lg:mt-10">
              {products.map((product) => (
                  <h1>Xin Chao toi dang lay du lieu {product.price}</h1>
              ))}
              <h1>Xin Chao toi dang lay du lieu 12</h1>

            </div>

            {/* PAGINATION */}
            <div className="flex flex-col mt-12 lg:mt-16 space-y-5 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
              <Pagination />
              <ButtonPrimary loading>Show me more</ButtonPrimary>
            </div>
          </main>
        </div>

        <hr className="border-slate-200 dark:border-slate-700" />

        <SectionSliderCollections />
        <hr className="border-slate-200 dark:border-slate-700" />

        <SectionPromo1 />
      </div>
    </div>
  );
};

export default PageCollection;




// import React, { FC } from "react";
// import SectionSliderCollections from "@/components/SectionSliderLargeProduct";
// import SectionPromo1 from "@/components/SectionPromo1";
// import ProductCard from "@/components/ProductCard";
// import { PRODUCTS } from "@/data/data";
// import SidebarFilters from "@/components/SidebarFilters";

// const PageCollection2 = ({}) => {
//   return (
//     <div className={`nc-PageCollection2`}>
//       <div className="container py-16 lg:pb-28 lg:pt-20 space-y-16 sm:space-y-20 lg:space-y-28">
//         <div className="space-y-10 lg:space-y-14">
//           {/* HEADING */}
//           <div className="max-w-screen-sm">
//             <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
//               Man collection
//             </h2>
//             <span className="block mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
//               We not only help you design exceptional products, but also make it
//               easy for you to share your designs with more like-minded people. Toi Da O Day 123
//             </span>
//           </div>

//           <hr className="border-slate-200 dark:border-slate-700" />
//           <main>
//             {/* LOOP ITEMS */}
//             <div className="flex flex-col lg:flex-row">
//               <div className="lg:w-1/3 xl:w-1/4 pr-4">
//                 <SidebarFilters />
//               </div>
//               <div className="flex-shrink-0 mb-10 lg:mb-0 lg:mx-4 border-t lg:border-t-0"></div>
//               <div className="flex-1 ">
//                 <div className="flex-1 grid sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10 ">
//                   {PRODUCTS.map((item, index) => (
//                     <ProductCard data={item} key={index} />
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </main>
//         </div>

//         {/* === SECTION 5 === */}
//         <hr className="border-slate-200 dark:border-slate-700" />

//         <SectionSliderCollections />
//         <hr className="border-slate-200 dark:border-slate-700" />

//         {/* SUBCRIBES */}
//         <SectionPromo1 />
//       </div>
//     </div>
//   );
// };

// export default PageCollection2;
