import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CloudUpload, Plus, Bot, ArrowLeft } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const categories = [
  'Ceramics & Pottery',
  'Textiles & Fabrics',
  'Metalwork & Brass',
  'Wood Crafts',
  'Jewelry & Accessories',
  'Home Decor',
  'Art & Paintings',
  'Leather Goods',
  'Stone Crafts',
  'Bamboo & Cane',
];

export default function AddProduct() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentUser] = useState(() => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    dimensions: '',
    weight: '',
    material: '',
    stock: '',
    tags: '',
    images: [] as string[],
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(productData).forEach(key => {
        if (key === 'images' || key === 'tags') {
          formDataToSend.append(key, JSON.stringify(productData[key]));
        } else {
          formDataToSend.append(key, productData[key]);
        }
      });

      // Append image files
      imageFiles.forEach((file, index) => {
        formDataToSend.append('images', file);
      });

      formDataToSend.append('sellerId', currentUser.id);

      return apiRequest('POST', '/api/products', formDataToSend);
    },
    onSuccess: () => {
      toast({
        title: "Product added successfully!",
        description: "Your product is now live on the marketplace.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products/seller', currentUser.id] });
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add product",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) {
      toast({
        title: "Too many images",
        description: "Maximum 5 images allowed.",
        variant: "destructive",
      });
      return;
    }

    setImageFiles(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || currentUser.role !== 'shopkeeper') {
      toast({
        title: "Access denied",
        description: "Only artisans can add products.",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price).toString(),
      weight: formData.weight ? parseFloat(formData.weight).toString() : '',
      stock: parseInt(formData.stock),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      images: imagePreviews, // Use preview URLs for now
    };

    addProductMutation.mutate(productData);
  };

  const handleAddWithAI = () => {
    // Add product and then redirect to AI generator
    handleSubmit;
    setLocation('/ai-ad-generator');
  };

  if (!currentUser || currentUser.role !== 'shopkeeper') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">Only artisans can add products.</p>
          <Button onClick={() => setLocation('/auth')}>Login as Artisan</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold text-foreground">Add New Product</CardTitle>
              <Button
                variant="outline"
                onClick={() => setLocation('/dashboard')}
                data-testid="button-back-dashboard"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Product Images (Max 5)
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <CloudUpload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">Drag and drop images here</p>
                  <p className="text-muted-foreground text-sm mb-4">or click to browse</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    data-testid="input-image-upload"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="bg-primary text-primary-foreground"
                    data-testid="button-choose-files"
                  >
                    Choose Files
                  </Button>
                </div>
                
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    data-testid="input-product-name"
                    placeholder="e.g., Traditional Ceramic Pot"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    data-testid="input-price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1250"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    data-testid="input-stock"
                    type="number"
                    min="0"
                    placeholder="10"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({...prev, stock: e.target.value}))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  data-testid="textarea-description"
                  rows={5}
                  placeholder="Describe your product, its materials, crafting process, and unique features..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  required
                />
              </div>

              {/* Additional Details */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    data-testid="input-dimensions"
                    placeholder="L x W x H (cm)"
                    value={formData.dimensions}
                    onChange={(e) => setFormData(prev => ({...prev, dimensions: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    data-testid="input-weight"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.5"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({...prev, weight: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    data-testid="input-material"
                    placeholder="e.g., Clay, Cotton, Brass"
                    value={formData.material}
                    onChange={(e) => setFormData(prev => ({...prev, material: e.target.value}))}
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  data-testid="input-tags"
                  placeholder="handmade, traditional, eco-friendly, diwali (comma separated)"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({...prev, tags: e.target.value}))}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary text-primary-foreground"
                  disabled={addProductMutation.isPending}
                  data-testid="button-add-product"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {addProductMutation.isPending ? 'Adding...' : 'Add Product'}
                </Button>
                <Button 
                  type="button"
                  onClick={handleAddWithAI}
                  className="flex-1 bg-secondary text-secondary-foreground"
                  disabled={addProductMutation.isPending}
                  data-testid="button-add-with-ai"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Add & Generate AI Ad
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/dashboard')}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
