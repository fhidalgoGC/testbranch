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
9. User redirected to dashboard on successful authentication

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