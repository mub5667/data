# Multi-Dataset Admin Dashboard

## Overview

This is a comprehensive admin dashboard application for managing multiple Excel-based datasets related to student enrollment, financial tracking, and administrative operations. The application provides full CRUD operations, data visualization, and analytics capabilities for educational institution data management.

The system manages seven distinct datasets:
- **ABEER 2025**: Financial income/outcome tracking
- **DATA 2025**: Student enrollment records
- **COMMISSION 24**: Commission payment tracking
- **INVOICES**: Invoice management
- **ADV BILLS 2025-2026**: Advance billing records
- **BONUS 2024**: Bonus/incentive tracking
- **Registration Form 2025**: Student registration data

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server
- **Wouter** for client-side routing (lightweight React Router alternative)

**UI Component System**
- **shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens
- Design system follows "New York" variant with enterprise admin aesthetics
- Supports light/dark theme toggling with localStorage persistence

**State Management & Data Fetching**
- **TanStack Query (React Query)** for server state management
- Automatic cache invalidation on mutations
- RESTful API communication pattern
- Toast notifications for user feedback

**Data Visualization**
- **Recharts** library for charts and graphs (bar, line, pie)
- Dashboard analytics showing financial trends and distribution metrics

**Key Design Patterns**
- Component composition with custom hooks (use-toast, use-mobile)
- Shared DataTable component for consistent CRUD operations across datasets
- Responsive sidebar navigation with collapsible mobile support
- Form validation ready with react-hook-form and zod integration

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript for the REST API
- ESM (ES Modules) configuration throughout
- Custom error handling middleware

**Data Layer Strategy**
- **In-memory storage** (MemStorage class) as the current implementation
- Interfaces defined for future database migration (IStorage interface)
- Schema definitions in shared TypeScript types for type safety across client/server

**Excel Data Import**
- **XLSX library** for reading Excel files at startup
- Automated data loading from `attached_assets` directory
- Custom date parsing for Excel serial numbers
- UUID generation for record identifiers

**API Design**
- RESTful endpoints following resource-based naming
- Standard HTTP methods: GET, POST, PUT, DELETE
- JSON request/response format
- Centralized route registration in `server/routes.ts`

**Development Features**
- Request/response logging middleware
- Vite integration for HMR in development
- Separate build output for client and server

### Database Schema (Planned)

**ORM & Migration**
- **Drizzle ORM** configured for PostgreSQL
- Type-safe schema definitions in `shared/schema.ts`
- **Neon Serverless** driver for database connectivity
- Migration files generated to `./migrations` directory

**Current Schema**
- User authentication table (username/password)
- Seven dataset interfaces defined as TypeScript types
- Shared schema validation with drizzle-zod

**Architecture Decision**: The application currently uses in-memory storage but is architected for PostgreSQL migration. All data interfaces and storage methods are abstracted through the IStorage interface, allowing seamless transition to database persistence without changing application logic.

### External Dependencies

**Core Libraries**
- **@neondatabase/serverless**: PostgreSQL database driver for Neon
- **drizzle-orm**: TypeScript ORM for type-safe database queries
- **XLSX**: Excel file parsing and generation
- **jsPDF & jspdf-autotable**: PDF export functionality

**UI Framework Components**
- **@radix-ui/react-***: Accessible component primitives (40+ components)
- **recharts**: Charting and data visualization
- **lucide-react**: Icon library
- **class-variance-authority**: Type-safe CSS variant management
- **tailwind-merge**: Intelligent Tailwind class merging

**Development Tools**
- **@replit/vite-plugin-***: Replit-specific development plugins
- **tsx**: TypeScript execution for development server
- **esbuild**: Server-side bundling for production

**Fonts**
- **Google Fonts**: Inter (primary), JetBrains Mono (monospaced data)

**Session Management**
- **express-session** with **connect-pg-simple** for PostgreSQL session store (configured but not actively used in current authentication-less setup)