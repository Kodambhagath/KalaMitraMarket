import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Store, 
  LayoutDashboard, 
  HelpCircle, 
  ShoppingCart, 
  User, 
  Menu,
  Palette
} from 'lucide-react';

interface NavigationProps {
  cartItemCount?: number;
  currentUser?: any;
}

export default function Navigation({ cartItemCount = 0, currentUser }: NavigationProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/marketplace', label: 'Marketplace', icon: Store },
    ...(currentUser?.role === 'shopkeeper' ? [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ] : []),
    { href: '/how-to', label: 'How-To', icon: HelpCircle },
  ];

  const NavLink = ({ href, children, mobile = false }: any) => (
    <Link href={href}>
      <a 
        className={`${
          location === href 
            ? 'text-primary' 
            : 'text-foreground hover:text-primary'
        } transition-colors ${mobile ? 'block py-2' : ''}`}
        onClick={() => mobile && setIsOpen(false)}
      >
        {children}
      </a>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-3" data-testid="link-logo">
              <div className="w-10 h-10 hero-gradient rounded-lg flex items-center justify-center">
                <Palette className="text-white w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">KalaMitra</h1>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map(({ href, label }) => (
              <NavLink key={href} href={href}>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Cart */}
            <Link href="/cart">
              <a className="relative text-foreground hover:text-primary transition-colors" data-testid="link-cart">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center p-0"
                    data-testid={`text-cart-count-${cartItemCount}`}
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </a>
            </Link>

            {/* User Menu */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <Link href="/profile">
                  <a className="text-foreground hover:text-primary transition-colors" data-testid="link-profile">
                    <User className="w-5 h-5" />
                  </a>
                </Link>
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  {currentUser.firstName || currentUser.username}
                </span>
              </div>
            ) : (
              <Link href="/auth">
                <a className="text-foreground hover:text-primary transition-colors" data-testid="link-auth">
                  <User className="w-5 h-5" />
                </a>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map(({ href, label, icon: Icon }) => (
                    <NavLink key={href} href={href} mobile>
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span>{label}</span>
                      </div>
                    </NavLink>
                  ))}
                  
                  <div className="border-t border-border pt-4">
                    {!currentUser && (
                      <NavLink href="/auth" mobile>
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5" />
                          <span>Sign In</span>
                        </div>
                      </NavLink>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
