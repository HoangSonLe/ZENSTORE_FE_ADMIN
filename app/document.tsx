import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  // Get the asset prefix from the environment or config
  const assetPrefix = process.env.NODE_ENV === 'production' 
    ? 'https://client.zenstores.com.vn' 
    : '';

  return (
    <Html lang="en">
      <Head>
        {/* Add any additional meta tags or links here */}
      </Head>
      <body>
        <Main />
        <NextScript />
        {/* Add a script to fix chunk loading issues */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Fix for chunk loading errors
              window.__NEXT_ASSET_PREFIX__ = "${assetPrefix}";
              
              // Intercept and fix chunk loading errors
              window.addEventListener('error', function(event) {
                if (event.message && event.message.includes('ChunkLoadError')) {
                  console.warn('Chunk loading error detected, attempting to reload the page');
                  // Reload the page after a short delay
                  setTimeout(() => {
                    window.location.reload();
                  }, 2000);
                }
              });
            `,
          }}
        />
      </body>
    </Html>
  );
}
