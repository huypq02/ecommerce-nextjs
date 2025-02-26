"use client"

import Label from "@/components/Label/Label";
import React, { FC, useEffect, useState } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Input from "@/shared/Input/Input";
import Select from "@/shared/Select/Select";
import Textarea from "@/shared/Textarea/Textarea";
import { avatarImgs } from "@/contains/fakeData";
import Image from "next/image";
import axios from "axios";
import { ACCOUNT_URL } from "@/data/navigation";
import { useElements } from "@stripe/react-stripe-js";
import { setEnvironmentData } from "worker_threads";

const AccountPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("");

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
            setAddress(data.userInfo.addreess);
            setPhone(data.userInfo.phone);
            setBirthday(data.userInfo.birthday);
            setDescription(data.userInfo.description);
            setGender(data.userInfo.gender);
          }
        }
      }
    })
    .catch((error) => {
      console.error("Lỗi khi gọi API:", error);
    });
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await axios.post(ACCOUNT_URL, {
        email,
        fullName,
        address,
        phone,
        birthday,
        description,
        gender
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log(response);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const {name, value} = e.target;
    switch (name)
    {
      case "fullName":
        setFullName(value);
        break;
      case "address":
        setAddress(value);
        break;
      case "phone":
        setPhone(value);
        break;
      case "birthday":
        setBirthday(value);
        break;
      case "gender":
        setGender(value);
        break;
      case "description":
        setDescription(value);
        break;
      default:
          break;
    }

  };

  return (
    <div className={`nc-AccountPage `}>
      <div className="space-y-10 sm:space-y-12">
        {/* HEADING */}
        <h2 className="text-2xl sm:text-3xl font-semibold">
          Account infomation
        </h2>
        <div className="flex flex-col md:flex-row">
          <div className="flex-shrink-0 flex items-start">
            {/* AVATAR */}
            <div className="relative rounded-full overflow-hidden flex">
              <Image
                src={avatarImgs[2]}
                alt="avatar"
                width={128}
                height={128}
                className="w-32 h-32 rounded-full object-cover z-0"
              />
              <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-neutral-50 cursor-pointer">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.5 5H7.5C6.83696 5 6.20107 5.26339 5.73223 5.73223C5.26339 6.20107 5 6.83696 5 7.5V20M5 20V22.5C5 23.163 5.26339 23.7989 5.73223 24.2678C6.20107 24.7366 6.83696 25 7.5 25H22.5C23.163 25 23.7989 24.7366 24.2678 24.2678C24.7366 23.7989 25 23.163 25 22.5V17.5M5 20L10.7325 14.2675C11.2013 13.7988 11.8371 13.5355 12.5 13.5355C13.1629 13.5355 13.7987 13.7988 14.2675 14.2675L17.5 17.5M25 12.5V17.5M25 17.5L23.0175 15.5175C22.5487 15.0488 21.9129 14.7855 21.25 14.7855C20.5871 14.7855 19.9513 15.0488 19.4825 15.5175L17.5 17.5M17.5 17.5L20 20M22.5 5H27.5M25 2.5V7.5M17.5 10H17.5125"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span className="mt-1 text-xs">Change Image</span>
              </div>
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
          <div className="flex-grow mt-10 md:mt-0 md:pl-16 max-w-3xl space-y-6">
            <form onSubmit={handleSubmit}>
            <div>
              <Label>Full name</Label>
              <Input className="mt-1.5" name="fullName" value={fullName} onChange={handleChange}/>
            </div>

            {/* ---- */}

            {/* ---- */}
            <div>
              <Label>Email</Label>
              <div className="mt-1.5 flex">
                <span className="inline-flex items-center px-2.5 rounded-l-2xl border border-r-0 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                  <i className="text-2xl las la-envelope"></i>
                </span>
                <Input
                  className="!rounded-l-none"
                  placeholder="example@email.com"
                  name="email"
                  defaultValue={email}
                />
              </div>
            </div>

            {/* ---- */}
            <div className="max-w-lg">
              <Label>Date of birth</Label>
              <div className="mt-1.5 flex">
                <span className="inline-flex items-center px-2.5 rounded-l-2xl border border-r-0 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                  <i className="text-2xl las la-calendar"></i>
                </span>
                <Input
                  className="!rounded-l-none"
                  type="date"
                  value={birthday}
                  name="birthday"
                  onChange={handleChange}
                />
              </div>
            </div>
            {/* ---- */}
            <div>
              <Label>Addess</Label>
              <div className="mt-1.5 flex">
                <span className="inline-flex items-center px-2.5 rounded-l-2xl border border-r-0 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                  <i className="text-2xl las la-map-signs"></i>
                </span>
                <Input
                  className="!rounded-l-none"
                  name="address"
                  value={address}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* ---- */}
            <div>
              <Label>Gender</Label>
              <Select className="mt-1.5" name="gender" value={gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </div>

            {/* ---- */}
            <div>
              <Label>Phone number</Label>
              <div className="mt-1.5 flex">
                <span className="inline-flex items-center px-2.5 rounded-l-2xl border border-r-0 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                  <i className="text-2xl las la-phone-volume"></i>
                </span>
                <Input className="!rounded-l-none" name="phone" onChange={handleChange}
                  defaultValue={phone} />
              </div>
            </div>
            {/* ---- */}
            <div>
              <Label>About you</Label>
              <Textarea className="mt-1.5" name="description" value={description} onChange={handleChange}/>
            </div>
            <div className="pt-2">
              <ButtonPrimary type="submit">Update account</ButtonPrimary>
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
