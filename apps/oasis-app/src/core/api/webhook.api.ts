/**
 * Webhook Service API Client (Port 8004)
 */

import { createApiClient, type ApiClient } from './client';
import { SERVICES } from '@/core/config/services';
import type { PaginatedResponse, PaginationParams } from './types';

// ============================================================================
// Types
// ============================================================================

export type WebhookProvider = 'typeform' | 'stripe' | 'calendly' | 'custom';

export type WebhookEventStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface WebhookEvent {
  id: string;
  provider: WebhookProvider;
  event_type: string;
  payload: Record<string, unknown>;
  status: WebhookEventStatus;
  error_message?: string;
  processed_at?: string;
  created_at: string;
}

export interface WebhookProviderConfig {
  provider: WebhookProvider;
  is_enabled: boolean;
  webhook_url: string;
  secret_configured: boolean;
  last_event_at?: string;
  events_count: number;
}

export interface WebhookEventFilters extends PaginationParams {
  provider?: WebhookProvider;
  status?: WebhookEventStatus;
  event_type?: string;
  from_date?: string;
  to_date?: string;
}

export interface TypeformResponseData {
  form_id: string;
  response_id: string;
  submitted_at: string;
  answers: Array<{
    field_id: string;
    type: string;
    value: unknown;
  }>;
  hidden_fields?: Record<string, string>;
  calculated_score?: number;
}

// ============================================================================
// Webhook API Client
// ============================================================================

export function createWebhookApi(
  getAccessToken?: () => Promise<string | null>,
  getOrganizationId?: () => string | null,
  onUnauthorized?: () => void
) {
  const client = createApiClient({
    baseUrl: SERVICES.WEBHOOK,
    getAccessToken,
    getOrganizationId,
    onUnauthorized,
  });

  return {
    // ========================================================================
    // Provider Configuration
    // ========================================================================

    /**
     * Get all webhook providers status
     */
    getProviders(): Promise<WebhookProviderConfig[]> {
      return client.get<WebhookProviderConfig[]>('/webhooks/providers');
    },

    /**
     * Get specific provider config
     */
    getProvider(provider: WebhookProvider): Promise<WebhookProviderConfig> {
      return client.get<WebhookProviderConfig>(`/webhooks/providers/${provider}`);
    },

    /**
     * Update provider configuration
     */
    updateProvider(
      provider: WebhookProvider,
      data: {
        is_enabled?: boolean;
        secret?: string;
      }
    ): Promise<WebhookProviderConfig> {
      return client.patch<WebhookProviderConfig>(
        `/webhooks/providers/${provider}`,
        data
      );
    },

    // ========================================================================
    // Webhook Events
    // ========================================================================

    /**
     * Get webhook events (for monitoring)
     */
    getEvents(
      filters?: WebhookEventFilters
    ): Promise<PaginatedResponse<WebhookEvent>> {
      return client.get<PaginatedResponse<WebhookEvent>>('/webhooks/events', {
        params: filters as Record<string, string | number | boolean | undefined>,
      });
    },

    /**
     * Get single event details
     */
    getEvent(eventId: string): Promise<WebhookEvent> {
      return client.get<WebhookEvent>(`/webhooks/events/${eventId}`);
    },

    /**
     * Retry failed event
     */
    retryEvent(eventId: string): Promise<WebhookEvent> {
      return client.post<WebhookEvent>(`/webhooks/events/${eventId}/retry`);
    },

    // ========================================================================
    // Typeform Integration
    // ========================================================================

    /**
     * Get Typeform webhook endpoint (for setup instructions)
     */
    getTypeformWebhookUrl(): string {
      return `${SERVICES.WEBHOOK}/webhooks/typeform`;
    },

    /**
     * Get Typeform events
     */
    getTypeformEvents(
      filters?: Omit<WebhookEventFilters, 'provider'>
    ): Promise<PaginatedResponse<WebhookEvent>> {
      return client.get<PaginatedResponse<WebhookEvent>>('/webhooks/events', {
        params: {
          ...filters,
          provider: 'typeform',
        } as Record<string, string | number | boolean | undefined>,
      });
    },

    /**
     * Map Typeform form to journey step
     */
    mapTypeformToStep(data: {
      typeform_id: string;
      journey_id: string;
      step_id: string;
    }): Promise<{ message: string }> {
      return client.post<{ message: string }>('/webhooks/typeform/mapping', data);
    },

    /**
     * Get Typeform mappings
     */
    getTypeformMappings(): Promise<
      Array<{
        typeform_id: string;
        journey_id: string;
        step_id: string;
        journey_title: string;
        step_title: string;
      }>
    > {
      return client.get('/webhooks/typeform/mappings');
    },

    /**
     * Remove Typeform mapping
     */
    removeTypeformMapping(typeformId: string): Promise<void> {
      return client.delete<void>(`/webhooks/typeform/mappings/${typeformId}`);
    },

    // ========================================================================
    // Health & Stats
    // ========================================================================

    /**
     * Get webhook service health
     */
    getHealth(): Promise<{
      status: 'healthy' | 'degraded' | 'unhealthy';
      providers: Record<WebhookProvider, boolean>;
      pending_events: number;
      failed_events_24h: number;
    }> {
      return client.get('/health');
    },

    /**
     * Get webhook statistics
     */
    getStats(period: 'day' | 'week' | 'month' = 'week'): Promise<{
      total_events: number;
      by_provider: Record<WebhookProvider, number>;
      by_status: Record<WebhookEventStatus, number>;
      success_rate: number;
    }> {
      return client.get('/webhooks/stats', { params: { period } });
    },

    // ========================================================================
    // Utility
    // ========================================================================

    /**
     * Get raw client for custom requests
     */
    getClient(): ApiClient {
      return client;
    },
  };
}

export type WebhookApi = ReturnType<typeof createWebhookApi>;
