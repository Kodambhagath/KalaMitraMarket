import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

export const createPaymentIntent = async (amount: number) => {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Payment failed');
  }

  return data;
};
