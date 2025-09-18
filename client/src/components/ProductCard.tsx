import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ShoppingCart, ExternalLink } from 'lucide-react';
import { Product } from '@shared/schema';

interface ProductCardProps {
  product: Product;
  onViewDetails: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  showAddToCart?: boolean;
}

export default function ProductCard({ 
  product, 
  onViewDetails, 
  onAddToCart, 
  showAddToCart = true 
}: ProductCardProps) {
  const handleViewDetails = () => {
    // Open in new tab for product details
    const url = `/product/${product.id}`;
    window.open(url, '_blank');
  };

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;
    
    return (
      <div className="flex items-center text-yellow-500 text-sm">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-current" />
        ))}
        {hasHalfStar && <Star className="w-4 h-4 fill-current opacity-50" />}
        {[...Array(5 - Math.ceil(numRating))].map((_, i) => (
          <Star key={i + fullStars} className="w-4 h-4 stroke-current fill-transparent" />
        ))}
      </div>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <div className="relative">
        <img 
          src={product.images[0] || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"} 
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop";
          }}
        />
        {product.authenticityCode && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
            Verified
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-1" data-testid={`text-product-name-${product.id}`}>
          {product.name}
        </h3>
        
        <p className="text-primary font-bold text-lg mb-2" data-testid={`text-price-${product.id}`}>
          ₹{product.price}
        </p>
        
        <div className="flex items-center mb-2">
          {renderStars(product.rating)}
          <span className="ml-2 text-muted-foreground text-sm" data-testid={`text-rating-${product.id}`}>
            ({product.rating}) • {product.reviewCount} reviews
          </span>
        </div>
        
        <p className="text-muted-foreground text-sm mb-3">
          {product.category}
        </p>
        
        <div className="flex gap-2">
          <Button
            data-testid={`button-view-details-${product.id}`}
            onClick={handleViewDetails}
            className="flex-1"
            size="sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Details
          </Button>
          
          {showAddToCart && (
            <Button
              data-testid={`button-add-cart-${product.id}`}
              onClick={() => onAddToCart(product.id)}
              variant="secondary"
              size="sm"
              className="px-3"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
