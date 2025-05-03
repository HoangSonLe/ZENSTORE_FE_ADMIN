# Authentication Configuration

This document explains how to configure authentication settings in the ZenStore Admin application.

## Environment Variables

The following environment variables can be used to configure authentication:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_AUTH_ENABLED` | Enable or disable authentication | `true` |
| `NEXT_PUBLIC_SESSION_TIMEOUT` | Session timeout in minutes | `5` |

### Examples

```bash
# Disable authentication
NEXT_PUBLIC_AUTH_ENABLED=false

# Set session timeout to 30 minutes
NEXT_PUBLIC_SESSION_TIMEOUT=30
```

## Runtime Configuration

Authentication can also be configured after deployment using the runtime configuration file:

```javascript
// public/runtime-config.js
window.RUNTIME_CONFIG = {
  // ... other settings
  AUTH_ENABLED: true,
  SESSION_TIMEOUT: 300000, // 5 minutes in milliseconds
};
```

You can use the configuration editor at `/config-editor.html` to update these settings after deployment.

## How It Works

1. **Authentication Enabled (`AUTH_ENABLED`)**:
   - When set to `true`, users must log in to access protected routes
   - When set to `false`, authentication is bypassed and all users are automatically logged in with a default user

2. **Session Timeout (`SESSION_TIMEOUT`)**:
   - Controls how long a user can be inactive before being logged out
   - Measured in milliseconds in the runtime config, but in minutes in the environment variable
   - User activity (clicks, keystrokes, scrolling) resets the timeout

## Implementation Details

- Authentication state is managed by the `AuthProvider` in `context/auth-context.tsx`
- Protected routes are handled by the `ProtectedRoute` component in `components/auth/protected-route.tsx`
- Environment variables are defined in `constants/env.ts`
- Runtime configuration can override environment variables
