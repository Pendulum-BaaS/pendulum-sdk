import { Database } from '../db/db';
import { PendingOperationsManager } from '../pendingOperationsManager';
import axios from 'axios';

// use the existing axios mock from setup.ts
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../pendingOperationsManager');
const MockedPendingOpsManager = PendingOperationsManager as jest.MockedClass<typeof PendingOperationsManager>;

describe('Database - Happy Path', () => {
  let database: Database;
  let mockPendingOpsManager: jest.Mocked<PendingOperationsManager>;
  let mockGetAuthHeaders: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGetAuthHeaders = jest.fn(() => ({ Authorization: 'Bearer test-token' }));
    
    mockPendingOpsManager = {
      generateOperationId: jest.fn(() => 'op-123'),
      addPendingOperation: jest.fn(),
    } as any;
    MockedPendingOpsManager.mockImplementation(() => mockPendingOpsManager);
    
    // setup axios mocks
    mockedAxios.get = jest.fn();
    mockedAxios.post = jest.fn();
    mockedAxios.patch = jest.fn();
    mockedAxios.put = jest.fn();
    mockedAxios.delete = jest.fn();
    (mockedAxios.isAxiosError as any) = jest.fn();
    
    database = new Database('/pendulum', mockGetAuthHeaders, mockPendingOpsManager);
  });

  describe('Read Operations', () => {
    it('successfully gets a single record', async () => {
      const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
      (mockedAxios.get as jest.Mock).mockResolvedValue({ data: mockUser });

      const result = await database.getOne('users', '1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(mockedAxios.get).toHaveBeenCalledWith('/pendulum/api/1', {
        params: { collection: 'users' }
      });
    });

    it('successfully gets multiple records with pagination', async () => {
      const mockUsers = [
        { id: '1', name: 'John Doe' },
        { id: '2', name: 'Jane Smith' }
      ];
      (mockedAxios.get as jest.Mock).mockResolvedValue({ data: mockUsers });

      const result = await database.getSome('users', 10, 0, 'name');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUsers);
      expect(mockedAxios.get).toHaveBeenCalledWith('/pendulum/api/some', {
        params: { collection: 'users', limit: 10, offset: 0, sortKey: 'name' }
      });
    });

    it('successfully gets all records from a collection', async () => {
      const mockUsers = [
        { id: '1', name: 'John Doe' },
        { id: '2', name: 'Jane Smith' },
        { id: '3', name: 'Bob Johnson' }
      ];
      (mockedAxios.get as jest.Mock).mockResolvedValue({ data: mockUsers });

      const result = await database.getAll('users');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUsers);
      expect(mockedAxios.get).toHaveBeenCalledWith('/pendulum/api', {
        params: { collection: 'users' }
      });
    });
  });

  describe('Create Operations', () => {
    it('successfully inserts new records', async () => {
      const newUsers = [
        { name: 'Alice Cooper', email: 'alice@example.com' },
        { name: 'Bob Wilson', email: 'bob@example.com' }
      ];
      const mockResponse = { insertedIds: ['1', '2'], count: 2 };
      (mockedAxios.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await database.insert('users', newUsers);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith('/pendulum/api', {
        collection: 'users',
        newItems: newUsers,
        operationId: 'op-123'
      }, {
        headers: { Authorization: 'Bearer test-token' }
      });
      expect(mockPendingOpsManager.addPendingOperation).toHaveBeenCalledWith('op-123', 'users', 'insert');
    });
  });

  describe('Update Operations', () => {
    it('successfully updates a single record', async () => {
      const updateData = { name: 'John Updated' };
      const mockResponse = { modifiedCount: 1, matchedCount: 1 };
      (mockedAxios.patch as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await database.updateOne('users', '1', updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedAxios.patch).toHaveBeenCalledWith('/pendulum/api/1', {
        collection: 'users',
        updateOperation: updateData,
        operationId: 'op-123'
      }, {
        headers: { Authorization: 'Bearer test-token' }
      });
    });

    it('successfully replaces a record completely', async () => {
      const newData = { name: 'Completely New User', email: 'new@example.com' };
      const mockResponse = { modifiedCount: 1, upsertedId: null };
      (mockedAxios.put as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await database.replace('users', '1', newData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedAxios.put).toHaveBeenCalledWith('/pendulum/api/1', {
        collection: 'users',
        newItem: newData,
        operationId: 'op-123'
      }, {
        headers: { Authorization: 'Bearer test-token' }
      });
    });
  });

  describe('Delete Operations', () => {
    it('successfully deletes a single record', async () => {
      const mockResponse = { deletedCount: 1 };
      (mockedAxios.delete as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await database.removeOne('users', '1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedAxios.delete).toHaveBeenCalledWith('/pendulum/api/1', {
        params: { collection: 'users', operationId: 'op-123' },
        headers: { Authorization: 'Bearer test-token' }
      });
    });

    it('successfully deletes multiple records', async () => {
      const idsToDelete = ['1', '2', '3'];
      const mockResponse = { deletedCount: 3 };
      (mockedAxios.delete as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await database.removeSome('users', idsToDelete);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedAxios.delete).toHaveBeenCalledWith('/pendulum/api/some', {
        params: { collection: 'users', ids: '1,2,3', operationId: 'op-123' },
        headers: { Authorization: 'Bearer test-token' }
      });
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const errorResponse = {
        response: {
          data: { message: 'Collection not found' }
        }
      };
      (mockedAxios.get as jest.Mock).mockRejectedValue(errorResponse);
      (mockedAxios.isAxiosError as any).mockReturnValue(true);

      const result = await database.getOne('nonexistent', '1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Collection not found');
    });

    it('handles axios errors without response data', async () => {
      const axiosError = {
        response: { data: {} }
      };
      (mockedAxios.get as jest.Mock).mockRejectedValue(axiosError);
      (mockedAxios.isAxiosError as any).mockReturnValue(true);

      const result = await database.getAll('users');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch records');
    });
  });
});
