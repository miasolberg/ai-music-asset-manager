import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock SvelteKit modules before anything else
vi.mock('$app/environment', () => ({
  browser: true,
}));

vi.mock('$env/dynamic/public', () => ({
  env: { PUBLIC_POCKETBASE_URL: 'http://localhost:8090' },
}));

// Mock PocketBase
vi.mock('pocketbase', () => {
  const authStore = {
    isValid: false,
    model: null,
    token: '',
    clear: vi.fn(),
    loadFromCookie: vi.fn(),
    onChange: vi.fn(() => () => {}),
  };

  const collectionMock = {
    getList: vi.fn(() => Promise.resolve({ items: [], totalItems: 0 })),
    getFullList: vi.fn(() => Promise.resolve([])),
    getOne: vi.fn(() => Promise.resolve({})),
    create: vi.fn(() => Promise.resolve({})),
    update: vi.fn(() => Promise.resolve({})),
    delete: vi.fn(() => Promise.resolve(true)),
    authWithPassword: vi.fn(() =>
      Promise.resolve({ token: 'test-token', record: { id: 'user1', email: 'test@test.com' } })
    ),
    authWithOAuth2: vi.fn(() => Promise.resolve({})),
  };

  class PocketBaseMock {
    authStore = authStore;
    collection = vi.fn(() => collectionMock);
    autoCancellation = vi.fn();
    files = {
      getUrl: vi.fn(
        (record, filename) =>
          `http://localhost:8090/api/files/${record.collectionId || 'test'}/${record.id}/${filename}`
      ),
    };

    constructor(url) {
      this.url = url;
    }
  }

  return { default: PocketBaseMock };
});

// Now import the module under test
import { pb, isAuthenticated, getCurrentUser, login, register, logout, getAuthToken, authOptions } from '$lib/pocketbase';

describe('PocketBase Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isAuthenticated', () => {
    it('returns false when authStore is not valid', () => {
      pb.authStore.isValid = false;
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true when authStore is valid', () => {
      pb.authStore.isValid = true;
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when no user is set', () => {
      pb.authStore.model = null;
      expect(getCurrentUser()).toBeNull();
    });

    it('returns user model when set', () => {
      const mockUser = { id: 'user1', email: 'test@test.com', name: 'Test User' };
      pb.authStore.model = mockUser;
      expect(getCurrentUser()).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('calls authWithPassword with email and password', async () => {
      const result = await login('test@test.com', 'password123');
      expect(pb.collection).toHaveBeenCalledWith('users');
      expect(result).toBeDefined();
    });
  });

  describe('register', () => {
    it('calls create with user data', async () => {
      const result = await register('test@test.com', 'password123', 'password123', 'Test User');
      expect(pb.collection).toHaveBeenCalledWith('users');
      expect(result).toBeDefined();
    });
  });

  describe('logout', () => {
    it('clears the auth store', () => {
      logout();
      expect(pb.authStore.clear).toHaveBeenCalled();
    });
  });

  describe('getAuthToken', () => {
    it('returns empty string when no token', () => {
      pb.authStore.token = '';
      expect(getAuthToken()).toBe('');
    });

    it('returns token when set', () => {
      pb.authStore.token = 'my-auth-token';
      expect(getAuthToken()).toBe('my-auth-token');
    });
  });

  describe('authOptions', () => {
    it('returns authorization header with token', () => {
      pb.authStore.token = 'my-auth-token';
      const options = authOptions();
      expect(options).toEqual({ Authorization: 'my-auth-token' });
    });

    it('returns empty string for token when not set', () => {
      pb.authStore.token = '';
      const options = authOptions();
      expect(options).toEqual({ Authorization: '' });
    });
  });
});