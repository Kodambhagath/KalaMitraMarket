import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Minus, 
  Plus, 
  Shield, 
  QrCode,
  User,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function ProductDetail() {
  const [match, params] = useRoute('/product/:id');
  const productId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const { data: product, isLoading } = useQuery({
    queryKey: ['/api/products', productId],
    enabled: !!productId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['/api/products', productId, 'reviews'],
    enabled: !!productId,
  });

  const { data: seller } = useQuery({
    queryKey: ['/api/users', product?.sellerId],
    enabled: !!product?.sellerId,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        throw new Error('Please login to add items to cart');
      }
      
      return apiRequest('POST', '/api/cart', {
        productId,
        quantity,
        userId: currentUser.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to cart!",
        description: `${quantity} item(s) added to your cart.`,
      });
      window.dispatchEvent(new CustomEvent('cart-updated'));
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add to cart",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const addReviewMutation = useMutation({
    mutationFn: async (reviewData: typeof newReview) => {
      if (!currentUser) {
        throw new Error('Please login to leave a review');
      }
      
      return apiRequest('POST', `/api/products/${productId}/reviews`, {
        ...reviewData,
        userId: currentUser.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Review added!",
        description: "Thank you for your feedback.",
      });
      setNewReview({ rating: 5, comment: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add review",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!match || !productId) {
    return <div>Product not found</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading product...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Product not found</h2>
          <Button onClick={() => window.close()}>Close Tab</Button>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRate?.(star)}
          />
        ))}
      </div>
    );
  };

  const handleAddToCart = () => {
    addToCartMutation.mutate();
  };

  const handleSubmitReview = () => {
    if (!newReview.comment.trim()) {
      toast({
        title: "Missing comment",
        description: "Please write a review comment.",
        variant: "destructive",
      });
      return;
    }
    
    addReviewMutation.mutate(newReview);
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
    : parseFloat(product.rating);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          variant="outline"
          onClick={() => window.close()}
          className="mb-6"
          data-testid="button-close-tab"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Close Tab
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div>
            <div className="mb-4">
              <img
                src={product.images[selectedImage] || product.images[0] || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop"}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
                data-testid="img-product-main"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image: string, index: number) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  className={`w-full h-20 object-cover rounded-md cursor-pointer border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedImage(index)}
                  data-testid={`img-product-thumb-${index}`}
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <Card className="h-fit">
            <CardContent className="p-8">
              <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-product-title">
                {product.name}
              </h1>
              
              <div className="flex items-center mb-4">
                {renderStars(averageRating)}
                <span className="ml-2 text-muted-foreground" data-testid="text-product-rating">
                  ({averageRating.toFixed(1)}) • {reviews.length} reviews
                </span>
              </div>

              {/* Authenticity Badge */}
              {product.authenticityCode && (
                <div className="flex items-center bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <Shield className="text-green-600 w-5 h-5 mr-2" />
                  <div className="flex-1">
                    <p className="text-green-800 font-medium">Authenticity Verified</p>
                    <p className="text-green-600 text-sm">QR Code: {product.authenticityCode}</p>
                  </div>
                  <QrCode className="w-8 h-8 text-green-600" />
                </div>
              )}

              <p className="text-3xl font-bold text-primary mb-6" data-testid="text-product-price">
                ₹{product.price}
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="text-foreground ml-2">{product.category}</span>
                </div>
                {product.dimensions && (
                  <div>
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span className="text-foreground ml-2">{product.dimensions}</span>
                  </div>
                )}
                {product.material && (
                  <div>
                    <span className="text-muted-foreground">Material:</span>
                    <span className="text-foreground ml-2">{product.material}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Stock:</span>
                  <span className={`ml-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} pieces available` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Quantity and Actions */}
              {product.stock > 0 && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center border border-input rounded-md">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        data-testid="button-decrease-quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="px-4 py-2 border-x border-input" data-testid="text-quantity">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                        data-testid="button-increase-quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      className="flex-1"
                      onClick={handleAddToCart}
                      disabled={addToCartMutation.isPending}
                      data-testid="button-add-to-cart"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                    </Button>
                    <Button variant="outline" size="icon" data-testid="button-wishlist">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}

              {/* Seller Info */}
              {seller && (
                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold text-foreground mb-3">Seller Information</h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      {seller.profileImage ? (
                        <img
                          src={seller.profileImage}
                          alt={seller.username}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {seller.firstName} {seller.lastName}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {seller.specialty} • {seller.location}
                      </p>
                      {seller.experience && (
                        <p className="text-muted-foreground text-sm">{seller.experience}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product Details Tabs */}
        <Card>
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="crafting">Crafting Process</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Product Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
              {product.tags && product.tags.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-foreground mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reviews" className="p-6">
              <div className="space-y-6">
                {/* Add Review Form */}
                {currentUser && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Write a Review</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Rating
                        </label>
                        {renderStars(newReview.rating, true, (rating) => 
                          setNewReview(prev => ({ ...prev, rating }))
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Your Review
                        </label>
                        <Textarea
                          placeholder="Share your experience with this product..."
                          value={newReview.comment}
                          onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                          data-testid="textarea-review-comment"
                        />
                      </div>
                      <Button
                        onClick={handleSubmitReview}
                        disabled={addReviewMutation.isPending}
                        data-testid="button-submit-review"
                      >
                        {addReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium text-foreground">Anonymous User</p>
                                {renderStars(review.rating)}
                              </div>
                              <span className="text-muted-foreground text-sm">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-muted-foreground">{review.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {reviews.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="crafting" className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Crafting Process</h3>
              <p className="text-muted-foreground">
                This product is handcrafted using traditional techniques passed down through generations. 
                Each piece is unique and may have slight variations that add to its authentic charm.
              </p>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
