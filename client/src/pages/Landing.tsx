import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VoiceSearch from "@/components/VoiceSearch";
import { Search, Bot, Handshake, Shield, Palette } from "lucide-react";

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleVoiceResult = (transcript: string) => {
    setSearchQuery(transcript);
    console.log("Voice search:", transcript);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(
        searchQuery
      )}`;
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Empowering Artisans <br />
            <span className="text-blue-600">Worldwide</span>
          </h1>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-600">
            Connect directly with skilled artisans, discover unique handcrafted
            products, and support traditional craftsmanship with AI-powered
            tools.
          </p>

          {/* Global Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for handcrafted products, artisans, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-6 py-4 pr-24 rounded-full text-lg border shadow-md focus:ring-2 focus:ring-blue-400"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-2">
                <VoiceSearch onResult={handleVoiceResult} />
                <Button
                  onClick={handleSearch}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
            <p className="text-sm mt-2 text-gray-500">
              🎤 Try voice search: "Show me ceramic pots" or "Find Diwali
              decorations"
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800">
                Start Selling
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button className="border-2 border-black text-black px-8 py-3 rounded-full font-semibold hover:bg-black hover:text-white">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose KalaMitra?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 shadow-md rounded-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="text-blue-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                AI-Powered Marketing
              </h3>
              <p className="text-gray-600">
                Generate professional ads, videos, and marketing content for
                your products using advanced AI technology.
              </p>
            </div>
            <div className="text-center p-6 shadow-md rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="text-green-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Direct Connection</h3>
              <p className="text-gray-600">
                Connect directly with artisans, learn their stories, and build
                meaningful relationships through authentic craftsmanship.
              </p>
            </div>
            <div className="text-center p-6 shadow-md rounded-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-purple-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Authenticity Guaranteed
              </h3>
              <p className="text-gray-600">
                Every product comes with QR-verified authenticity badges and
                detailed artisan profiles for complete transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of artisans and customers already using KalaMitra to
            discover, create, and share beautiful handcrafted products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700">
                <Palette className="w-4 h-4 mr-2" />
                Join as Artisan
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-md font-medium hover:bg-blue-50">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
