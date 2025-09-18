import { GoogleGenAI } from "@google/genai";

const genAI = import.meta.env.VITE_GEMINI_API_KEY 
  ? new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })
  : null;

export const generateAdContent = async (productDescription: string) => {
  if (!genAI) {
    // Fallback mock response when API key is not available
    return {
      tagline: "Crafted with Love, Cherished for Life",
      description: "Experience the timeless beauty of traditional craftsmanship with our handmade products. Each piece tells a story of heritage, skill, and artistic passion passed down through generations.",
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop"
      ]
    };
  }

  try {
    const prompt = `Create compelling marketing content for this handcrafted product: ${productDescription}
    
    Please return a JSON object with:
    - tagline: A catchy, memorable tagline (max 10 words)
    - description: A detailed marketing description (2-3 sentences)
    
    Focus on the craftsmanship, uniqueness, and emotional appeal of handmade products.`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const response = result.text;
    
    try {
      const parsed = JSON.parse(response);
      return {
        tagline: parsed.tagline || "Handcrafted Excellence",
        description: parsed.description || "Discover the beauty of traditional craftsmanship.",
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"
        ]
      };
    } catch {
      return {
        tagline: "Handcrafted with Passion",
        description: "Each piece tells a unique story of traditional artistry and skilled craftsmanship.",
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"
        ]
      };
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      tagline: "Authentic Handcrafted Art",
      description: "Experience the beauty and uniqueness of traditional craftsmanship in every detail.",
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"
      ]
    };
  }
};

export const generateImprovementTips = async (productData: { name: string; category: string; price: string; views: number; rating: string }) => {
  if (!genAI) {
    return [
      "Add more close-up shots of your product details to increase engagement by 23%",
      "Your pricing is 15% below market average - consider adjusting for better profitability"
    ];
  }

  try {
    const prompt = `Analyze this product data and provide 2-3 specific improvement tips:
    Product: ${productData.name}
    Category: ${productData.category}
    Price: ₹${productData.price}
    Views: ${productData.views}
    Rating: ${productData.rating}
    
    Provide actionable tips for improving sales, visibility, or product appeal. Be specific and include percentages where relevant.`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const response = result.text;
    
    // Parse the response into individual tips
    const tips = response.split('\n').filter((tip: string) => tip.trim().length > 10).slice(0, 3);
    
    return tips.length > 0 ? tips : [
      "Add more detailed product descriptions to improve customer confidence",
      "Consider adding more product images from different angles"
    ];
  } catch (error) {
    console.error("Gemini API error:", error);
    return [
      "Optimize your product photos with better lighting and angles",
      "Add more descriptive keywords to improve search visibility"
    ];
  }
};
