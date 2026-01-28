/**
 * Base HTTP client for microservices communication
 */

import type {
  ApiResponse,
  ApiError,
  RequestOptions,
  HttpMethod,
  ApiClientConfig,
} from './types';

const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiClientError';
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
  }

  static fromResponse(status: number, body: unknown): ApiClientError {
    const error = body as Partial<ApiError>;
    return new ApiClientError({
      message: error.message || `Request failed with status ${status}`,
      code: error.code,
      details: error.details,
      status,
    });
  }

  static isUnauthorized(error: unknown): boolean {
    return error instanceof ApiClientError && error.status === 401;
  }

  static isForbidden(error: unknown): boolean {
    return error instanceof ApiClientError && error.status === 403;
  }

  static isNotFound(error: unknown): boolean {
    return error instanceof ApiClientError && error.status === 404;
  }
}

/**
 * Create base API client
 */
export function createApiClient(config: ApiClientConfig) {
  const {
    baseUrl,
    defaultHeaders = {},
    timeout = DEFAULT_TIMEOUT,
    onUnauthorized,
    getAccessToken,
    getOrganizationId,
  } = config;

  /**
   * Build URL with query params
   */
  function buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(path, baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Make HTTP request
   */
  async function request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const { headers: optionHeaders, params, signal, timeout: requestTimeout } = options;

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
      ...optionHeaders,
    };

    // Add auth token if available
    if (getAccessToken) {
      const token = await getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Add organization ID if available
    if (getOrganizationId) {
      const orgId = getOrganizationId();
      if (orgId) {
        headers['X-Organization-ID'] = orgId;
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      requestTimeout || timeout
    );

    try {
      const response = await fetch(buildUrl(path, params), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: signal || controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      let data: unknown;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle errors
      if (!response.ok) {
        if (response.status === 401 && onUnauthorized) {
          onUnauthorized();
        }
        throw ApiClientError.fromResponse(response.status, data);
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiClientError({
            message: 'Request timeout',
            code: 'TIMEOUT',
            status: 408,
          });
        }
        throw new ApiClientError({
          message: error.message,
          code: 'NETWORK_ERROR',
          status: 0,
        });
      }

      throw new ApiClientError({
        message: 'Unknown error',
        code: 'UNKNOWN',
        status: 0,
      });
    }
  }

  return {
    /**
     * GET request
     */
    get<T>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>('GET', path, undefined, options);
    },

    /**
     * POST request
     */
    post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return request<T>('POST', path, body, options);
    },

    /**
     * PUT request
     */
    put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return request<T>('PUT', path, body, options);
    },

    /**
     * PATCH request
     */
    patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return request<T>('PATCH', path, body, options);
    },

    /**
     * DELETE request
     */
    delete<T>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>('DELETE', path, undefined, options);
    },

    /**
     * Get base URL
     */
    getBaseUrl(): string {
      return baseUrl;
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
