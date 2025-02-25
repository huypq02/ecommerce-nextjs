"use client"

import { PAYMENT_SUCCESS_URL } from "@/data/navigation";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import router from "next/router";

const PaymentSuccess = () => {
    const searchParams = useSearchParams();
    let amount = searchParams.get("amount");
    let transactionId = searchParams.get("transactionId");

    useEffect(() => {
        let orderDataString = localStorage.getItem("orderData");
        let orderData;
        if (orderDataString) {
            orderData = JSON.parse(orderDataString);
        } else {
            console.error('Order data error');
            // Handle error (show toast, error message, etc.)
            router.push('/payment/error');
        }        
        let orderStatusHistory = [
            {
                date: "21-02-2025",
                status: "paid"
            },
            {
                date: "21-02-2025",
                status: "draf"
            }
        ];
        orderData = {
            ...orderData,
            orderStatusHistory: orderStatusHistory,
            transactionId: transactionId
        };
        axios
            .post(`${PAYMENT_SUCCESS_URL}`,
                orderData
            , {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`}
            })
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

    return (
        <main className="max-w-6xl mx-auto p-10 text-white text-center border m-10 rounded-md
        bg-gradient-to-tr from-blue-500 to-purple-500">
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold mb-2">Thank you!</h1>
                <h2 className="text-2xl">You successfully sent</h2>

                <div className="bg-white p-2 rounded-md text-purple-500 mt-5 text-4xl font-bold">
                    ${amount}
                </div>
            </div>
        </main>
    );
}

export default PaymentSuccess;
