import { DatabaseEvent } from "./types";

interface PendingOperation {
  collection: string;
  action: "insert" | "update" | "delete";
  timestamp: number;
}

export class PendingOperationsManager {
  private pendingOperations: Record<string, PendingOperation> = {};
  private readonly OPERATION_TIMEOUT = 30000; // 30 seconds
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupInterval();
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredOperations();
    }, 10000); // cleanup every 10 seconds
  }

  private cleanupExpiredOperations(): void {
    const now = Date.now();
    const eventsToRemove: string[] = [];

    Object.entries(this.pendingOperations).forEach(([id, operation]) => {
      if (now - operation.timestamp > this.OPERATION_TIMEOUT) {
        eventsToRemove.push(id);
      }
    });

    eventsToRemove.forEach(id => {
      delete this.pendingOperations[id];
      console.log(`Cleaned up expired event ${id}`);
    });

    if (eventsToRemove.length > 0) {
      console.log(`Cleaned up ${eventsToRemove.length} expired operations`);
    }
  }

  generateOperationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  addPendingOperation(
    operationId: string,
    collection: string,
    action: "insert" | "update" | "delete"
  ): void {
    const operation: PendingOperation = {
      collection,
      action,
      timestamp: Date.now(),
    }

    this.pendingOperations[operationId] = operation;
    console.log(`Added pending operation: ${operationId}: ${action} on ${collection}`);
  }

  shouldIgnoreEvent(event: DatabaseEvent): boolean {
    const currentOperation = this.pendingOperations[event.operationId];

    if (currentOperation) {
      delete this.pendingOperations[event.operationId];
      console.log(`Ignoring event ${event.operationId}; ` +
                  `operation ${event.action}: triggered by this client`);
      return true;
    }

    return false;
  }

  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.pendingOperations = {};
    console.log("PendingOperationsManager cleaned up");
  }

  getPendingCount(): number {
    return Object.keys(this.pendingOperations).length;
  }

  getPendingOperations(): PendingOperation[] {
    return Object.values(this.pendingOperations);
  }
}
