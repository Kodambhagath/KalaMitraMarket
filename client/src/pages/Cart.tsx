import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  CreditCard,
  Loader2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function Cart() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['/api/cart', currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    enabled: cartItems.length > 0,
  });

  const updateCartMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      return apiRequest('PUT', `/api/cart/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', currentUser?.id] });
      window.dispatchEvent(new CustomEvent('cart-updated'));
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update cart",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return apiRequest('DELETE', `/api/cart/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', currentUser?.id] });
      window.dispatchEvent(new CustomEvent('cart-updated'));
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove item",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Please log in to view your cart</h2>
          <Link href="/auth">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading cart...</span>
      </div>
    );
  }

  // Get product details for cart items
  const cartWithProducts = cartItems.map((cartItem: any) => {
    const product = products.find((p: any) => p.id === cartItem.productId);
    return { ...cartItem, product };
  }).filter((item: any) => item.product); // Filter out items where product is not found

  const subtotal = cartWithProducts.reduce((sum: number, item: any) => {
    return sum + (parseFloat(item.product.price) * item.quantity);
  }, 0);

  const shipping = subtotal > 1000 ? 0 : 150; // Free shipping over ₹1000
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartMutation.mutate({ itemId, quantity: newQuantity });
  };

  const removeItem = (itemId: string) => {
    removeFromCartMutation.mutate(itemId);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-cart-title">
            Shopping Cart
          </h1>
          <Link href="/marketplace">
            <Button variant="outline" data-testid="button-continue-shopping">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
        
        {cartWithProducts.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Discover amazing handcrafted products from talented artisans.
            </p>
            <Link href="/marketplace">
              <Button className="bg-primary text-primary-foreground">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartWithProducts.map((item: any) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.product.images[0] || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=150&fit=crop"}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        data-testid={`img-cart-item-${item.id}`}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2" data-testid={`text-cart-item-name-${item.id}`}>
                          {item.product.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-2">
                          by {item.product.seller?.firstName || 'Artisan'}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-input rounded-md">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updateCartMutation.isPending}
                              data-testid={`button-decrease-${item.id}`}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="px-4 py-1 border-x border-input" data-testid={`text-quantity-${item.id}`}>
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updateCartMutation.isPending}
                              data-testid={`button-increase-${item.id}`}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-primary font-bold" data-testid={`text-item-total-${item.id}`}>
                              ₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              ₹{item.product.price} each
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={removeFromCartMutation.isPending}
                        className="text-red-500 hover:text-red-700"
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({cartWithProducts.length} items)</span>
                      <span className="text-foreground" data-testid="text-subtotal">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground" data-testid="text-shipping">
                        {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="text-foreground" data-testid="text-tax">₹{tax.toFixed(2)}</span>
                    </div>
                    <hr className="border-border" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary" data-testid="text-total">₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {shipping > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-blue-800 text-sm">
                        Add ₹{(1000 - subtotal).toFixed(2)} more for free shipping!
                      </p>
                    </div>
                  )}

                  <Link href="/checkout">
                    <Button className="w-full mb-4" data-testid="button-checkout">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Proceed to Checkout
                    </Button>
                  </Link>
                  
                  <div className="text-center">
                    <Link href="/marketplace">
                      <Button variant="outline" className="text-primary hover:underline">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>

                  {/* Payment Options */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3">We accept:</p>
                    <div className="flex space-x-2">
                      <Badge variant="outline" className="bg-blue-600 text-white">VISA</Badge>
                      <Badge variant="outline" className="bg-red-600 text-white">MC</Badge>
                      <Badge variant="outline" className="bg-green-600 text-white">UPI</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Powered by Stripe • Secure payments
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
