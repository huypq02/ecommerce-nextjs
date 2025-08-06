"use client"

import { PAYMENT_SUCCESS_URL } from "@/data/navigation";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const PaymentSuccess = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const apiCallMade = useRef(false); // Track if API call has been made
    const [isProcessing, setIsProcessing] = useState(true);
    
    let amount = searchParams.get("amount");
    let transactionId = searchParams.get("transactionId");

    useEffect(() => {
        // If API call already made, don't make it again
        if (apiCallMade.current) {
            return;
        }
        
        // Set flag to true to prevent duplicate calls
        apiCallMade.current = true;
        
        let orderDataString = localStorage.getItem("submitOrder");
        let orderData;
        if (orderDataString) {
            orderData = JSON.parse(orderDataString);
        } else {
            console.error('Order data error');
            // Handle error (show toast, error message, etc.)
            router.push('/payment/error');
            return; // Exit early to prevent API call
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
        
        // Store a flag in sessionStorage to indicate this transaction is being processed
        const transactionKey = `transaction_${transactionId}`;
        if (sessionStorage.getItem(transactionKey)) {
            console.log("Transaction already being processed");
            setIsProcessing(false);
            return; // Exit early if this transaction is already being processed
        }
        
        // Mark this transaction as being processed
        sessionStorage.setItem(transactionKey, "processing");
        
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
                        // Clear the transaction flag
                        sessionStorage.removeItem(transactionKey);
                        // Clear order data
                        localStorage.removeItem("submitOrder");
                        localStorage.removeItem("orderData");
                        // Redirect
                        window.location.href = "/collection";
                    }
                }
                setIsProcessing(false);
            })
            .catch((error) => {
                console.error("Lỗi khi gọi API:", error);
                // Clear the transaction flag on error so it can be retried
                sessionStorage.removeItem(transactionKey);
                setIsProcessing(false);
            });
    }, [transactionId, router]); // Add dependencies to avoid useEffect warnings

    return (
        <main className="max-w-6xl mx-auto p-10 text-white text-center border m-10 rounded-md
        bg-gradient-to-tr from-blue-500 to-purple-500">
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold mb-2">Thank you!</h1>
                <h2 className="text-2xl">You successfully sent</h2>

                <div className="bg-white p-2 rounded-md text-purple-500 mt-5 text-4xl font-bold">
                    ${amount}
                </div>
                
                {isProcessing && (
                    <div className="mt-6">
                        <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-white rounded-full" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                        <p className="mt-2">Processing your payment...</p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default PaymentSuccess;