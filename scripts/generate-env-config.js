// This script generates the env-config.js file from .env variables
const fs = require("fs");
const path = require("path");

// Read the .env file directly
const envPath = path.join(process.cwd(), ".env");
let envVars = {};

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");

    // Parse the .env file
    envContent.split("\n").forEach((line) => {
        // Skip empty lines and comments
        if (!line || line.startsWith("#")) return;

        // Split by the first equals sign
        const parts = line.split("=");
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join("=").trim();
            envVars[key] = value;
        }
    });
}

// Set default values if not found in .env
const API_URL = envVars.NEXT_PUBLIC_API_URL || "https://10.0.0.11:44368";
const SITE_NAME = envVars.NEXT_PUBLIC_SITE_NAME || "ZenStore";
const AUTH_ENABLED = envVars.NEXT_PUBLIC_AUTH_ENABLED !== "false";
const SESSION_TIMEOUT = parseInt(envVars.NEXT_PUBLIC_SESSION_TIMEOUT || "60", 10) * 60 * 1000;

// Create the content for env-config.js
const content = `// This file can be modified after deployment to change configuration values
// without rebuilding the application
window.ENV_CONFIG = {
  // API URL for backend services
  API_URL: "${API_URL}",

  // Site name
  SITE_NAME: "${SITE_NAME}",

  // Authentication settings (set to false to disable authentication)
  AUTH_ENABLED: ${AUTH_ENABLED},

  // Session timeout in milliseconds (${parseInt(
      envVars.NEXT_PUBLIC_SESSION_TIMEOUT || "60",
      10
  )} minutes)
  SESSION_TIMEOUT: ${SESSION_TIMEOUT}
};`;

// Write the generated file
const outputPath = path.join(process.cwd(), "public", "env-config.js");
fs.writeFileSync(outputPath, content, "utf8");

console.log("✅ Environment configuration generated successfully");
console.log("Environment variables loaded:");
console.log(`- API_URL: ${API_URL}`);
console.log(`- SITE_NAME: ${SITE_NAME}`);
console.log(`- AUTH_ENABLED: ${AUTH_ENABLED}`);
console.log(
    `- SESSION_TIMEOUT: ${SESSION_TIMEOUT}ms (${parseInt(
        envVars.NEXT_PUBLIC_SESSION_TIMEOUT || "60",
        10
    )} minutes)`
);
