import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductCard from '@/components/ProductCard';
import VoiceSearch from '@/components/VoiceSearch';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const categories = [
  'All Categories',
  'Ceramics & Pottery',
  'Textiles & Fabrics',
  'Metalwork & Brass',
  'Wood Crafts',
  'Jewelry & Accessories',
  'Home Decor',
  'Art & Paintings',
];

const sortOptions = [
  { value: '', label: 'Sort by' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }

    // Get search params from URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products', { 
      search: searchQuery, 
      category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
      sortBy 
    }],
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!currentUser) {
        throw new Error('Please login to add items to cart');
      }
      
      return apiRequest('POST', '/api/cart', {
        productId,
        quantity: 1,
        userId: currentUser.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to cart!",
        description: "Product has been added to your shopping cart.",
      });
      // Update cart count in navigation
      window.dispatchEvent(new CustomEvent('cart-updated'));
    },
    onError: (error: any) => {
      if (error.message.includes('login')) {
        toast({
          title: "Login required",
          description: "Please login to add items to your cart.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to add to cart",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleSearch = () => {
    // The search will be triggered by the query key change
  };

  const handleVoiceResult = (transcript: string) => {
    setSearchQuery(transcript);
  };

  const handleViewDetails = (productId: string) => {
    window.open(`/product/${productId}`, '_blank');
  };

  const handleAddToCart = (productId: string) => {
    addToCartMutation.mutate(productId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Marketplace Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-marketplace-title">
            Artisan Marketplace
          </h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                data-testid="input-marketplace-search"
                type="text"
                placeholder="Search for products, categories, or artisans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pr-24"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
                <VoiceSearch onResult={handleVoiceResult} />
                <Button
                  size="sm"
                  onClick={handleSearch}
                  data-testid="button-search-marketplace"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48" data-testid="select-category-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48" data-testid="select-sort-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-foreground">Loading products...</span>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground" data-testid="text-product-count">
                Showing {products.length} products
              </p>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={handleViewDetails}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-12">
              <Button
                data-testid="button-load-more"
                className="bg-primary text-primary-foreground px-8 py-3 font-medium hover:bg-primary/90"
              >
                Load More Products
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">No products found</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || selectedCategory !== 'All Categories'
                ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                : 'Be the first to discover amazing handcrafted products from talented artisans.'}
            </p>
            {(searchQuery || selectedCategory !== 'All Categories') && (
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All Categories');
                    setSortBy('');
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
