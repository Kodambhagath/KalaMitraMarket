import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertProductSchema, insertUserSchema, insertReviewSchema, insertCartItemSchema, insertOrderSchema } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
}) : null;

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Create default sample product for shopkeepers
      if (userData.role === 'shopkeeper') {
        await storage.createProduct({
          sellerId: user.id,
          name: "Sample Product",
          description: "This is a sample product to get you started. Edit or delete this product and add your own!",
          price: "999.00",
          category: "Sample Category",
          subcategory: "Sample",
          images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"],
          tags: ["sample", "starter"],
          dimensions: "10 x 10 x 10 cm",
          weight: "0.5",
          material: "Sample Material",
          stock: 1,
        });
      }
      
      res.json({ user: { ...user, password: undefined } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ user: { ...user, password: undefined } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search, sortBy } = req.query;
      const products = await storage.getAllProducts({
        category: category as string,
        search: search as string,
        sortBy: sortBy as string,
      });
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Increment view count
      await storage.incrementProductViews(req.params.id);
      
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/seller/:sellerId", async (req, res) => {
    try {
      const products = await storage.getProductsBySeller(req.params.sellerId);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products", upload.array('images', 5), async (req, res) => {
    try {
      const productData = insertProductSchema.parse({
        ...req.body,
        images: req.body.images ? JSON.parse(req.body.images) : [],
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      });
      
      const product = await storage.createProduct({
        ...productData,
        sellerId: req.body.sellerId,
      });
      
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Review routes
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.id);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products/:id/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        productId: req.params.id,
      });
      
      const review = await storage.createReview({
        ...reviewData,
        userId: req.body.userId,
      });
      
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Cart routes
  app.get("/api/cart/:userId", async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.params.userId);
      res.json(cartItems);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const cartData = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addToCart({
        ...cartData,
        userId: req.body.userId,
      });
      res.json(cartItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(req.params.id, quantity);
      res.json(cartItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // AI Ad Generation routes
  app.post("/api/ai/generate-ad", async (req, res) => {
    try {
      const { prompt, productId, userId } = req.body;
      
      if (!genAI) {
        // Fallback mock response
        return res.json({
          script: {
            tagline: "Crafted with Love, Cherished for Life",
            description: "Experience the timeless beauty of traditional craftsmanship with our handmade products. Each piece tells a story of heritage, skill, and artistic passion passed down through generations."
          },
          images: [
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop"
          ],
          videoUrl: "/api/placeholder-video"
        });
      }

      // Generate ad script
      const scriptPrompt = `Create a compelling marketing tagline and description for this product: ${prompt}. Return JSON with 'tagline' and 'description' fields.`;
      
      const scriptResult = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: scriptPrompt,
      });
      const scriptText = scriptResult.text;
      
      let scriptContent;
      try {
        scriptContent = JSON.parse(scriptText);
      } catch {
        scriptContent = {
          tagline: "Handcrafted Excellence",
          description: "Discover the beauty of traditional craftsmanship with this unique product."
        };
      }

      // Generate marketing images
      const imagePrompt = `Create a professional marketing image for: ${prompt}. Style: clean, modern, product-focused with warm lighting.`;
      
      let generatedImages = [];
      try {
        const imageResult = await genAI.models.generateContent({
          model: "gemini-2.0-flash-preview-image-generation",
          contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
          config: {
            responseModalities: ["TEXT", "IMAGE"],
          }
        });
        
        // Process generated images here (implementation depends on how you want to handle the base64 data)
        generatedImages = [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop"
        ];
      } catch (error) {
        console.error("Image generation failed:", error);
        generatedImages = [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"
        ];
      }

      // Store ad content
      await storage.createAdContent({
        productId,
        userId,
        type: 'script',
        content: scriptContent
      });

      await storage.createAdContent({
        productId,
        userId,
        type: 'image',
        content: { imageUrl: generatedImages[0] }
      });

      res.json({
        script: scriptContent,
        images: generatedImages,
        videoUrl: "/api/video/generate"
      });

    } catch (error: any) {
      console.error("AI generation error:", error);
      res.status(500).json({ message: "AI generation failed", error: error.message });
    }
  });

  // Video generation placeholder
  app.get("/api/video/generate", async (req, res) => {
    res.json({ 
      message: "Video generation would be implemented with ffmpeg.wasm",
      videoUrl: "data:video/mp4;base64,placeholder"
    });
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe not configured" });
      }

      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "inr",
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Order routes
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder({
        ...orderData,
        userId: req.body.userId,
      });
      
      // Clear cart after successful order
      await storage.clearCart(req.body.userId);
      
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/orders/:userId", async (req, res) => {
    try {
      const orders = await storage.getOrders(req.params.userId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Analytics routes
  app.get("/api/analytics/:sellerId", async (req, res) => {
    try {
      const products = await storage.getProductsBySeller(req.params.sellerId);
      const totalViews = products.reduce((sum, product) => sum + (product.views || 0), 0);
      const totalProducts = products.length;
      const avgRating = products.reduce((sum, product) => sum + parseFloat(product.rating), 0) / totalProducts;
      
      res.json({
        totalProducts,
        totalViews,
        averageRating: avgRating.toFixed(1),
        topProduct: products.sort((a, b) => (b.views || 0) - (a.views || 0))[0],
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
