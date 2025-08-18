import { Auth } from '../auth/auth';
import axios from 'axios';

// use the existing axios mock from setup.ts
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Auth - Happy Path', () => {
  let auth: Auth;
  let mockGetAuthHeaders: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGetAuthHeaders = jest.fn(() => ({ Authorization: 'Bearer test-token' }));
    
    mockedAxios.post = jest.fn();
    (mockedAxios.isAxiosError as any) = jest.fn();
    
    auth = new Auth('/pendulum', mockGetAuthHeaders);
  });

  it('successfully registers a new user', async () => {
    (mockedAxios.post as jest.Mock).mockResolvedValue({ data: { success: true } });

    const result = await auth.register('johndoe', 'john@example.com', 'password123');

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(mockedAxios.post).toHaveBeenCalledWith('/pendulum/auth/register', {
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123'
    }, {
      headers: { Authorization: 'Bearer test-token' }
    });
  });

  it('successfully logs in with valid credentials', async () => {
    const mockResponse = {
      data: { userId: 'user123' }
    };
    (mockedAxios.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await auth.login('johndoe', 'password123');

    expect(result.success).toBe(true);
    expect(result.userId).toBe('user123');
    expect(result.error).toBeUndefined();
    expect(mockedAxios.post).toHaveBeenCalledWith('/pendulum/auth/login', {
      identifier: 'johndoe',
      password: 'password123'
    }, {
      headers: { Authorization: 'Bearer test-token' }
    });
  });

  it('handles login failure with invalid credentials', async () => {
    const errorResponse = {
      response: {
        data: { error: { message: 'Invalid credentials' } }
      }
    };
    (mockedAxios.post as jest.Mock).mockRejectedValue(errorResponse);
    (mockedAxios.isAxiosError as any).mockReturnValue(true);

    const result = await auth.login('wronguser', 'wrongpassword');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
    expect(result.userId).toBeUndefined();
  });

  it('successfully logs out', async () => {
    (mockedAxios.post as jest.Mock).mockResolvedValue({ data: { success: true } });

    const result = await auth.logout();

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(mockedAxios.post).toHaveBeenCalledWith('/pendulum/auth/logout', {}, {
      headers: { Authorization: 'Bearer test-token' }
    });
  });
});
