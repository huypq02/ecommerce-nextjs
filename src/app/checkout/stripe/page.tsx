'use client'

import CheckoutPage from "../page";
// import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import convertToSubcurrency from "../../../../lib/convertToSubcurrency";
import CheckoutPageStripe from "../../../../components/CheckoutPageStripe";
import { useSearchParam } from "react-use";
import { useSearchParams } from "next/navigation";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Home() {
    const searchParams = useSearchParams();
    const amount = searchParams.get("amount");

    return <main className="max-w-6xl mx-auto p-10 text-white text-center border m-10 rounded-md bg-gradient-to-tr from-blue-500 to-purple-500">
        <div className="mb-10">
            <h1 className="text-4xl font-extrabold mb-2">Fashion Order</h1>
            <h2 className="text-2xl">
                has requested
                <span className="font-bold"> ${amount}</span>
            </h2>
        </div>

        <Elements 
            stripe={stripePromise}
            options={{
                mode: "payment",
                amount: convertToSubcurrency(amount),   //cent
                currency: "usd",
            }}
        >
            <CheckoutPageStripe amount={amount}/>
        </Elements>
    </main>
    return <main className=""></main>
}
