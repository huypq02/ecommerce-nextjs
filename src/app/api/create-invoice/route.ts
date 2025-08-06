import { NextRequest, NextResponse } from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request: Request) {
    try {
        const { invoiceData } = await request.json();
        const invoice = await stripe.invoices.create({
            customer: invoiceData.customerId
        });

        return NextResponse.json({ invoice: invoice });
    } catch (error) {
        console.error("Internal Error:", error);

        return NextResponse.json(
            { error: `Internal Server Error: ${error}` },
            { status: 500 }
        );
    }
}
