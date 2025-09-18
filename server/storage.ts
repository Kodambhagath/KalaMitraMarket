import { type User, type InsertUser, type Product, type InsertProduct, type Review, type InsertReview, type CartItem, type InsertCartItem, type Order, type InsertOrder, type AdContent } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateStripeCustomerId(userId: string, customerId: string): Promise<User>;
  updateUserStripeInfo(userId: string, info: { customerId: string, subscriptionId: string }): Promise<User>;

  // Product operations
  getProduct(id: string): Promise<Product | undefined>;
  getProductsBySeller(sellerId: string): Promise<Product[]>;
  getAllProducts(filters?: { category?: string, search?: string, sortBy?: string }): Promise<Product[]>;
  createProduct(product: InsertProduct & { sellerId: string }): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  incrementProductViews(id: string): Promise<void>;

  // Review operations
  getProductReviews(productId: string): Promise<Review[]>;
  createReview(review: InsertReview & { userId: string }): Promise<Review>;
  updateProductRating(productId: string): Promise<void>;

  // Cart operations
  getCartItems(userId: string): Promise<CartItem[]>;
  addToCart(item: InsertCartItem & { userId: string }): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Order operations
  getOrders(userId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder & { userId: string }): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order>;

  // Ad Content operations
  getAdContent(productId: string): Promise<AdContent[]>;
  createAdContent(content: Omit<AdContent, 'id' | 'createdAt'>): Promise<AdContent>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private reviews: Map<string, Review> = new Map();
  private cartItems: Map<string, CartItem> = new Map();
  private orders: Map<string, Order> = new Map();
  private adContent: Map<string, AdContent> = new Map();

  constructor() {
    // Create default sample shopkeeper user and product
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleShopkeeper: User = {
      id: randomUUID(),
      email: "rajesh.kumar@example.com",
      username: "rajesh_kumar",
      role: "shopkeeper",
      firstName: "Rajesh",
      lastName: "Kumar",
      location: "Rajasthan, India",
      experience: "15+ years",
      specialty: "Traditional Ceramics",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
    };

    const sampleProduct: Product = {
      id: randomUUID(),
      sellerId: sampleShopkeeper.id,
      name: "Traditional Ceramic Pot",
      description: "This exquisite traditional ceramic pot showcases the timeless artistry of Rajasthani pottery. Handcrafted by master artisan Rajesh Kumar, each piece represents generations of skill and cultural heritage. The intricate blue and white patterns are hand-painted using natural pigments and traditional techniques passed down through centuries.",
      price: "1250.00",
      category: "Ceramics & Pottery",
      subcategory: "Decorative Pots",
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop"
      ],
      tags: ["handmade", "traditional", "ceramic", "pottery", "rajasthan", "home decor"],
      dimensions: "15 x 15 x 20 cm",
      weight: "0.8",
      material: "Premium Clay with Natural Glazing",
      stock: 8,
      views: 156,
      rating: "4.8",
      reviewCount: 12,
      isActive: true,
      authenticityCode: "AUTH-12345",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(sampleShopkeeper.id, sampleShopkeeper);
    this.products.set(sampleProduct.id, sampleProduct);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      profileImage: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateStripeCustomerId(userId: string, customerId: string): Promise<User> {
    return this.updateUser(userId, { stripeCustomerId: customerId });
  }

  async updateUserStripeInfo(userId: string, info: { customerId: string, subscriptionId: string }): Promise<User> {
    return this.updateUser(userId, { 
      stripeCustomerId: info.customerId, 
      stripeSubscriptionId: info.subscriptionId 
    });
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.sellerId === sellerId);
  }

  async getAllProducts(filters?: { category?: string, search?: string, sortBy?: string }): Promise<Product[]> {
    let products = Array.from(this.products.values()).filter(product => product.isActive);
    
    if (filters?.category) {
      products = products.filter(product => product.category === filters.category);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
    
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price_low':
          products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case 'price_high':
          products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case 'rating':
          products.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
          break;
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    }
    
    return products;
  }

  async createProduct(product: InsertProduct & { sellerId: string }): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = {
      ...product,
      id,
      views: 0,
      rating: "0",
      reviewCount: 0,
      isActive: true,
      authenticityCode: `AUTH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const product = this.products.get(id);
    if (!product) throw new Error("Product not found");
    const updatedProduct = { ...product, ...updates, updatedAt: new Date() };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async incrementProductViews(id: string): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      product.views = (product.views || 0) + 1;
      this.products.set(id, product);
    }
  }

  async getProductReviews(productId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.productId === productId);
  }

  async createReview(review: InsertReview & { userId: string }): Promise<Review> {
    const id = randomUUID();
    const newReview: Review = {
      ...review,
      id,
      createdAt: new Date(),
    };
    this.reviews.set(id, newReview);
    await this.updateProductRating(review.productId);
    return newReview;
  }

  async updateProductRating(productId: string): Promise<void> {
    const reviews = await this.getProductReviews(productId);
    const product = this.products.get(productId);
    
    if (product && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      product.rating = avgRating.toFixed(1);
      product.reviewCount = reviews.length;
      this.products.set(productId, product);
    }
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.userId === userId);
  }

  async addToCart(item: InsertCartItem & { userId: string }): Promise<CartItem> {
    const existingItem = Array.from(this.cartItems.values()).find(
      cartItem => cartItem.userId === item.userId && cartItem.productId === item.productId
    );
    
    if (existingItem) {
      return this.updateCartItem(existingItem.id, existingItem.quantity + item.quantity);
    }
    
    const id = randomUUID();
    const newItem: CartItem = {
      ...item,
      id,
      createdAt: new Date(),
    };
    this.cartItems.set(id, newItem);
    return newItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const item = this.cartItems.get(id);
    if (!item) throw new Error("Cart item not found");
    const updatedItem = { ...item, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: string): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(userId: string): Promise<void> {
    const userItems = await this.getCartItems(userId);
    userItems.forEach(item => this.cartItems.delete(item.id));
  }

  async getOrders(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder & { userId: string }): Promise<Order> {
    const id = randomUUID();
    const newOrder: Order = {
      ...order,
      id,
      status: "pending",
      stripePaymentIntentId: null,
      createdAt: new Date(),
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new Error("Order not found");
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getAdContent(productId: string): Promise<AdContent[]> {
    return Array.from(this.adContent.values()).filter(content => content.productId === productId);
  }

  async createAdContent(content: Omit<AdContent, 'id' | 'createdAt'>): Promise<AdContent> {
    const id = randomUUID();
    const newContent: AdContent = {
      ...content,
      id,
      createdAt: new Date(),
    };
    this.adContent.set(id, newContent);
    return newContent;
  }
}

export const storage = new MemStorage();
