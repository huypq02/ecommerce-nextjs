import Link from 'next/link';

const CheckoutSuccess = () => {
  return (
    <div className="container py-16 lg:pb-28 lg:pt-20">
      <h2 className="text-3xl font-semibold text-center">Order Successful!</h2>
      <p className="text-center mt-4">Thank you for your purchase.</p>
      <div className="text-center mt-8">
        <Link href="/collection" className="text-primary-600 hover:underline">
          Go back to homepage
        </Link>
      </div>
    </div>
  );
};

export default CheckoutSuccess;