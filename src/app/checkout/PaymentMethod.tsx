"use client";

import Label from "@/components/Label/Label";
import React, { FC, useState } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Input from "@/shared/Input/Input";
import Radio from "@/shared/Radio/Radio";

import { PaymentMethodData } from "./page";

interface Props {
  isActive: boolean;
  onCloseActive: () => void;
  onOpenActive: () => void;
  onSubmit: (paymentData: PaymentMethodData) => void;
  initialData: PaymentMethodData;
}

const PaymentMethod: FC<Props> = ({
  isActive,
  onCloseActive,
  onOpenActive,
  onSubmit,
  initialData,
}) => {
  const [methodActive, setMethodActive] = useState<
    "Credit-Card" | "Home"
  >("Credit-Card");

  // At the top of your component, update the initial state
  const [formData, setFormData] = useState<PaymentMethodData>({
    ...initialData,
    paymentType: methodActive // Set default payment type
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update formData with payment type using setState
    setFormData(prev => ({
      ...prev,
      paymentType: methodActive
    }));

    // Use the updated formData in onSubmit
    onSubmit({
      ...formData,
      paymentType: methodActive
    });
    onCloseActive();
  };

  const renderDebitCredit = () => {
    const active = methodActive === "Credit-Card";
    return (
      <div className="flex items-start space-x-4 sm:space-x-6">
        <Radio
          className="pt-3.5"
          name="payment-method"
          id="Credit-Card"
          defaultChecked={active}
          onChange={(e) => setMethodActive(e as any)}
        />
        <div className="flex-1">
          <label
            htmlFor="Credit-Card"
            className="flex items-center space-x-4 sm:space-x-6"
          >
            <div
              className={`p-2.5 rounded-xl border-2 ${
                active
                  ? "border-slate-600 dark:border-slate-300"
                  : "border-gray-200 dark:border-slate-600"
              }`}
            >
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M2 12.6101H19"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 10.28V17.43C18.97 20.28 18.19 21 15.22 21H5.78003C2.76003 21 2 20.2501 2 17.2701V10.28C2 7.58005 2.63 6.71005 5 6.57005C5.24 6.56005 5.50003 6.55005 5.78003 6.55005H15.22C18.24 6.55005 19 7.30005 19 10.28Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 6.73V13.72C22 16.42 21.37 17.29 19 17.43V10.28C19 7.3 18.24 6.55 15.22 6.55H5.78003C5.50003 6.55 5.24 6.56 5 6.57C5.03 3.72 5.81003 3 8.78003 3H18.22C21.24 3 22 3.75 22 6.73Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.25 17.8101H6.96997"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.10986 17.8101H12.5499"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="font-medium">Debit / Credit Card</p>
          </label>

          <div
            className={`mt-6 mb-4 space-y-3 sm:space-y-5 ${
              active ? "block" : "hidden"
            }`}
          >
            <div className="max-w-lg">
              <Label className="text-sm">Card number</Label>
              <Input
                autoComplete="off"
                className="mt-1.5"
                type={"text"}
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
              />
            </div>
            <div className="max-w-lg">
              <Label className="text-sm">Name on Card</Label>
              <Input
                autoComplete="off"
                className="mt-1.5"
                name="cardHolder"
                value={formData.cardHolder}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="sm:w-2/3">
                <Label className="text-sm">Expiration date (MM/YY)</Label>
                <Input
                  autoComplete="off"
                  className="mt-1.5"
                  placeholder="MM/YY"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm">CVC</Label>
                <Input
                  autoComplete="off"
                  className="mt-1.5"
                  placeholder="CVC"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const renderPaymentAtHome = () => {
    const active = methodActive === "Home";
    return (
      <div className="flex items-start space-x-4 sm:space-x-6">
        <Radio
          className="pt-3.5"
          name="payment-method"
          id="Home"
          defaultChecked={active}
          onChange={(e) => setMethodActive(e as any)}
        />
        <div className="flex-1">
          <label
            htmlFor="Home"
            className="flex items-center space-x-4 sm:space-x-6"
          >
            <div
              className={`p-2.5 rounded-xl border-2 ${
                active
                  ? "border-slate-600 dark:border-slate-300"
                  : "border-gray-200 dark:border-slate-600"
              }`}
            >
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M2 12.6101H19"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 10.28V17.43C18.97 20.28 18.19 21 15.22 21H5.78003C2.76003 21 2 20.2501 2 17.2701V10.28C2 7.58005 2.63 6.71005 5 6.57005C5.24 6.56005 5.50003 6.55005 5.78003 6.55005H15.22C18.24 6.55005 19 7.30005 19 10.28Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 6.73V13.72C22 16.42 21.37 17.29 19 17.43V10.28C19 7.3 18.24 6.55 15.22 6.55H5.78003C5.50003 6.55 5.24 6.56 5 6.57C5.03 3.72 5.81003 3 8.78003 3H18.22C21.24 3 22 3.75 22 6.73Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.25 17.8101H6.96997"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.10986 17.8101H12.5499"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="font-medium">Payment at Home</p>
          </label>
        </div>
      </div>
    );
  };

  const renderPaymentMethod = () => {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl ">
        <div className="p-6 flex flex-col sm:flex-row items-start">
          <span className="hidden sm:block">
            <svg
              className="w-6 h-6 text-slate-700 dark:text-slate-400 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.92969 15.8792L15.8797 3.9292"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.1013 18.2791L12.3013 17.0791"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.793 15.5887L16.183 13.1987"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.60127 10.239L10.2413 3.599C12.3613 1.479 13.4213 1.469 15.5213 3.569L20.4313 8.479C22.5313 10.579 22.5213 11.639 20.4013 13.759L13.7613 20.399C11.6413 22.519 10.5813 22.529 8.48127 20.429L3.57127 15.519C1.47127 13.419 1.47127 12.369 3.60127 10.239Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 21.9985H22"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="sm:ml-8">
            <h3 className=" text-slate-700 dark:text-slate-400 flex ">
              <span className="uppercase tracking-tight">PAYMENT METHOD</span>
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-5 h-5 ml-3 text-slate-900"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </h3>
            <div className="font-semibold mt-1 text-sm">
              <span className="">Google / Apple Wallet</span>
              <span className="ml-3">xxx-xxx-xx55</span>
            </div>
          </div>
          <button
            className="py-2 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 mt-5 sm:mt-0 sm:ml-auto text-sm font-medium rounded-lg"
            onClick={onOpenActive}
          >
            Change
          </button>
        </div>

        <div
          className={`border-t border-slate-200 dark:border-slate-700 px-6 py-7 space-y-6 ${
            isActive ? "block" : "hidden"
          }`}
        >
        <form onSubmit={handleSubmit}>
          {/* ==================== */}
          <div>{renderDebitCredit()}</div>
          <div>{renderPaymentAtHome()}</div>

          <div className="flex pt-6">
            <ButtonPrimary
              className="w-full max-w-[240px]"
              type="submit"
            >
              Save and next to Confirm Order
            </ButtonPrimary>
            <ButtonSecondary className="ml-3" onClick={onCloseActive}>
              Cancel
            </ButtonSecondary>
          </div>
          </form>
        </div>
      </div>
    );
  };
  return renderPaymentMethod();
};

export default PaymentMethod;
