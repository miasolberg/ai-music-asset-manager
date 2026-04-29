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
  const authStoreMock = {
    _isValid: false,
    _model: null as any,
    _token: '',
    get isValid() { return this._isValid; },
    set isValid(v: boolean) { this._isValid = v; },
    get model() { return this._model; },
    set model(v: any) { this._model = v; },
    get token() { return this._token; },
    set token(v: string) { this._token = v; },
    clear: vi.fn(),
    loadFromCookie: vi.fn(),
    onChange: vi.fn(() => () => {}),
  };

  const collectionMock: Record<string, any> = {
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
    authStore: typeof authStoreMock;
    collection: typeof collectionMock.collection;
    autoCancellation: any;
    files: any;
    url: string;

    constructor(url: string) {
      this.url = url;
      this.authStore = authStoreMock;
      this.collection = vi.fn(() => collectionMock);
      this.autoCancellation = vi.fn();
      this.files = {
        getUrl: vi.fn(
          (record: any, filename: string) =>
            `http://localhost:8090/api/files/${record.collectionId || 'test'}/${record.id}/${filename}`
        ),
      };
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
      (pb.authStore as any).isValid = false;
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true when authStore is valid', () => {
      (pb.authStore as any).isValid = true;
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when no user is set', () => {
      (pb.authStore as any).model = null;
      expect(getCurrentUser()).toBeNull();
    });

    it('returns user model when set', () => {
      const mockUser = { id: 'user1', email: 'test@test.com', name: 'Test User' };
      (pb.authStore as any).model = mockUser;
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
      (pb.authStore as any).token = '';
      expect(getAuthToken()).toBe('');
    });

    it('returns token when set', () => {
      (pb.authStore as any).token = 'my-auth-token';
      expect(getAuthToken()).toBe('my-auth-token');
    });
  });

  describe('authOptions', () => {
    it('returns authorization header with token', () => {
      (pb.authStore as any).token = 'my-auth-token';
      const options = authOptions();
      expect(options).toEqual({ Authorization: 'my-auth-token' });
    });

    it('returns empty string for token when not set', () => {
      (pb.authStore as any).token = '';
      const options = authOptions();
      expect(options).toEqual({ Authorization: '' });
    });
  });
});