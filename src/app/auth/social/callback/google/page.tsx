"use client";
import React, { FC, use, useEffect, useState } from "react";
import axios from "axios";
import { OAUTH2_URL_GOOGLE_CALLBACK } from "@/data/navigation";
import { useSearchParams } from "next/navigation";

const LoginType = "google";

const GoogleLogin = () => {
  const searchParams = useSearchParams();
  let code = searchParams.get("code");

  useEffect(() => {
    axios
      .get(`${OAUTH2_URL_GOOGLE_CALLBACK}?code=${code}&loginType=${LoginType}`)
      .then((response) => {
        if (response.data && response.data.data) {
          var data = response.data;
          var code = data.code;
          if (code == 200) {
            window.location.href = "/collection";
          }
        }
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API:", error);
      });
  }, []);
};

export default GoogleLogin;
