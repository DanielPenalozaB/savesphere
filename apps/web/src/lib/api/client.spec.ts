import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './client.js';
import {
  mockApiResponse,
  mockApiError,
  mockNetworkError,
  mockNonJsonError
} from '../../__tests__/mocks/api.js';

const mockLogout = vi.fn();

vi.mock('$lib/auth.svelte.js', () => {
  return {
    authState: {
      logout: () => mockLogout()
    }
  };
});

describe('api client', () => {
  let fetchMock: Mock;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    mockLogout.mockClear();
  });

  describe('apiGet', () => {
    it('returns data on successful response', async () => {
      fetchMock.mockResolvedValue(mockApiResponse({ id: 1 }));
      const result = await apiGet<{ id: number }>('/test');
      expect(result.data).toEqual({ id: 1 });
      expect(result.status).toBe(200);
      expect(result.error).toBeUndefined();
    });

    it('sends correct headers and credentials', async () => {
      fetchMock.mockResolvedValue(mockApiResponse({}));
      await apiGet('/test');
      expect(fetchMock).toHaveBeenCalledWith('/api/test', {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
    });

    it('returns error on API failure response', async () => {
      fetchMock.mockResolvedValue(mockApiError('Bad request', 400));
      const result = await apiGet('/test');
      expect(result.error).toBe('Bad request');
      expect(result.status).toBe(400);
      expect(result.data).toBeUndefined();
    });

    it('throws when response json parsing fails', async () => {
      fetchMock.mockResolvedValue(mockNonJsonError(500));
      await expect(apiGet('/test')).rejects.toThrow(SyntaxError);
    });

    it('propagates network failure as thrown error', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));
      await expect(apiGet('/test')).rejects.toThrow('Network error');
    });

    it('triggers logout on 401', async () => {
      fetchMock.mockResolvedValue(mockApiError('Unauthorized', 401));
      await apiGet('/test');
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('treats missing success field as error', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ message: 'ok' })
      } as Response);
      const result = await apiGet('/test');
      expect(result.error).toBeDefined();
    });
  });

  describe('apiPost', () => {
    it('returns data on successful POST', async () => {
      fetchMock.mockResolvedValue(mockApiResponse({ created: true }, 201));
      const result = await apiPost('/test', { name: 'foo' });
      expect(result.data).toEqual({ created: true });
      expect(result.status).toBe(201);
    });

    it('sends correct method, body, headers', async () => {
      fetchMock.mockResolvedValue(mockApiResponse({}));
      await apiPost('/test', { key: 'value' });
      expect(fetchMock).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'value' }),
        credentials: 'include'
      });
    });

    it('returns error on 409 conflict', async () => {
      fetchMock.mockResolvedValue(mockApiError('Conflict', 409));
      const result = await apiPost('/test', {});
      expect(result.error).toBe('Conflict');
      expect(result.status).toBe(409);
    });

    it('triggers logout on 401', async () => {
      fetchMock.mockResolvedValue(mockApiError('Unauthorized', 401));
      await apiPost('/test', {});
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('apiPut', () => {
    it('uses PUT method', async () => {
      fetchMock.mockResolvedValue(mockApiResponse({ updated: true }));
      await apiPut('/test/1', { name: 'bar' });
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/test/1',
        expect.objectContaining({ method: 'PUT' })
      );
    });

    it('returns data on success', async () => {
      fetchMock.mockResolvedValue(mockApiResponse({ updated: true }));
      const result = await apiPut('/test/1', {});
      expect(result.data).toEqual({ updated: true });
    });

    it('triggers logout on 401', async () => {
      fetchMock.mockResolvedValue(mockApiError('Unauthorized', 401));
      await apiPut('/test/1', {});
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('apiPatch', () => {
    it('uses PATCH method', async () => {
      fetchMock.mockResolvedValue(mockApiResponse({ patched: true }));
      await apiPatch('/test/1', { field: 'value' });
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/test/1',
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('triggers logout on 401', async () => {
      fetchMock.mockResolvedValue(mockApiError('Unauthorized', 401));
      await apiPatch('/test/1', {});
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('apiDelete', () => {
    it('uses DELETE method', async () => {
      fetchMock.mockResolvedValue(mockApiResponse({ deleted: true }));
      await apiDelete('/test/1');
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/test/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('triggers logout on 401', async () => {
      fetchMock.mockResolvedValue(mockApiError('Unauthorized', 401));
      await apiDelete('/test/1');
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('all methods', () => {
    it('include credentials and Content-Type header', async () => {
      fetchMock.mockResolvedValue(mockApiResponse({}));

      await apiGet('/a');
      await apiPost('/b', {});
      await apiPut('/c', {});
      await apiPatch('/d', {});
      await apiDelete('/e');

      for (const call of fetchMock.mock.calls) {
        const options = call[1] as RequestInit;
        expect(options.credentials).toBe('include');
        expect(options.headers).toEqual(
          expect.objectContaining({ 'Content-Type': 'application/json' })
        );
      }
    });
  });
});
