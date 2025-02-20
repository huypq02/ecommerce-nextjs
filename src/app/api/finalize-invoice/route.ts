import { NextRequest, NextResponse } from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request: Request) {
    try {
        const { invoice } = await request.json(); console.log("test");
        const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

        return NextResponse.json({ finalizedInvoice: finalizedInvoice });
    } catch (error) {
        console.error("Internal Error:", error);

        return NextResponse.json(
            { error: `Internal Server Error: ${error}` },
            { status: 500 }
        );
    }
}
