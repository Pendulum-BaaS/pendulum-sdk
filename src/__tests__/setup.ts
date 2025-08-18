import { jest } from '@jest/globals';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
} as Storage;

global.localStorage = localStorageMock;

// mock fetch for SSE connections
global.fetch = jest.fn() as any;

class MockEventSource {
  constructor(public url: string) {}
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
  close = jest.fn();
  onopen = jest.fn();
  onmessage = jest.fn();
  onerror = jest.fn();  
}

global.EventSource = MockEventSource as any;

// mock console to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

jest.mock('axios', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  }
}));

beforeEach(() => {
  jest.clearAllMocks();
});
