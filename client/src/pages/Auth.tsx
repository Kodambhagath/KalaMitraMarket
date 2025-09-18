import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Palette, User, Store } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function Auth() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'customer',
    username: '',
    location: '',
    experience: '',
    specialty: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/auth/login', loginData);
      const data = await response.json();
      
      // Store user data (in a real app, you'd use proper auth context)
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
      
      // Redirect based on role
      if (data.user.role === 'shopkeeper') {
        setLocation('/dashboard');
      } else {
        setLocation('/marketplace');
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const userData = {
        ...signupData,
        username: signupData.username || `${signupData.firstName}_${signupData.lastName}`.toLowerCase(),
      };
      
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const data = await response.json();
      
      // Store user data
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      toast({
        title: "Account created!",
        description: `Welcome to KalaMitra, ${data.user.firstName}!`,
      });
      
      // Redirect based on role
      if (data.user.role === 'shopkeeper') {
        setLocation('/dashboard');
      } else {
        setLocation('/marketplace');
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 hero-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="text-white w-8 h-8" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">Welcome to KalaMitra</CardTitle>
            <p className="text-muted-foreground mt-2">Join our community of artisans and art lovers</p>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email Address</Label>
                    <Input
                      id="login-email"
                      data-testid="input-login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({...prev, email: e.target.value}))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      data-testid="input-login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({...prev, password: e.target.value}))}
                      required
                    />
                  </div>
                  
                  <Button 
                    data-testid="button-login"
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Signup Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        data-testid="input-first-name"
                        value={signupData.firstName}
                        onChange={(e) => setSignupData(prev => ({...prev, firstName: e.target.value}))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        data-testid="input-last-name"
                        value={signupData.lastName}
                        onChange={(e) => setSignupData(prev => ({...prev, lastName: e.target.value}))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input
                      id="signup-email"
                      data-testid="input-signup-email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({...prev, email: e.target.value}))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      data-testid="input-signup-password"
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({...prev, password: e.target.value}))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>I want to join as:</Label>
                    <RadioGroup
                      value={signupData.role}
                      onValueChange={(value) => setSignupData(prev => ({...prev, role: value}))}
                      className="grid grid-cols-2 gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2 border border-input rounded-lg p-4 hover:border-ring">
                        <RadioGroupItem value="shopkeeper" id="shopkeeper" data-testid="radio-shopkeeper" />
                        <Label htmlFor="shopkeeper" className="flex items-center space-x-2 cursor-pointer">
                          <Store className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Artisan/Shopkeeper</div>
                            <div className="text-sm text-muted-foreground">Sell your crafts</div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border border-input rounded-lg p-4 hover:border-ring">
                        <RadioGroupItem value="customer" id="customer" data-testid="radio-customer" />
                        <Label htmlFor="customer" className="flex items-center space-x-2 cursor-pointer">
                          <User className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Customer</div>
                            <div className="text-sm text-muted-foreground">Buy unique crafts</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {signupData.role === 'shopkeeper' && (
                    <>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          data-testid="input-location"
                          placeholder="e.g., Rajasthan, India"
                          value={signupData.location}
                          onChange={(e) => setSignupData(prev => ({...prev, location: e.target.value}))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="specialty">Craft Specialty</Label>
                        <Input
                          id="specialty"
                          data-testid="input-specialty"
                          placeholder="e.g., Traditional Ceramics"
                          value={signupData.specialty}
                          onChange={(e) => setSignupData(prev => ({...prev, specialty: e.target.value}))}
                        />
                      </div>
                    </>
                  )}
                  
                  <Button 
                    data-testid="button-signup"
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            {/* Social Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  data-testid="button-google-signin"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  data-testid="button-facebook-signin"
                >
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
