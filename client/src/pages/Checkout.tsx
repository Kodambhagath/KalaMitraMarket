import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { stripePromise } from '@/lib/stripe';
import { apiRequest } from '@/lib/queryClient';

interface CheckoutFormProps {
  total: number;
  onSuccess: () => void;
}

function CheckoutForm({ total, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
        data-testid="button-complete-payment"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Complete Payment ₹{total.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [shippingInfo, setShippingInfo] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  const { toast } = useToast();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const { data: cartItems = [] } = useQuery({
    queryKey: ['/api/cart', currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    enabled: cartItems.length > 0,
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest('POST', '/api/create-payment-intent', { amount });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: any) => {
      toast({
        title: "Payment setup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Calculate totals
  const cartWithProducts = cartItems.map((cartItem: any) => {
    const product = products.find((p: any) => p.id === cartItem.productId);
    return { ...cartItem, product };
  }).filter((item: any) => item.product);

  const subtotal = cartWithProducts.reduce((sum: number, item: any) => {
    return sum + (parseFloat(item.product.price) * item.quantity);
  }, 0);

  const shipping = subtotal > 1000 ? 0 : 150;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (total > 0 && !clientSecret) {
      createPaymentIntentMutation.mutate(total);
    }
  }, [total]);

  const handlePaymentSuccess = () => {
    // Create order and clear cart
    setLocation('/marketplace');
    toast({
      title: "Order placed successfully!",
      description: "You will receive a confirmation email shortly.",
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Please log in to checkout</h2>
          <Button onClick={() => setLocation('/auth')}>Login</Button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h2>
          <Button onClick={() => setLocation('/marketplace')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Payment Unavailable</h2>
            <p className="text-muted-foreground mb-4">
              Stripe is not configured. In a real application, this would process payments securely.
            </p>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium text-foreground">Mock Checkout Summary:</p>
                <p className="text-sm text-muted-foreground">Total: ₹{total.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Items: {cartItems.length}</p>
              </div>
              <Button 
                onClick={handlePaymentSuccess}
                className="w-full"
                data-testid="button-mock-payment"
              >
                Complete Mock Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
          <Button 
            variant="outline" 
            onClick={() => setLocation('/cart')}
            data-testid="button-back-cart"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Shipping Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={shippingInfo.street}
                    onChange={(e) => setShippingInfo(prev => ({...prev, street: e.target.value}))}
                    placeholder="123 Main Street"
                    data-testid="input-street-address"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo(prev => ({...prev, city: e.target.value}))}
                      placeholder="Mumbai"
                      data-testid="input-city"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo(prev => ({...prev, state: e.target.value}))}
                      placeholder="Maharashtra"
                      data-testid="input-state"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={(e) => setShippingInfo(prev => ({...prev, zipCode: e.target.value}))}
                      placeholder="400001"
                      data-testid="input-zip-code"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo(prev => ({...prev, country: e.target.value}))}
                      data-testid="input-country"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            {clientSecret && stripePromise && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Elements 
                    stripe={stripePromise} 
                    options={{ clientSecret }}
                    key={clientSecret}
                  >
                    <CheckoutForm total={total} onSuccess={handlePaymentSuccess} />
                  </Elements>
                </CardContent>
              </Card>
            )}

            {!clientSecret && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                  <p>Setting up secure payment...</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartWithProducts.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{item.product.name}</p>
                        <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-foreground">
                        ₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span data-testid="text-checkout-subtotal">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span data-testid="text-checkout-shipping">
                        {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span data-testid="text-checkout-tax">₹{tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-primary" data-testid="text-checkout-total">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
