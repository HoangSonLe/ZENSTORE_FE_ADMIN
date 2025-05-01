// This script acts as a proxy for loading JavaScript chunks
// It helps avoid 403 errors when loading chunks with special characters in the path

(function() {
  // Store original fetch function
  const originalFetch = window.fetch;
  
  // Create a map to store loaded chunks
  window.__loadedChunks = {};
  
  // Function to encode chunk path for use in URL
  function encodeChunkPath(path) {
    return btoa(encodeURIComponent(path));
  }
  
  // Function to decode chunk path from URL
  function decodeChunkPath(encoded) {
    return decodeURIComponent(atob(encoded));
  }
  
  // Function to load a chunk via blob URL
  window.__loadChunkViaBlob = function(chunkPath) {
    return new Promise((resolve, reject) => {
      // Check if we already have this chunk
      if (window.__loadedChunks[chunkPath]) {
        console.log('Using cached chunk:', chunkPath);
        resolve(window.__loadedChunks[chunkPath]);
        return;
      }
      
      console.log('Loading chunk via blob:', chunkPath);
      
      // Try to load the chunk directly first
      originalFetch(chunkPath)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load chunk: ${response.status} ${response.statusText}`);
          }
          return response.text();
        })
        .then(code => {
          // Create a blob URL for the chunk
          const blob = new Blob([code], { type: 'application/javascript' });
          const blobUrl = URL.createObjectURL(blob);
          
          // Store the blob URL
          window.__loadedChunks[chunkPath] = blobUrl;
          
          // Return the blob URL
          resolve(blobUrl);
        })
        .catch(error => {
          console.error('Error loading chunk directly:', error);
          
          // If direct loading fails, try to load via a relative path
          const relativePath = chunkPath.startsWith('/') ? chunkPath.substring(1) : chunkPath;
          
          originalFetch(relativePath)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to load chunk via relative path: ${response.status} ${response.statusText}`);
              }
              return response.text();
            })
            .then(code => {
              // Create a blob URL for the chunk
              const blob = new Blob([code], { type: 'application/javascript' });
              const blobUrl = URL.createObjectURL(blob);
              
              // Store the blob URL
              window.__loadedChunks[chunkPath] = blobUrl;
              
              // Return the blob URL
              resolve(blobUrl);
            })
            .catch(finalError => {
              console.error('Error loading chunk via relative path:', finalError);
              reject(finalError);
            });
        });
    });
  };
  
  // Override fetch to intercept chunk requests
  window.fetch = function(url, options) {
    // Check if this is a chunk request
    if (typeof url === 'string' && url.includes('/_next/static/chunks/')) {
      // If it contains problematic characters like parentheses
      if (url.includes('(') || url.includes(')')) {
        console.log('Intercepting problematic chunk request:', url);
        
        // Load the chunk via blob
        return window.__loadChunkViaBlob(url)
          .then(blobUrl => {
            // Return a mock response with the blob URL
            return new Response(
              `// Chunk loaded via blob
              import * as chunk from "${blobUrl}";
              export * from "${blobUrl}";
              export { chunk as default };`,
              {
                status: 200,
                headers: new Headers({
                  'Content-Type': 'application/javascript'
                })
              }
            );
          })
          .catch(error => {
            console.error('Failed to load chunk via blob:', error);
            return Promise.reject(error);
          });
      }
    }
    
    // For all other requests, use the original fetch
    return originalFetch(url, options);
  };
  
  // Override importScripts for web workers
  if (typeof importScripts === 'function') {
    const originalImportScripts = importScripts;
    self.importScripts = function(...urls) {
      const newUrls = urls.map(url => {
        if (typeof url === 'string' && url.includes('/_next/static/chunks/') && (url.includes('(') || url.includes(')'))) {
          return window.__loadChunkViaBlob(url);
        }
        return url;
      });
      
      return originalImportScripts.apply(this, newUrls);
    };
  }
  
  // Patch script loading
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.apply(document, arguments);
    
    if (tagName.toLowerCase() === 'script') {
      const originalSetAttribute = element.setAttribute;
      
      element.setAttribute = function(name, value) {
        if (name === 'src' && 
            typeof value === 'string' && 
            value.includes('/_next/static/chunks/') &&
            (value.includes('(') || value.includes(')'))) {
          
          console.log('Intercepting problematic script src:', value);
          
          // Don't set the src attribute yet
          const originalSrc = value;
          
          // Load the chunk via blob
          window.__loadChunkViaBlob(originalSrc)
            .then(blobUrl => {
              console.log('Setting script src to blob URL:', blobUrl);
              originalSetAttribute.call(this, 'src', blobUrl);
            })
            .catch(error => {
              console.error('Failed to load script via blob:', error);
              // Try with the original src as a fallback
              originalSetAttribute.call(this, 'src', originalSrc);
            });
          
          return;
        }
        
        return originalSetAttribute.call(this, name, value);
      };
    }
    
    return element;
  };
  
  console.log('Chunk proxy initialized');
})();
