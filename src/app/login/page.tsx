'use client';
import React, { FC, useState } from "react";
import facebookSvg from "@/images/Facebook.svg";
import twitterSvg from "@/images/Twitter.svg";
import googleSvg from "@/images/Google.svg";
import Input from "@/shared/Input/Input";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { OAUTH2_URL_GOOGLE } from "@/data/navigation";
import { useRouter } from "next/navigation";

function handleGoogleLogin() {
    axios
      .get(OAUTH2_URL_GOOGLE + "?loginType=google")
      .then((response) => {
        if (response.data && response.data.data) {        
          console.log(response);
  
          var data = response.data;
          var code = data.code;
          if (code == 200) {
            var path = data.data;
            window.location = path;
          }
        }
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API: ", error);
      });
  };

  function handleFacebookLogin() {
    // Store loginType in localStorage before redirect
    const type = "facebook";
    localStorage.setItem('socialLoginType', type);

    axios
      .get(OAUTH2_URL_GOOGLE + "?loginType=" + type)
      .then((response) => {
        if (response.data && response.data.data) {        
          console.log(response);
  
          var data = response.data;
          var code = data.code;
          if (code == 200) {
            var path = data.data;
            window.location = path;
          }
        }
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API: ", error);
      });
  };

const loginSocials = [
  {
    name: "Continue with Facebook",
    href: "#",
    icon: facebookSvg,
    onclick: handleFacebookLogin,
  },
  {
    name: "Continue with Twitter",
    href: "#",
    icon: twitterSvg,
  },
  {
    name: "Continue with Google",
    href: "#",
    icon: googleSvg,
    onclick: handleGoogleLogin,
  },
];

const PageLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.post("http://localhost:8080/login", {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.code === 200) {
        // Save token to localStorage
        localStorage.setItem("token", response.data.data);
        console.log("Login successful!");
        
        // Redirect to home page or dashboard
        router.push("/collection");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={`nc-PageLogin`} data-nc-id="PageLogin">
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
          Login
        </h2>
        <div className="max-w-md mx-auto space-y-6">
          <div className="grid gap-3">
            {loginSocials.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex w-full rounded-lg bg-primary-50 dark:bg-neutral-800 px-4 py-3 transform transition-transform sm:px-6 hover:translate-y-[-2px]"
                onClick={item.onclick}
              >
                <Image
                  className="flex-shrink-0"
                  src={item.icon}
                  alt={item.name}
                  sizes="40px"
                />
                <h3 className="flex-grow text-center text-sm font-medium text-neutral-700 dark:text-neutral-300 sm:text-sm">
                  {item.name}
                </h3>
              </a>
            ))}
          </div>
          {/* OR */}
          <div className="relative text-center">
            <span className="relative z-10 inline-block px-4 font-medium text-sm bg-white dark:text-neutral-400 dark:bg-neutral-900">
              OR
            </span>
            <div className="absolute left-0 w-full top-1/2 transform -translate-y-1/2 border border-neutral-100 dark:border-neutral-800"></div>
          </div>
          {/* FORM */}
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-500 text-center text-sm">{error}</div>
            )}
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Email address
              </span>
              <Input
                type="email"
                placeholder="example@example.com"
                className="mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="flex justify-between items-center text-neutral-800 dark:text-neutral-200">
                Password
                <Link href="/subscription" className="text-sm text-green-600">
                  Forgot password?
                </Link>
              </span>
              <Input 
                type="password" 
                className="mt-1" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <ButtonPrimary type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Continue"}
            </ButtonPrimary>
          </form>

          {/* ==== */}
          <span className="block text-center text-neutral-700 dark:text-neutral-300">
            New user? {` `}
            <Link className="text-green-600" href="/signup">
              Create an account
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageLogin;
