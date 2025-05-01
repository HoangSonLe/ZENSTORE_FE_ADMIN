# Deployment Instructions

This document provides instructions for deploying and configuring the ZenStore Admin application.

## Static Deployment

The application is built as a static export and can be deployed to any static hosting service.

### Deployment Steps

1. Copy all files from the `out` directory to your web server or static hosting service
2. Configure your web server to serve the `index.html` file for all routes (SPA routing)
3. Set proper MIME types for all file extensions
4. Enable CORS if needed

## Configuration After Deployment

The application uses a runtime configuration file that can be modified after deployment without rebuilding the application.

### Updating the Configuration

1. **Using the Configuration Editor**:
   - Navigate to `/config-editor.html` in your deployed application
   - Update the configuration values as needed
   - Click "Download Configuration File" to download the updated configuration file
   - Replace the `runtime-config.js` file on your server with the downloaded file

2. **Manually Editing the Configuration File**:
   - Edit the `/runtime-config.js` file on your server
   - Update the configuration values as needed
   - Save the file

### Configuration Options

The following configuration options are available:

- `BASE_URL`: The base URL of the application (without trailing slash)
- `API_URL`: The URL of the backend API
- `DEBUG`: Enable or disable debug mode
- `VERSION`: The version of the application

Example configuration:

```javascript
window.RUNTIME_CONFIG = {
  BASE_URL: "https://client.zenstores.com.vn",
  API_URL: "https://10.0.0.11:44368",
  DEBUG: false,
  VERSION: "1.0.0"
};
```

## Troubleshooting

### Chunk Loading Errors

If you encounter chunk loading errors after deployment:

1. Make sure the `BASE_URL` in `runtime-config.js` is set correctly
2. Clear the browser cache and reload the page
3. If the error persists, try updating the configuration using the Configuration Editor

### API Connection Issues

If the application cannot connect to the API:

1. Make sure the `API_URL` in `runtime-config.js` is set correctly
2. Check that CORS is properly configured on the API server
3. Verify that the API server is running and accessible from the client

## Support

For additional support, please contact the development team.
