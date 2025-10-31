# Client File Queue Management System

## Overview

This is a productivity application for managing client work queues with automatic time tracking and visual urgency indicators. The system allows users to organize and prioritize daily client work, track time since last interaction, and manage file statuses through an intuitive drag-and-drop interface. Built with a modern full-stack TypeScript architecture, it emphasizes efficiency, clarity, and learnability inspired by Linear's clean task management interface and Material Design's data-dense patterns.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, chosen for fast hot module replacement and optimized production builds
- **Wouter** for lightweight client-side routing (single-page application with Dashboard and NotFound routes)

**UI Component System**
- **shadcn/ui** component library (New York style variant) built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens
- Design system follows a Linear + Material Design hybrid approach prioritizing information clarity and scannable layouts
- Typography uses Inter for UI text and JetBrains Mono for numeric/timer displays
- Consistent spacing primitives (2, 4, 6, 8 Tailwind units) for micro to major spacing

**State Management & Data Fetching**
- **TanStack Query (React Query)** for server state management, caching, and synchronization
- Custom query client configuration with disabled refetching (manual control)
- Optimistic updates via mutation callbacks and query invalidation

**Drag and Drop**
- **@hello-pangea/dnd** for queue reordering functionality
- Enables visual prioritization of client files through drag-and-drop interaction

**Form Handling**
- **React Hook Form** with **Zod** schema validation via @hookform/resolvers
- Shared validation schemas between client and server for consistency

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript in ESM module format
- Custom middleware for request/response logging with JSON capture
- Static file serving in production, Vite middleware in development

**API Design**
- RESTful API endpoints under `/api` prefix
- CRUD operations for client files: GET, POST, PATCH, DELETE
- Additional endpoints for "touch" operations (updating lastTouchedAt) and bulk reordering
- Zod validation on all incoming requests with detailed error responses

**Development vs Production**
- Development: Vite dev server integrated as Express middleware with HMR support
- Production: Pre-built static assets served from `dist/public`
- Server-side code bundled with esbuild for production deployment

### Data Storage Solutions

**Database Strategy**
- **Drizzle ORM** for type-safe database operations and schema management
- **PostgreSQL** as the primary database (via @neondatabase/serverless for cloud compatibility)
- Schema defined in TypeScript with automatic type inference for full-stack type safety

**Data Model**
- **ClientFile** entity with fields:
  - id (UUID primary key)
  - clientName (text, required)
  - description (text, optional)
  - status (enum: waiting, in_progress, completed)
  - queuePosition (integer for ordering)
  - createdAt (timestamp)
  - lastTouchedAt (timestamp, nullable)

**Storage Abstraction**
- IStorage interface defines data access contract
- MemStorage implementation for in-memory development/testing
- Designed for easy swapping to database-backed implementation (Drizzle + PostgreSQL)

**Urgency Calculation**
- Time-based urgency levels computed from createdAt/lastTouchedAt:
  - Low: < 4 hours (green)
  - Medium: 4-8 hours (yellow)
  - High: 8-24 hours (orange)
  - Critical: > 24 hours (red)

### External Dependencies

**Third-Party UI Libraries**
- **Radix UI** primitives (@radix-ui/*) for accessible, unstyled component foundations
- **Lucide React** for consistent iconography
- **date-fns** for human-readable time formatting ("X hours ago")
- **class-variance-authority** and **clsx** for conditional CSS class composition

**Development Tools**
- **Replit-specific plugins**: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner
- **tsx** for running TypeScript in development
- **esbuild** for production server bundling
- **drizzle-kit** for database schema migrations

**Database & Session Management**
- **@neondatabase/serverless** for PostgreSQL connectivity
- **connect-pg-simple** for PostgreSQL-backed session storage (prepared for authentication features)

**Type Safety & Validation**
- **Zod** for runtime schema validation
- **drizzle-zod** for automatic Zod schema generation from Drizzle tables
- Shared schema definitions in `/shared` directory consumed by both client and server

**Styling & Design**
- Custom CSS variables for theming with light/dark mode support structure
- Google Fonts CDN for Inter and JetBrains Mono typefaces
- Tailwind configuration with custom border radius, color system, and spacing scale