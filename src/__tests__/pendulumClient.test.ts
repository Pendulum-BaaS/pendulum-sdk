import { PendulumClient } from '../pendulumClient';

describe('PendulumClient - Happy Path', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('initializes with all required services', () => {
    const client = new PendulumClient();
    
    expect(client.db).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.realtime).toBeDefined();
  });

  it('handles user authentication flow', () => {
    const client = new PendulumClient();
    const token = 'user-jwt-token-123';
    
    // user logs in
    client.setAuthToken(token);
    
    // user is authenticated and gets proper headers
    expect(client.isAuthenticated()).toBe(true);
    expect(client.isAdmin()).toBe(false);
    expect(client.getAuthHeaders()).toEqual({ Authorization: `Bearer ${token}` });
  });

  it('handles admin authentication flow', () => {
    const client = new PendulumClient();
    const adminKey = 'admin-secret-key-456';
    
    // admin logs in
    client.setAdminKey(adminKey);
    
    // admin is authenticated with admin privileges
    expect(client.isAuthenticated()).toBe(true);
    expect(client.isAdmin()).toBe(true);
    expect(client.getAuthHeaders()).toEqual({ Authorization: `Bearer ${adminKey}` });
  });

  it('handles logout flow', () => {
    const client = new PendulumClient();
    
    // user logs in first
    client.setAuthToken('some-token');
    expect(client.isAuthenticated()).toBe(true);
    
    // user logs out
    client.clearAuthToken();
    
    // user is no longer authenticated
    expect(client.isAuthenticated()).toBe(false);
    expect(client.getAuthHeaders()).toEqual({});
  });

  it('persists authentication across browser sessions', () => {
    // user logs in
    const client1 = new PendulumClient();
    const token = 'persistent-token-789';
    client1.setAuthToken(token);
    
    // browser refresh / new session
    const client2 = new PendulumClient();
    
    // user is still logged in
    expect(client2.getAuthToken()).toBe(token);
    expect(client2.isAuthenticated()).toBe(true);
  });
});
