import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VoiceSearch from '@/components/VoiceSearch';
import { 
  Search, 
  Bot, 
  Handshake, 
  Shield, 
  Palette
} from 'lucide-react';

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleVoiceResult = (transcript: string) => {
    setSearchQuery(transcript);
    // Here you could trigger a search or redirect to marketplace
    console.log('Voice search:', transcript);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Redirect to marketplace with search query
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
            Empowering Artisans<br />
            <span className="text-accent">Worldwide</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90" data-testid="text-hero-description">
            Connect directly with skilled artisans, discover unique handcrafted products, 
            and support traditional craftsmanship with AI-powered tools.
          </p>
          
          {/* Global Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Input
                data-testid="input-global-search"
                type="text"
                placeholder="Search for handcrafted products, artisans, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-6 py-4 pr-20 rounded-full text-gray-800 text-lg border-0 focus:ring-4 focus:ring-white/30 shadow-lg"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
                <VoiceSearch 
                  onResult={handleVoiceResult}
                  placeholder="Try voice search: 'Show me ceramic pots' or 'Find Diwali decorations'"
                />
                <Button
                  data-testid="button-search"
                  onClick={handleSearch}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/90"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
            <p className="text-sm mt-2 opacity-80">
              <span className="inline-flex items-center">
                🎤 Try voice search: "Show me ceramic pots" or "Find Diwali decorations"
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button 
                data-testid="button-start-selling"
                className="bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-100"
              >
                Start Selling
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button 
                data-testid="button-browse-products"
                variant="outline"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-primary"
              >
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12" data-testid="text-features-title">
            Why Choose KalaMitra?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">AI-Powered Marketing</h3>
              <p className="text-muted-foreground">
                Generate professional ads, videos, and marketing content for your products using advanced AI technology.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="text-secondary w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Direct Connection</h3>
              <p className="text-muted-foreground">
                Connect directly with artisans, learn their stories, and build meaningful relationships through authentic craftsmanship.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-accent w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Authenticity Guaranteed</h3>
              <p className="text-muted-foreground">
                Every product comes with QR-verified authenticity badges and detailed artisan profiles for complete transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of artisans and customers already using KalaMitra to discover, create, and share beautiful handcrafted products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button 
                data-testid="button-join-artisan"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:bg-primary/90"
              >
                <Palette className="w-4 h-4 mr-2" />
                Join as Artisan
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button 
                data-testid="button-start-shopping"
                variant="outline"
                className="border-primary text-primary px-8 py-3 rounded-md font-medium hover:bg-primary/10"
              >
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
