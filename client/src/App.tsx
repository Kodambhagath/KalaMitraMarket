import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import AddProduct from "@/pages/AddProduct";
import AIAdGenerator from "@/pages/AIAdGenerator";
import Marketplace from "@/pages/Marketplace";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import HowTo from "@/pages/HowTo";
import Checkout from "@/pages/Checkout";
import NotFound from "@/pages/not-found";

function Router() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    // Load user from localStorage on app start
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }

    // Listen for user changes
    const handleUserChange = () => {
      const user = localStorage.getItem('currentUser');
      if (user) {
        setCurrentUser(JSON.parse(user));
      } else {
        setCurrentUser(null);
      }
    };

    window.addEventListener('user-changed', handleUserChange);
    return () => window.removeEventListener('user-changed', handleUserChange);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentUser={currentUser} cartItemCount={cartItemCount} />
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={Auth} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/add-product" component={AddProduct} />
        <Route path="/ai-ad-generator" component={AIAdGenerator} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/how-to" component={HowTo} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
