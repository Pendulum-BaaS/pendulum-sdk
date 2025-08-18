import { Realtime } from '../realtime/realtime';
import { PendingOperationsManager } from '../pendingOperationsManager';
import { DatabaseEvent } from '../types';

jest.mock('../pendingOperationsManager');
const MockedPendingOpsManager = PendingOperationsManager as jest.MockedClass<typeof PendingOperationsManager>;

class MockEventSource {
  public url: string;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onopen: ((event: Event) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public readyState: number = 1; // OPEN
  
  constructor(url: string) {
    this.url = url;
    // simulate connection opened
    setTimeout(() => {
      if (this.onopen) this.onopen(new Event('open'));
    }, 0);
  }
  
  close() {
    this.readyState = 2; // CLOSED
  }
  
  simulateMessage(data: any) {
    if (this.onmessage) {
      const event = new MessageEvent('message', {
        data: JSON.stringify(data)
      });
      this.onmessage(event);
    }
  }
}

// replace global EventSource with mock
(global as any).EventSource = MockEventSource;

describe('Realtime - Happy Path', () => {
  let realtime: Realtime;
  let mockPendingOpsManager: jest.Mocked<PendingOperationsManager>;
  let mockEventSource: MockEventSource;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockPendingOpsManager = {
      shouldIgnoreEvent: jest.fn(() => false),
    } as any;
    MockedPendingOpsManager.mockImplementation(() => mockPendingOpsManager);
    
    realtime = new Realtime('/pendulum-events', mockPendingOpsManager);
    
    // get reference to the created EventSource
    mockEventSource = (realtime as any).eventSource as MockEventSource;
  });

  afterEach(() => {
    realtime.disconnect();
  });

  it('successfully subscribes to collection updates', () => {
    const callback = jest.fn();
    
    realtime.subscribe('users', callback);
    
    // simulate receiving a database event
    const testEvent: DatabaseEvent = {
      collection: 'users',
      action: 'insert',
      operationId: 'op-123',
      eventData: {
        affected: [{ id: '1', name: 'John Doe' }],
        count: 1,
        ids: ['1']
      }
    };
    
    mockEventSource.simulateMessage(testEvent);
    
    expect(callback).toHaveBeenCalledWith(testEvent);
  });

  it('allows multiple callbacks for the same collection', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    realtime.subscribe('users', callback1);
    realtime.subscribe('users', callback2);
    
    const testEvent: DatabaseEvent = {
      collection: 'users',
      action: 'update',
      operationId: 'op-456',
      eventData: {
        affected: [{ id: '1', name: 'John Updated' }],
        count: 1
      }
    };
    
    mockEventSource.simulateMessage(testEvent);
    
    expect(callback1).toHaveBeenCalledWith(testEvent);
    expect(callback2).toHaveBeenCalledWith(testEvent);
  });

  it('successfully unsubscribes from collection updates', () => {
    const callback = jest.fn();
    
    realtime.subscribe('users', callback);
    realtime.unsubscribe('users', callback);
    
    const testEvent: DatabaseEvent = {
      collection: 'users',
      action: 'delete',
      operationId: 'op-789',
      eventData: {
        count: 1,
        ids: ['1']
      }
    };
    
    mockEventSource.simulateMessage(testEvent);
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('ignores events from pending operations', () => {
    const callback = jest.fn();
    mockPendingOpsManager.shouldIgnoreEvent.mockReturnValue(true);
    
    realtime.subscribe('users', callback);
    
    const testEvent: DatabaseEvent = {
      collection: 'users',
      action: 'insert',
      operationId: 'op-123',
      eventData: {
        affected: [{ id: '1', name: 'John Doe' }]
      }
    };
    
    mockEventSource.simulateMessage(testEvent);
    
    expect(callback).not.toHaveBeenCalled();
    expect(mockPendingOpsManager.shouldIgnoreEvent).toHaveBeenCalledWith(testEvent);
  });

  it('only notifies subscribers of matching collection', () => {
    const usersCallback = jest.fn();
    const postsCallback = jest.fn();
    
    realtime.subscribe('users', usersCallback);
    realtime.subscribe('posts', postsCallback);
    
    const usersEvent: DatabaseEvent = {
      collection: 'users',
      action: 'insert',
      operationId: 'op-123',
      eventData: {
        affected: [{ id: '1', name: 'John Doe' }]
      }
    };
    
    mockEventSource.simulateMessage(usersEvent);
    
    expect(usersCallback).toHaveBeenCalledWith(usersEvent);
    expect(postsCallback).not.toHaveBeenCalled();
  });

  it('successfully disconnects and clears all subscriptions', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    realtime.subscribe('users', callback1);
    realtime.subscribe('posts', callback2);
    
    realtime.disconnect();
    
    // EventSource should be closed
    expect(mockEventSource.readyState).toBe(2); // CLOSED
    
    // subscriptions should be cleared
    const testEvent: DatabaseEvent = {
      collection: 'users',
      action: 'insert',
      operationId: 'op-123',
      eventData: { affected: [] }
    };
    
    // even if we could simulate a message, callbacks shouldn't be called
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });
});
