"use client";

import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { useEffect, useState } from "react";
import convertToSubcurrency from "../lib/convertToSubcurrency";

const CheckoutPageStripe = ({ amount }: { amount: number }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [clientSecret, setClientSecret] = useState("");
    const [loading, setLoading] = useState(false);
    const [transactionId, setTransactionId] = useState("");

    useEffect(() => {
        fetch("/api/create-payment-intent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
        })
        .then((res) => res.json())
        .then((data) => { 
            setClientSecret(data.paymentIntent.client_secret);
            setTransactionId(data.paymentIntent.id);
        });
    }, [amount]);

    let url = `http://localhost:3000/payment-success?amount=${amount}&transactionId=${transactionId}`;
    console.log(url);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        if (!stripe || !elements) {
            return;
        }

        const { error: submitError } = await elements.submit();
        
        if (submitError) {
            setErrorMessage(submitError.message);
            setLoading(false);
            return;
        }

        const { error } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
                return_url: url,
            },
        });

        if (error) {
            setErrorMessage(error.message);
        }
                
        setLoading(false);
    };

    //16.24
    if (!clientSecret || !stripe || !elements) {
        return (
            <div className="flex items-center justify-center">
                <div 
                    className="inline-block h-8 w-8 animate-spin rouned-full border-4 border-solid
                    border-current border-e-transparent align-[-0.125em] text-surface
                    motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-while"
                    role="status"
                >
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden
                    !whitespace-nowrap !border-0 !p-0 ![clip:rect(0, 0, 0, 0)]">
                        Loading...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-2 rounded-md">
            {clientSecret && <PaymentElement />}

            {errorMessage && <div>{errorMessage}</div>}

            <button
                disabled={!stripe || loading}
                className="text-while w-full p-5 bg-black mt-2 rounded-md
                disabled:opacity-50 disabled:animate-pulse">
                {!loading ? `Pay $${amount}` : "Processing..."}
            </button>
        </form>
    );
}

export default CheckoutPageStripe;
