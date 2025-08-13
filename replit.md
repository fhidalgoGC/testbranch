# GrainChain Platform

## Overview
This project is a full-stack web application designed for creating grain and commodity trading contracts. It aims to provide a modular and scalable platform for managing the entire trading contract lifecycle, from buyer/seller management to contract creation and tracking. The application emphasizes a modern user experience, robust authentication, and efficient data management to streamline agricultural commodity trading.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **UI Framework**: Shadcn/ui (built on Radix UI primitives)
- **Styling**: Tailwind CSS with CSS variables for theming
- **Routing**: Wouter
- **State Management**: Redux Toolkit with RTK Query
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: i18next (Spanish/English support)
- **Design System**: Microsoft Fluent UI styling applied for consistency.
- **Theming**: Dark mode and an agricultural green theme with persistence.

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (via Neon serverless)
- **Authentication**: Auth0 integration with JWT, refresh, and access token management.
- **Session Management**: In-memory storage (extensible).
- **API Structure**: RESTful endpoints (`/api` prefix).

### Project Structure
- `client/src/`: Contains frontend application code, organized into:
  - `components/ui`: Shadcn/ui components
  - `components/general`: Reusable components like StandardTable/GenericTable
  - `services/`: Business logic services (e.g., `contractsService.ts`)
  - `features`: Feature-based modules like `auth`
  - `pages`: Page components handling UI layout and user interactions
  - `locales`: Internationalization files
- `server/`: Houses backend logic including `index.ts`, `routes.ts`, `storage.ts`, and `vite.ts`.
- `shared/`: For shared database schema and types.

### Key Features & Design Decisions
- **Authentication**: Auth0 for secure login, token storage in localStorage, Redux for state, and protected routes. User profile and organizational data fetched post-login.
- **Database Layer**: Drizzle ORM for type-safe interactions, shared schema with Zod, and managed migrations. Abstracted storage layer for flexibility.
- **UI System**: Shadcn/ui for consistent design, responsive layout with Tailwind CSS, CSS variables for theming (including dark mode), and accessibility built on Radix UI.
- **Data Flow**:
    - **Authentication Flow**: User credentials -> Auth0 API -> tokens stored -> identity, partition keys, organization, and representative people data fetched and stored in localStorage.
    - **API Request Flow**: RTK Query hooks for frontend API calls with authentication headers; Express middleware for logging and routing to storage layer.
    - **State Management**: Redux for global state, RTK Query for server state caching, React hooks for local state, and localStorage for persistent preferences.
- **Form Management**: Extensive use of React Hook Form with Zod for validation, ensuring type-safe and controlled input fields across the application (e.g., price, basis, freight cost).
- **Dynamic Data Handling**:
    - **Characteristics Configuration**: Dynamic loading of configurations based on commodity selection.
    - **Pricing Logic**: Conditional display and calculation of price, basis, and futures fields based on pricing type (`fixed` vs. `basis`). Supports negative basis.
    - **Flag Validation**: Robust system for validating flag URLs and providing automatic fallbacks for invalid or missing flags.
- **Reusable Components**: 
  - **StandardTable/GenericTable**: Highly configurable and reusable table component with pagination, sorting, debounced search, i18n reactive translations. Component is completely agnostic and only receives processed data from parent components.
  - **Separation of Concerns**: Page-level elements (titles, filters, action buttons) are handled by page components, not table components. Business logic moved to external services (e.g., `contractsService.ts`) for better maintainability and testability.

## Recent Architectural Changes (August 2025)

### StandardTable Component Refactoring
- **Date**: August 13, 2025
- **Change**: Complete architectural refactoring of StandardTable component
- **Key Improvements**:
  - Moved all business logic from StandardTable to external services (`contractsService.ts`)
  - Page-level elements (title, filters, action buttons) moved from table component to page components
  - StandardTable is now completely agnostic and data-driven
  - Better separation of concerns: UI vs business logic
  - Improved maintainability and testability
- **Impact**: Cleaner component structure, reusable services, better code organization

### Action Menu Items Architecture
- **Date**: August 13, 2025
- **Principle**: Table components must be completely agnostic about navigation and business logic
- **Implementation**: Page components pass pre-configured action items with handlers to the table
- **Rule**: Tables should never contain hardcoded navigation URLs or business logic - all actions are externally defined and passed as props

### Navigation Performance Optimization
- **Date**: August 13, 2025
- **Issue**: Slow page navigation due to full page reloads with `window.location.href`
- **Solution**: Implemented Wouter router's `setLocation()` for SPA navigation
- **Result**: Instant, fluid navigation between pages without page reloads
- **Impact**: Significantly improved user experience and application performance

### Hierarchical Navigation State Management Fix
- **Date**: August 13, 2025
- **Issue**: State persistence was inconsistent across pages - only PurchaseContracts had proper hierarchical navigation, other pages maintained state when they shouldn't
- **Root Cause**: Not all pages were implementing the same navigation hierarchy behavior
- **Solution**: 
  - Implemented `useNavigationHandler` and `handleNavigateToPage()` in all main pages (Home, Buyers, Sellers, SaleContracts)
  - Added `saleContracts` to Redux state and navigation hierarchy
  - All top-level pages now clear their state when navigating between sibling pages
- **Result**: Consistent state management across all pages - state persists when navigating deeper in hierarchy but clears when moving between same-level pages
- **Impact**: Unified user experience and predictable state behavior throughout the application

## External Dependencies

### Core
- `@neondatabase/serverless`: Serverless PostgreSQL driver
- `drizzle-orm`: Type-safe ORM
- `@reduxjs/toolkit`: Redux state management
- `react-hook-form`: Form management
- `zod`: Schema validation
- `i18next`: Internationalization library

### UI
- `@radix-ui/*`: Accessible UI primitives
- `tailwindcss`: CSS framework
- `class-variance-authority`: Component variant management
- `lucide-react`: Icon library

### Development & Build Tools
- `vite`: Build tool and dev server
- `tsx`: TypeScript execution for Node.js
- `esbuild`: JavaScript bundler for production

### Third-Party Services
- **Auth0**: For user authentication and authorization.
- **Neon**: Serverless PostgreSQL database provider.
- **CRM API**: External CRM system for managing buyer data.