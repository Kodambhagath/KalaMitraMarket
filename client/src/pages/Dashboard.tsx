import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';
import { Plus, Bot, Eye, Users, Package, TrendingUp, Lightbulb } from 'lucide-react';
import { generateImprovementTips } from '@/lib/gemini';

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products/seller', currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics', currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const { data: improvementTips = [] } = useQuery({
    queryKey: ['improvement-tips', currentUser?.id],
    queryFn: async () => {
      if (products.length > 0) {
        return await generateImprovementTips(products[0]);
      }
      return [];
    },
    enabled: products.length > 0,
  });

  const handleAddToCart = () => {
    // Not applicable for dashboard
  };

  const handleViewDetails = (productId: string) => {
    window.open(`/product/${productId}`, '_blank');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Please log in to access your dashboard</h2>
          <Link href="/auth">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'shopkeeper') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">This dashboard is only available for artisans and shopkeepers.</p>
          <Link href="/marketplace">
            <Button>Browse Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-dashboard-title">
                Artisan Dashboard
              </h1>
              <p className="text-muted-foreground" data-testid="text-welcome-message">
                Welcome back, {currentUser.firstName || currentUser.username}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/add-product">
                <Button data-testid="button-add-product" className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
              <Link href="/ai-ad-generator">
                <Button data-testid="button-ai-generator" className="bg-secondary text-secondary-foreground">
                  <Bot className="w-4 h-4 mr-2" />
                  AI Ad Generator
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Products</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-products">
                    {analytics?.totalProducts || products.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Package className="text-primary w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Product Views</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-views">
                    {analytics?.totalViews || products.reduce((sum, p) => sum + (p.views || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Eye className="text-secondary w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Average Rating</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-average-rating">
                    {analytics?.averageRating || '4.5'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-accent w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Reviews</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-reviews">
                    {products.reduce((sum, p) => sum + (p.reviewCount || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="text-green-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Tips Section */}
        {improvementTips.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Lightbulb className="text-accent w-5 h-5 mr-2" />
                AI-Powered Improvement Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {improvementTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-foreground text-sm" data-testid={`text-tip-${index}`}>
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Your Products</CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted h-48 rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="bg-muted h-4 rounded w-3/4"></div>
                      <div className="bg-muted h-4 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="relative">
                    <ProductCard
                      product={product}
                      onViewDetails={handleViewDetails}
                      onAddToCart={handleAddToCart}
                      showAddToCart={false}
                    />
                    {product.name === "Sample Product" && (
                      <Badge className="absolute top-2 left-2 bg-blue-500 text-white">
                        Sample
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by adding your first handcrafted product to the marketplace.
                </p>
                <Link href="/add-product">
                  <Button data-testid="button-add-first-product">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Product
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
