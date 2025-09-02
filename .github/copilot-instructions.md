# Financial Dashboard App

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

Financial Dashboard App is a Next.js 14 TypeScript application that provides comprehensive personal finance management including budget tracking, savings goals, debt management, and financial analytics. The app uses Neon PostgreSQL for data storage and is designed for deployment on Vercel.

## Working Effectively

### Bootstrap and Dependencies
- Install dependencies: `npm install` -- takes 17 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
- CRITICAL: ESLint setup on first run: `npm run lint` -- takes 3.5 minutes on first setup, then 3 seconds subsequent runs. NEVER CANCEL. Set timeout to 5+ minutes for first run.

### Environment Setup
- REQUIRED: Create `.env.local` file with DATABASE_URL for Neon PostgreSQL connection
- Example: `DATABASE_URL=postgresql://user:password@host:5432/database`
- Build will fail without DATABASE_URL environment variable

### Build Process
- Build production version: `npm run build` -- takes 13-19 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
- EXPECTED: Build shows warnings about dynamic server usage for API routes - this is normal
- EXPECTED: Build will fail if DATABASE_URL is not set in environment

### Development Server
- Start development server: `npm run dev` -- ready in 1.4 seconds, runs on http://localhost:3000
- Production server: `npm run start` -- starts production server (requires build first)

### Database Operations
- CRITICAL: Requires valid DATABASE_URL environment variable for all database operations
- Database connection and operations are handled through API routes in `/app/api/`
- Database schema includes tables for users, budgets, savings goals, debts, and transactions

### Linting and Code Quality
- Run ESLint: `npm run lint` -- 3 seconds after initial setup
- EXPECTED: Will show warnings about React Hook dependencies and escaped quotes - these are non-blocking

## Validation

### Manual Validation Requirements
- ALWAYS test the complete application functionality after making changes
- ALWAYS run through at least one complete end-to-end scenario after making changes
- Use the comprehensive test API script: `node test-api.js` (requires DATABASE_URL)

### Complete Test Scenarios
The application includes a comprehensive test script (`test-api.js`) that validates:
1. User registration and authentication
2. Budget creation and tracking
3. Savings goals management
4. Debt tracking and payments
5. Dashboard statistics calculation
6. Database integration

### Build Validation
- ALWAYS run `npm run build` before completing changes
- ALWAYS run `npm run lint` and address any new errors (warnings are acceptable)
- Verify development server starts with `npm run dev`

## Project Structure

### Key Directories
- `/app` - Next.js App Router structure with pages and API routes
- `/app/api` - REST API endpoints for all financial operations
- `/app/dashboard` - Main dashboard pages (budget, savings, debt, analytics, settings)
- `/components` - React components organized by feature
- `/components/ui` - Shadcn/ui components
- `/contexts` - React contexts for global state management
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and helpers
- `/scripts` - Database and utility scripts (avoid using, may contain incomplete information)
- `/styles` - CSS and styling files

### Important Files
- `package.json` - Project dependencies and scripts
- `next.config.mjs` - Next.js configuration (ESLint/TypeScript ignoring enabled for builds)
- `tsconfig.json` - TypeScript configuration
- `components.json` - Shadcn/ui configuration
- `tailwind.config.js` - Tailwind CSS configuration (empty - uses defaults)
- `postcss.config.mjs` - PostCSS configuration for Tailwind
- `.eslintrc.json` - ESLint configuration (created after first lint run)

### API Structure
All API routes are in `/app/api/`:
- `/auth` - User authentication (login, register, logout, user info)
- `/accounts` - Bank account management
- `/budgets` - Budget tracking and management
- `/savings` - Savings goals management
- `/debts` - Debt tracking and payments
- `/transactions` - Transaction management
- `/dashboard/stats` - Dashboard statistics
- `/activities` - Recent activity tracking

## Technology Stack

### Core Technologies
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **React 18** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **Shadcn/ui** - UI component library
- **Neon PostgreSQL** - Serverless PostgreSQL database

### Key Dependencies
- `@neondatabase/serverless` - Neon PostgreSQL client
- `@radix-ui/*` - Headless UI components
- `react-hook-form` - Form management
- `zod` - Schema validation
- `recharts` - Chart components
- `lucide-react` - Icon library
- `next-themes` - Theme management

## Common Tasks

### After Making Code Changes
1. Run `npm run lint` and fix any new errors
2. Run `npm run build` to ensure no build errors
3. Test with `npm run dev` and verify functionality
4. For database changes, test through the application's UI and API endpoints

### Working with the Database
- Database operations are handled through API routes in `/app/api/`
- Schema includes comprehensive tables for users, budgets, savings goals, debts, and transactions
- Use the application's API endpoints for database interactions
- Database connectivity can be verified through the API routes and application functionality

### Adding New Features
- Follow existing patterns in `/app/api/` for API routes
- Use TypeScript interfaces defined in existing files
- Follow the existing component structure in `/components/`
- Use existing hooks and contexts for state management

### Debugging
- Check browser console for client-side errors
- Check terminal output for server-side errors
- Verify environment variables are properly set
- Use the test API script to validate database operations

## Known Issues and Workarounds

### Build Warnings
- Dynamic server usage warnings for API routes are expected and can be ignored
- React Hook dependency warnings in ESLint are non-critical
- Escaped quote warnings in JSX are cosmetic

### Environment Requirements
- Database connection is required for full functionality
- Without DATABASE_URL, application will start but API calls will fail
- Test scenarios require valid database connection

### Performance Notes
- Initial dependency installation includes many packages (300+)
- First ESLint setup downloads and configures additional packages
- Build process is optimized and typically completes quickly

## Troubleshooting

### Build Failures
- Ensure DATABASE_URL is set in `.env.local`
- Run `npm install` if dependencies are missing
- Check for TypeScript errors in the terminal output

### Development Server Issues
- Verify port 3000 is available
- Check for syntax errors in recent changes
- Ensure all required environment variables are set

### Database Connection Issues
- Verify DATABASE_URL format and credentials
- Test connection through the application's API endpoints and functionality
- Check Neon PostgreSQL service status

Remember: Always build, test, and validate your changes thoroughly before completing any task.