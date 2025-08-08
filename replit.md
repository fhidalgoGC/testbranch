# Replit.md - GrainChain Platform

## Overview

This is a full-stack web application for creating grain and commodity trading contracts. The project follows a modern React + Express architecture with TypeScript throughout, PostgreSQL database with Drizzle ORM, and Auth0 for authentication. The application is designed with a feature-based architecture, emphasizing modularity and scalability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: Redux Toolkit with RTK Query for API calls
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: i18next for Spanish/English support

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Auth0 integration
- **Session Management**: In-memory storage with extensible interface
- **API Structure**: RESTful endpoints with `/api` prefix

### Project Structure
```
client/src/
├── app/                 # Redux store configuration
├── components/ui/       # Reusable UI components (Shadcn/ui)
├── features/           # Feature-based modules
│   └── auth/          # Authentication feature
├── common/            # Shared utilities and hooks
├── pages/             # Page components
└── locales/           # Translation files

server/
├── index.ts           # Express app setup
├── routes.ts          # API route definitions
├── storage.ts         # Data layer abstraction
└── vite.ts            # Vite integration for development

shared/
└── schema.ts          # Shared database schema and types
```

## Key Components

### Authentication System
- **Auth0 Integration**: Password-based authentication using Auth0's API
- **Token Management**: JWT, refresh, and access tokens stored in localStorage
- **State Management**: Redux slice for authentication state
- **Credential Storage**: Local storage for saved user credentials
- **Protected Routes**: Route-level authentication checks

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Shared schema definitions using Drizzle and Zod
- **Migrations**: Database migrations in `/migrations` directory
- **Storage Interface**: Abstracted storage layer for easy testing and extension

### UI System
- **Design System**: Shadcn/ui components with consistent theming
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: CSS variables-based theming system
- **Accessibility**: Built on Radix UI primitives for accessibility

### Development Tools
- **Hot Reload**: Vite with React Fast Refresh
- **Error Handling**: Runtime error modal for development
- **TypeScript**: Strict typing throughout the application
- **Code Quality**: ESLint and TypeScript compiler checks

## Data Flow

### Authentication Flow
1. User submits credentials via login form
2. Frontend calls Auth0 API through RTK Query
3. Auth0 returns tokens (access, refresh, ID)
4. Tokens stored in localStorage and Redux state
5. Frontend calls identity API to fetch user profile data
6. User profile data stored in localStorage (user_name, user_lastname, user_id, user_email)
7. Frontend calls partition keys API to fetch user partition information
8. Partition key stored in localStorage (partition_key from first array element)
9. Frontend calls organization API to fetch organization information
10. Representative people ID stored in localStorage (representative_people_id from extras array)
11. Frontend calls people API to fetch representative people information
12. Representative people data stored in localStorage (representative_people_full_name, representative_people_first_name, representative_people_last_name, representative_people_email, representative_people_calling_code, representative_people_phone_number)
13. User redirected to dashboard on successful authentication

### API Request Flow
1. Frontend components use RTK Query hooks
2. API requests include authentication headers
3. Express middleware handles request logging
4. Routes interact with storage layer
5. Response data flows back through RTK Query to components

### State Management
- **Global State**: Redux store with feature-based slices
- **Server State**: RTK Query for API data caching
- **Local State**: React hooks for component-specific state
- **Persistent State**: localStorage for user preferences and tokens

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **drizzle-orm**: Type-safe ORM for PostgreSQL
- **@reduxjs/toolkit**: Redux state management
- **@tanstack/react-query**: Additional query capabilities
- **react-hook-form**: Form management
- **zod**: Schema validation
- **i18next**: Internationalization

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: JavaScript bundler for production builds

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: Local Vite dev server with Express backend
- **Production**: Static files served by Express with bundled backend
- **Database**: Environment-specific DATABASE_URL configuration

### Hosting Requirements
- Node.js runtime for Express server
- PostgreSQL database (Neon serverless recommended)
- Auth0 tenant with configured application
- Environment variables for Auth0 and database credentials

### Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run db:push`: Apply database migrations

## Recent Changes

### Complete React Hook Form Integration with Controllers (August 8, 2025)
- **Full RHF integration**: Migrated all form inputs to use react-hook-form Controller for complete state management
- **Unified state control**: Price, basis, and freight cost fields now fully controlled by RHF with zodResolver validation
- **Real-time calculations**: Auto-calculation of future_price maintained while using RHF Controller pattern
- **Type-safe field handling**: Added null checks and proper TypeScript validation for all numeric inputs
- **Centralized form state**: All form changes now flow through RHF's setValue and watch mechanisms
- **Improved validation**: Field-level validation now works seamlessly with Controller render props
- **Enhanced debugging**: Form state is now completely traceable through RHF's built-in debugging tools

### Price Section Dynamic Behavior Implementation (August 7, 2025)
- **Smart pricing logic**: Implemented conditional behavior based on pricing_type selection
- **Fixed pricing type**: Shows all fields (price, basis, futures) with automatic calculations
- **Basis pricing type**: Shows only basis field, hides price and futures fields
- **Automatic calculations**: When pricing_type is 'fixed', futures = price - basis automatically calculated
- **Price synchronization**: When price changes in fixed mode, value automatically copied to futures
- **Negative basis support**: Allows negative values in basis field for both pricing types
- **Read-only futures**: Futures field is calculated and read-only in fixed pricing mode
- **Type-safe implementation**: Resolved TypeScript issues with explicit field handling
- **Business logic integration**: Implements exact mathematical relationship: price = future + basis

### Flag Validation System with Fallback Assets (July 20, 2025)
- **Robust flag validation**: Intelligent detection of invalid, empty, or broken flag URLs
- **Automatic fallback system**: Uses user-provided flag assets for Colombia and Guatemala
- **Real-time synchronization**: Country selector input perfectly syncs with selected country flag
- **Comprehensive logging**: Detailed console logs for flag validation debugging
- **Multiple validation methods**: Base64, URL, and imported asset detection
- **Immediate fallback**: Detects invalid flags instantly without loading errors
- **Enhanced UX**: No more broken flag icons, seamless flag display

### Create Buyer Form with Idempotency System (July 18, 2025)
- **Complete buyer registration form**: Modern Microsoft Fluent UI styled form with all required fields
- **Idempotency system**: POST endpoint call on form load to generate unique buyer ID
- **Conditional validation**: Different fields for natural vs juridical persons
- **Country code validation**: Email and phone validation with US/Mexico country codes
- **Demo mode support**: Automatic fallback when no real authentication tokens present
- **Real API integration**: Direct calls to CRM API endpoints when authenticated
- **Form state management**: Comprehensive error handling and loading states
- **Success workflow**: Automatic redirect and cache invalidation after successful creation
- **Authentication detection**: Smart detection between real tokens and demo mode

### Dark Mode & Agricultural Green Theme Implementation (July 16, 2025)
- **Dark mode toggle**: Added theme toggle button in navbar (left of language selector)
- **Theme persistence**: Theme preference saved to localStorage and persists across navigation
- **Agricultural green theme**: Unified button styling using green colors (hsl(142, 76%, 36%)) for agricultural context
- **CSS variables**: Updated theme system with agricultural green color palette for light/dark modes
- **ThemeProvider**: React context provider for theme management with light/dark mode support
- **Button uniformity**: All buttons now use consistent agricultural green styling
- **Dark mode compatibility**: Full dark mode support for all existing components
- **Internationalization**: Added theme toggle translations in Spanish/English
- **Fluent UI integration**: Theme toggle styled with Microsoft Fluent UI design language

### Comprehensive Internationalization (July 16, 2025)
- **DataTable translations**: Complete translation support for all table elements
- **Search functionality**: Translated search placeholder and controls
- **Pagination labels**: Translated pagination text ("Page X of Y", "Showing X to Y of Z results")
- **Loading states**: Translated loading and empty state messages
- **Column headers**: Dynamic translation of table column headers
- **Add button**: Translated "Add Buyer" / "Agregar Comprador" button with agricultural green styling

### Reusable Data Table Component (July 15, 2025)
- **Comprehensive table component**: Created reusable DataTable component with enterprise-grade features
- **Pagination system**: Full pagination with page size options (10, 25, 50, 100) and navigation controls
- **Sorting functionality**: Click column headers to sort, visual indicators for sort direction
- **Search with debounce**: 500ms debounced search with clear button, searches across multiple fields
- **Buyers page implementation**: Complete buyers list with API integration and data formatting
- **Microsoft Fluent UI styling**: Consistent design language matching sidebar and navbar
- **API integration**: External CRM API calls with proper authentication and filtering
- **TypeScript types**: Complete type definitions for buyers data structure
- **Custom hooks**: Encapsulated data fetching and state management logic
- **Responsive design**: Mobile-friendly table with proper overflow handling

### Dashboard Layout Implementation (July 15, 2025)
- **Complete UI overhaul**: Replaced simple welcome screen with comprehensive dashboard layout
- **Sidebar navigation**: Left-side menu with icons for Dashboard, Buyers, Sellers, Purchase Contracts, Sale Contracts
- **Top navigation bar**: Page title on left, language selector and user menu on right
- **Language switching**: Circular flag icons with dropdown menu, persists selection in localStorage
- **User profile system**: Avatar with user initials, name display, logout functionality moved to dropdown
- **Full-screen layout**: Optimized space utilization with sidebar + main content area
- **Responsive design**: Mobile-first approach with proper breakpoints
- **Microsoft Fluent UI styling**: Applied authentic Microsoft design system to all components
- **Company branding**: Added GrainChain logo to sidebar with proper sizing
- **Internationalization**: Added Spanish/English translations for all new UI elements