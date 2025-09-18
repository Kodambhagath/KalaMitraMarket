import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  ShoppingBag, 
  Mic, 
  Bot, 
  FileText,
  Image as ImageIcon,
  Video,
  Search,
  Package,
  TrendingUp
} from 'lucide-react';

export default function HowTo() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="text-howto-title">
            How KalaMitra Works
          </h1>
          <p className="text-xl text-muted-foreground">
            Simple steps to success for both artisans and customers
          </p>
        </div>

        {/* For Artisans */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Palette className="text-primary w-6 h-6 mr-3" />
              For Artisans & Shopkeepers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Create Account</h3>
                <p className="text-muted-foreground">
                  Sign up as an artisan and complete your profile with your craft specialty
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Add Products</h3>
                <p className="text-muted-foreground">
                  Upload photos and descriptions of your handcrafted items
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Generate AI Ads</h3>
                <p className="text-muted-foreground">
                  Use our AI tools to create professional marketing content
                </p>
              </div>
            </div>

            <div className="bg-primary/5 rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <Bot className="text-primary w-5 h-5 mr-2" />
                AI-Powered Voice Commands
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Product Marketing:
                  </h4>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>"Create ad for pot" → Generates video ad</li>
                    <li>"Make poster for Diwali sale on lamps" → Creates promotional graphics</li>
                    <li>"Show me marketing ideas for textiles" → AI suggestions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Product Management:
                  </h4>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>"Add new ceramic product" → Opens product form</li>
                    <li>"Update price for item 123" → Price adjustment</li>
                    <li>"Check sales this month" → Analytics view</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* For Customers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <ShoppingBag className="text-secondary w-6 h-6 mr-3" />
              For Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-secondary">1</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Browse & Search</h3>
                <p className="text-muted-foreground">
                  Explore unique handcrafted items or use voice search to find specific products
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-secondary">2</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Verify Authenticity</h3>
                <p className="text-muted-foreground">
                  Check QR codes and artisan profiles to ensure genuine craftsmanship
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-secondary">3</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Purchase & Review</h3>
                <p className="text-muted-foreground">
                  Secure checkout and leave reviews to support artisan communities
                </p>
              </div>
            </div>

            <div className="bg-secondary/5 rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <Mic className="text-secondary w-5 h-5 mr-2" />
                Voice Search Examples
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2 flex items-center">
                    <Search className="w-4 h-4 mr-2" />
                    Product Discovery:
                  </h4>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>"Show me ceramic pots under ₹2000"</li>
                    <li>"Find Diwali decorations from Rajasthan"</li>
                    <li>"I want handwoven textiles with geometric patterns"</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Navigation:
                  </h4>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>"Go to my cart"</li>
                    <li>"Show my order history"</li>
                    <li>"Find artisans near Mumbai"</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Bot className="text-accent w-6 h-6 mr-3" />
              AI-Powered Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-accent w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Smart Ad Scripts</h3>
                <p className="text-muted-foreground text-sm">
                  Generate compelling taglines and product descriptions using advanced AI
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="text-accent w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Marketing Images</h3>
                <p className="text-muted-foreground text-sm">
                  Create professional product photos and promotional graphics instantly
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Video className="text-accent w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Video Creation</h3>
                <p className="text-muted-foreground text-sm">
                  Generate engaging promotional videos with music and text overlays
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of artisans and customers already using KalaMitra
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button 
                className="bg-primary text-primary-foreground px-8 py-3 font-medium hover:bg-primary/90"
                data-testid="button-join-artisan"
              >
                <Palette className="w-4 h-4 mr-2" />
                Join as Artisan
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button 
                variant="outline"
                className="border-primary text-primary px-8 py-3 font-medium hover:bg-primary/10"
                data-testid="button-start-shopping"
              >
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
