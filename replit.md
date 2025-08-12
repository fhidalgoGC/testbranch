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
- `client/src/`: Contains frontend application code, organized into `app`, `components/ui`, `features` (feature-based modules like `auth`), `common`, `pages`, and `locales`.
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
- **Reusable Components**: Comprehensive DataTable component with pagination, sorting, and debounced search, styled with Microsoft Fluent UI.

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