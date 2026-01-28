/**
 * Microservices configuration
 */

const getEnvVar = (key: string, fallback: string): string => {
  if (typeof window === 'undefined') {
    return process.env[key] || fallback;
  }
  return (process.env[key] as string) || fallback;
};

export const SERVICES = {
  AUTH: getEnvVar('NEXT_PUBLIC_AUTH_SERVICE_URL', 'http://localhost:8001'),
  JOURNEY: getEnvVar('NEXT_PUBLIC_JOURNEY_SERVICE_URL', 'http://localhost:8002'),
  AI: getEnvVar('NEXT_PUBLIC_AI_SERVICE_URL', 'http://localhost:8003'),
  WEBHOOK: getEnvVar('NEXT_PUBLIC_WEBHOOK_SERVICE_URL', 'http://localhost:8004'),
} as const;

export type ServiceName = keyof typeof SERVICES;

/**
 * Get service base URL
 */
export function getServiceUrl(service: ServiceName): string {
  return SERVICES[service];
}

/**
 * Build full endpoint URL
 */
export function buildEndpoint(service: ServiceName, path: string): string {
  const baseUrl = getServiceUrl(service);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
