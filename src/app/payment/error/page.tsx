import Link from 'next/link';


const PaymentError = () => {
  return (
    <div className="container py-16 lg:pb-28 lg:pt-20">
      <h2 className="text-3xl font-semibold text-center">Payment Failed</h2>
      <p className="text-center mt-4">There was an issue with your payment. Please try again.</p>
      <div className="text-center mt-8">
        <Link href="/checkout" className="text-primary-600 hover:underline">
          Go back to checkout
        </Link>
      </div>
    </div>
  );
};

export default PaymentError;