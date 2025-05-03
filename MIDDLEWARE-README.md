# Middleware and Static Exports in Next.js

## Important Note

This project uses Next.js with `output: "export"` for static site generation. **Middleware cannot be used with static exports** because there is no server to execute the middleware code during request processing.

## Current Implementation

- The middleware has been disabled by renaming it to `middleware.ts.disabled`
- Authentication is handled entirely on the client side through:
  - `AuthProvider` in `context/auth-context.tsx`
  - `ProtectedRoute` component in `components/auth/protected-route.tsx`

## How Client-Side Authentication Works

1. The `AuthProvider` checks for an authentication token in localStorage on initial load
2. If a token exists, it attempts to fetch user information
3. The `ProtectedRoute` component wraps protected pages and redirects to the login page if the user is not authenticated
4. Session expiration is handled by checking the last activity timestamp

## Re-enabling Middleware

If you need to switch back to a server-rendered application:

1. Remove the `output: "export"` option from `next.config.js`
2. Rename `middleware.ts.disabled` back to `middleware.ts`

## Authentication Flow

- Login: `/auth/login` → Enter credentials → `/auth/lock` → Enter code → `/dashboard`
- Session timeout: Automatic redirect to `/auth/lock`
- Logout: Clear token → Redirect to `/auth/lock`

## Configuration

Runtime configuration is handled through:
- `public/runtime-config.js` - Main configuration values
- `public/path-config.js` - Path handling for static assets

These files can be modified after the build to change configuration values without rebuilding the application.
