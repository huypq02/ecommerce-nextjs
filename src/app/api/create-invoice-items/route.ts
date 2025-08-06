import { NextRequest, NextResponse } from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request: Request) {
    try {
        const { invoiceData } = await request.json();        
        
        const invoiceItems = await stripe.invoiceItems.create({
            customer: invoiceData.customerId,
            amount: invoiceData.amount,
            currency: invoiceData.currency,
            description: invoiceData.description,
        });

        return NextResponse.json({ invoiceItems: invoiceItems });

    } catch (error) {
        console.error("Internal Error:", error);

        return NextResponse.json(
            { error: `Internal Server Error: ${error}` },
            { status: 500 }
        );
    }
}
