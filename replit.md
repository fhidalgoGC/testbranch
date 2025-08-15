# GrainChain Platform

## Overview
This project is a full-stack web application for creating and managing grain and commodity trading contracts. Its purpose is to provide a modular and scalable platform covering the entire contract lifecycle, from buyer/seller management to contract creation and tracking. The application emphasizes a modern user experience, robust authentication, and efficient data management to streamline agricultural commodity trading.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript and Vite.
- **UI/Styling**: Shadcn/ui (Radix UI primitives), Tailwind CSS with CSS variables, Microsoft Fluent UI styling.
- **State Management**: Redux Toolkit with RTK Query.
- **Forms**: React Hook Form with Zod validation.
- **Internationalization**: i18next (Spanish/English).
- **Theming**: Dark mode and an agricultural green theme with persistence.
- **Routing**: Wouter for SPA navigation.

### Backend
- **Framework**: Express.js with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM (via Neon serverless).
- **Authentication**: Auth0 integration with JWT, refresh, and access token management.
- **API Structure**: RESTful endpoints (`/api` prefix).

### Project Structure
- `client/src/`: Frontend code (components, services, features, pages, locales).
- `server/`: Backend logic.
- `shared/`: Shared database schema and types.

### Key Features & Design Decisions
- **Authentication**: Auth0 integration for secure login, token management, and protected routes.
- **Database Layer**: Drizzle ORM for type-safe interactions and managed migrations.
- **UI System**: Consistent design via Shadcn/ui, responsive layout with Tailwind CSS, and accessible components.
- **Data Flow**: RTK Query for API calls, Redux for global state, and localStorage for persistent preferences.
- **Form Management**: Extensive use of React Hook Form and Zod for type-safe and validated inputs.
- **Dynamic Data Handling**: Dynamic configuration loading based on commodity selection, conditional pricing logic (fixed vs. basis), and robust flag validation.
- **Reusable Components**: Agnostic `StandardTable`/`GenericTable` for data display, designed for reusability with business logic separated into external services.
- **Contract Management**: Comprehensive contract deletion with confirmation modal, dynamic seller/buyer information display in contract details, and automatic data refresh after sub-contract creation.
- **Sub-Contract Management**: Two-step API integration for sub-contract creation with Redis state management, comprehensive confirmation modal for data preview, and standardized measurement unit selection.
- **API Authentication**: Centralized `authenticatedFetch` interceptor for automatic JWT token and partition key header injection. ALL external API calls must use this interceptor except for explicitly excluded endpoints (Auth0 token exchange, public APIs). This ensures consistent authentication, error handling, and header management across the application.
- **Navigation**: Optimized navigation using Wouter's `setLocation()` for instant page transitions and consistent hierarchical navigation state management across all pages.
- **Color Standards**: Consistent color schemes for pricing types (blue for fixed, purple for basis) applied across the UI for visual consistency.

## External Dependencies

### Core
- `@neondatabase/serverless`
- `drizzle-orm`
- `@reduxjs/toolkit`
- `react-hook-form`
- `zod`
- `i18next`

### UI
- `@radix-ui/*`
- `tailwindcss`
- `class-variance-authority`
- `lucide-react`

### Development & Build Tools
- `vite`
- `tsx`
- `esbuild`

### Third-Party Services
- **Auth0**: User authentication and authorization.
- **Neon**: Serverless PostgreSQL database.
- **CRM API**: External CRM system.