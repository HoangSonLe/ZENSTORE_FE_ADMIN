# Environment Configuration

This document explains how to configure environment settings in the ZenStore Admin application.

## Environment Variables

The following environment variables can be used to configure the application:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | API URL for backend services | `https://10.0.0.11:44368` |
| `NEXT_PUBLIC_SITE_NAME` | Site name | `ZenStore` |
| `NEXT_PUBLIC_AUTH_ENABLED` | Enable or disable authentication | `true` |
| `NEXT_PUBLIC_SESSION_TIMEOUT` | Session timeout in minutes | `60` |

## How It Works

The application uses a two-step approach to handle environment configuration:

1. **Build-time Configuration**: Environment variables from `.env` files are used to generate the `public/env-config.js` file during the build process.

2. **Runtime Configuration**: The `env-config.js` file can be modified after deployment to change configuration values without rebuilding the application.

## Usage

### Development

During development, you can set environment variables in a `.env` file in the project root:

```
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SITE_NAME=MyApp
NEXT_PUBLIC_AUTH_ENABLED=false
NEXT_PUBLIC_SESSION_TIMEOUT=30
```

The `npm run dev` command will automatically generate the `env-config.js` file from these variables.

### Production

For production builds, the environment variables are baked into the `env-config.js` file during the build process.

After deployment, you can modify the `public/env-config.js` file directly to change configuration values without rebuilding the application:

```javascript
// This file can be modified after deployment to change configuration values
// without rebuilding the application
window.ENV_CONFIG = {
  // API URL for backend services
  API_URL: "https://api.example.com",
  
  // Site name
  SITE_NAME: "MyApp",
  
  // Authentication settings (set to false to disable authentication)
  AUTH_ENABLED: false,
  
  // Session timeout in milliseconds (30 minutes)
  SESSION_TIMEOUT: 1800000
};
```

## Accessing Configuration Values

In your code, you can access the configuration values using the `env` object from `constants/env.ts`:

```typescript
import env from "@/constants/env";

// Use the API URL
const apiUrl = env.API_URL;

// Check if authentication is enabled
if (env.AUTH_ENABLED) {
  // Do something
}
```

The `env` object will automatically use the values from `env-config.js` if available, or fall back to the build-time environment variables.
