import { NextRequest, NextResponse } from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request: Request) {
    try {
        const { finalizedInvoice } = await request.json();
        const paidInvoice = await stripe.invoices.pay(finalizedInvoice.id);

        return NextResponse.json({ paidInvoice: paidInvoice });
    } catch (error) {
        console.error("Internal Error:", error);

        return NextResponse.json(
            { error: `Internal Server Error: ${error}` },
            { status: 500 }
        );
    }
}
