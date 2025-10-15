/**
 * Helper function to make Adobe Target API requests
 */
import https from 'https';

export async function makeTargetRequest(config, method, path, body = null, apiVersion = 'v1') {
  if (!config.tenantId || !config.apiKey || !config.accessToken) {
    throw new Error('Adobe Target API credentials not configured. Please set TARGET_TENANT_ID, TARGET_API_KEY, and TARGET_ACCESS_TOKEN environment variables.');
  }

  // API version is now passed as a parameter (defaults to v1 for backward compatibility)

  const headers = {
    'Authorization': `Bearer ${config.accessToken}`,
    'X-Api-Key': config.apiKey,
    'Accept': `application/vnd.adobe.target.${apiVersion}+json`,
  };

  // Only add Content-Type for requests with a body (POST, PUT, PATCH)
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    // Use Adobe-specific content type matching the API version
    headers['Content-Type'] = `application/vnd.adobe.target.${apiVersion}+json`;
  }

  const options = {
    hostname: 'mc.adobe.io',
    path: `/${config.tenantId}${path}`,
    method: method,
    headers: headers,
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = data ? JSON.parse(data) : {};

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`API Error (${res.statusCode}): ${JSON.stringify(response)}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}
