/**
 * API Interceptors para manejo centralizado de autenticación
 */

export interface InterceptorOptions {
  excludeAuth?: boolean; // Si true, no agregar headers de autenticación
  customHeaders?: Record<string, string>; // Headers adicionales personalizados
}

/**
 * Interceptor que agrega JWT token y partition key automáticamente
 * a las peticiones HTTP, excepto para endpoints específicos que no los necesitan
 */
export const addJwtPk = (url: string, options: RequestInit & InterceptorOptions = {}): RequestInit => {
  const { excludeAuth = false, customHeaders = {}, ...fetchOptions } = options;
  
  // Lista de endpoints que NO deben usar autenticación JWT
  const excludedEndpoints = [
    '/identity/customers', // Token endpoint
    '/identity/v2/customers', // Customer endpoint
    '/partition_keys', // Partition keys endpoint
    '/organizations', // Organization endpoint (some variations)
  ];
  
  // Verificar si el URL debe ser excluido de autenticación
  const shouldExcludeAuth = excludeAuth || excludedEndpoints.some(endpoint => url.includes(endpoint));
  
  // Preparar headers base
  const headers = new Headers(fetchOptions.headers);
  
  // Agregar headers personalizados
  Object.entries(customHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  // Solo agregar autenticación si no está excluida
  if (!shouldExcludeAuth) {
    // Obtener tokens del localStorage
    const jwt = localStorage.getItem('jwt') || localStorage.getItem('id_token');
    const partitionKey = localStorage.getItem('partition_key');
    
    // Agregar JWT token si está disponible
    if (jwt) {
      headers.set('authorization', `Bearer ${jwt}`);
    }
    
    // Agregar partition key si está disponible
    if (partitionKey) {
      headers.set('_partitionkey', partitionKey);
      headers.set('bt-organization', partitionKey);
      headers.set('bt-uid', partitionKey);
      headers.set('organization_id', partitionKey);
      headers.set('pk-organization', partitionKey);
    }
    
    // Headers adicionales comunes para APIs autenticadas
    if (!headers.has('accept')) {
      headers.set('accept', '*/*');
    }
    if (!headers.has('accept-language')) {
      headers.set('accept-language', 'es-419,es;q=0.9');
    }
    if (!headers.has('origin')) {
      headers.set('origin', 'https://contracts-develop.grainchain.io');
    }
    if (!headers.has('referer')) {
      headers.set('referer', 'https://contracts-develop.grainchain.io/');
    }
    if (!headers.has('sec-fetch-dest')) {
      headers.set('sec-fetch-dest', 'empty');
    }
    if (!headers.has('sec-fetch-mode')) {
      headers.set('sec-fetch-mode', 'cors');
    }
    if (!headers.has('sec-fetch-site')) {
      headers.set('sec-fetch-site', 'same-site');
    }
    if (!headers.has('user-agent')) {
      headers.set('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36');
    }
  }
  
  return {
    ...fetchOptions,
    headers
  };
};

/**
 * Wrapper de fetch que aplica automáticamente el interceptor addJwtPk
 */
export const authenticatedFetch = (url: string, options: RequestInit & InterceptorOptions = {}): Promise<Response> => {
  const interceptedOptions = addJwtPk(url, options);
  return fetch(url, interceptedOptions);
};

/**
 * Fetch sin autenticación para endpoints públicos
 */
export const publicFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
  return fetch(url, { excludeAuth: true, ...options } as RequestInit & InterceptorOptions);
};

/**
 * Utilitie para verificar si hay tokens de autenticación disponibles
 */
export const hasAuthTokens = (): { hasJwt: boolean; hasPartition: boolean; isAuthenticated: boolean } => {
  const jwt = localStorage.getItem('jwt') || localStorage.getItem('id_token');
  const partitionKey = localStorage.getItem('partition_key');
  
  return {
    hasJwt: !!jwt,
    hasPartition: !!partitionKey,
    isAuthenticated: !!jwt && !!partitionKey
  };
};

export default {
  addJwtPk,
  authenticatedFetch,
  publicFetch,
  hasAuthTokens
};