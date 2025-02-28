"use client";

import { ACCOUNT_URL } from "@/data/navigation";
import { Route } from "@/routers/types";
import Avatar from "@/shared/Avatar/Avatar";
import axios from "axios";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FC } from "react";

export interface CommonLayoutProps {
  children?: React.ReactNode;
}

const pages: {
  name: string;
  link: Route;
}[] = [
  {
    name: "Account info",
    link: "/account",
  },
  {
    name: "Save lists",
    link: "/account-savelists",
  },
  {
    name: " My order",
    link: "/account-order",
  },
  {
    name: "Change password",
    link: "/account-password",
  },
  {
    name: "Change Billing",
    link: "/account-billing",
  },
];

const CommonLayout: FC<CommonLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    axios.get(ACCOUNT_URL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then((response) => {
      if (response.data && response.data.data) {
        var data = response.data.data;
        var code = response.data.code;
        if (code == 200) {
          console.log(data);
          setEmail(data.email);          
          if (data.userInfo) {
            setFullName(data.userInfo.fullName);
            setAddress(data.userInfo.address);

            data.userInfo.email = data.email;
            localStorage.setItem("userInfo", JSON.stringify(data.userInfo));
          }
        }
      }
    })
    .catch((error) => {
      console.error("Lỗi khi gọi API:", error);
    });
  }, []);

  return (
    <div className="nc-AccountCommonLayout container">
      <div className="mt-14 sm:mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="max-w-2xl">
            <h2 className="text-3xl xl:text-4xl font-semibold">Account</h2>
            <span className="block mt-4 text-neutral-500 dark:text-neutral-400 text-base sm:text-lg">
              <span className="text-slate-900 dark:text-slate-200 font-semibold">
                {fullName},
              </span>{" "}
              {email} · {address}
            </span>
          </div>
          <hr className="mt-10 border-slate-200 dark:border-slate-700"></hr>

          <div className="flex space-x-8 md:space-x-14 overflow-x-auto hiddenScrollbar">
            {pages.map((item, index) => {
              return (
                <Link
                  key={index}
                  href={item.link}
                  className={`block py-5 md:py-8 border-b-2 flex-shrink-0 text-sm sm:text-base ${
                    pathname === item.link
                      ? "border-primary-500 font-medium text-slate-900 dark:text-slate-200"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
          <hr className="border-slate-200 dark:border-slate-700"></hr>
        </div>
      </div>
      <div className="max-w-4xl mx-auto pt-14 sm:pt-26 pb-24 lg:pb-32">
        {children}
      </div>
    </div>
  );
};

export default CommonLayout;
