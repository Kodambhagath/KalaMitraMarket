# KalaMitra - Artisan Marketplace Platform

## Overview

KalaMitra is a comprehensive e-commerce platform designed to connect artisans and shopkeepers with customers worldwide. The platform empowers traditional craftspeople by providing AI-powered marketing tools, direct customer connections, and modern e-commerce capabilities. Built as a full-stack TypeScript application, it features a React frontend with shadcn/ui components, an Express.js backend, and PostgreSQL database integration through Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for build tooling
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API architecture with structured route organization
- **File Structure**: Modular design with separate route handlers and business logic
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Development**: Hot reload with tsx for development server

### Data Storage & Schema
- **Database**: PostgreSQL with connection via Neon serverless driver
- **ORM**: Drizzle ORM with TypeScript-first schema definitions
- **Migration Strategy**: Drizzle Kit for schema migrations and database management
- **Schema Design**: Comprehensive e-commerce schema including:
  - Users (customers and shopkeepers with role-based access)
  - Products with rich metadata (images, dimensions, materials, categories)
  - Reviews and ratings system
  - Shopping cart and order management
  - Ad content generation and storage

### Authentication & Authorization
- **Strategy**: Custom authentication system with role-based access control
- **User Roles**: Distinct customer and shopkeeper user types with different capabilities
- **Session Management**: Express sessions with PostgreSQL session storage
- **Security**: Secure password handling and session-based authentication

### AI Integration & External Services
- **AI Provider**: Google Gemini AI for content generation and product marketing
- **Content Generation**: Automated creation of product descriptions, marketing copy, and advertising content
- **Voice Integration**: Web Speech API for voice search functionality
- **Media Processing**: Multer for file upload handling with memory storage
- **Image Hosting**: Integration with external image services and fallback image handling

### Payment Processing
- **Payment Gateway**: Stripe integration for secure payment processing
- **Features**: Payment intents, customer management, and subscription handling
- **Client Integration**: Stripe Elements for secure payment form components
- **Server Integration**: Stripe webhook handling for payment status updates

### Development & Deployment
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Development Tools**: 
  - Replit-specific plugins for development experience
  - Runtime error overlay for debugging
  - TypeScript compilation checking
- **Environment Configuration**: Environment-based configuration for development and production
- **Asset Management**: Vite-based asset resolution with path aliasing