import axios from "axios";
import { DatabaseResult } from "src/types";
import { PendingOperationsManager } from "src/pendingOperationsManager";

export class Database {
  private baseUrl: string;
  private getAuthHeaders: () => Record<string, string>;
  private pendingOpsManager: PendingOperationsManager;


  constructor(
    appUrl: string,
    getAuthHeaders: () => Record<string, string> = () => ({}),
    pendingOpsManager: PendingOperationsManager
  ) {
    this.baseUrl = `${appUrl}/api`;
    this.getAuthHeaders = getAuthHeaders;
    this.pendingOpsManager = pendingOpsManager;
  }

// READ OPERATIONS
  async getOne<T = any>(
    collection: string,
    id: string,
  ): Promise<DatabaseResult<T>> {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}`, {
        params: { collection },
      });
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to fetch record";
        return { success: false, error: message };
      }
      throw error;
    }
  }

  async getSome<T = any>(
    collection: string,
    limit: number = 10,
    offset: number = 0,
    sortKey: string,
    ids?: string[],
  ): Promise<DatabaseResult<T>> {
    try {
      const params: any = { collection, limit, offset, sortKey };

      if (Array.isArray(ids) && ids.length > 0) {
        params.ids = ids.map((id) => id.trim()).join(",");
      }

      const response = await axios.get(`${this.baseUrl}/some`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to fetch records";
        return { success: false, error: message };
      }
      throw error;
    }
  }

  async getAll<T = any>(collection: string): Promise<DatabaseResult<T>> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: { collection },
      });
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to fetch records";
        return { success: false, error: message };
      }
      throw error;
    }
  }

// CREATE OPERATIONS
  async insert<T = any>(
    collection: string,
    newItems: object[],
  ): Promise<DatabaseResult<T>> {
    const operationId = this.pendingOpsManager.generateOperationId();
    this.pendingOpsManager.addPendingOperation(operationId, collection, "insert");

    try {
      const response = await axios.post(
        this.baseUrl,
        { collection, newItems, operationId },
        { headers: this.getAuthHeaders() }
      );
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to insert data";
        return { success: false, error: message };
      }
      throw error;
    }
  }

// UPDATE OPERATIONS
  async updateOne<T = any>(
    collection: string,
    id: string,
    updateOperation: Record<string, any>,
  ): Promise<DatabaseResult<T>> {
    const operationId = this.pendingOpsManager.generateOperationId();
    this.pendingOpsManager.addPendingOperation(operationId, collection, "update");

    try {
      const response = await axios.patch(`${this.baseUrl}/${id}`,
        { collection, updateOperation, operationId },
        { headers: this.getAuthHeaders() }
      );
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to update record";
        return { success: false, error: message };
      }
      throw error;
    }
  }

  async updateSome<T = any>(
    collection: string,
    filter: Record<string, any>,
    updateOperation: Record<string, any>,
  ): Promise<DatabaseResult<T>> {
    const operationId = this.pendingOpsManager.generateOperationId();
    this.pendingOpsManager.addPendingOperation(operationId, collection, "update");

    try {
      const response = await axios.patch(`${this.baseUrl}/some`,
        { collection, filter, updateOperation, operationId },
        { headers: this.getAuthHeaders() }
      );
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to update records";
        return { success: false, error: message };
      }
      throw error;
    }
  }

  async updateAll<T = any>(
    collection: string,
    updateOperation: Record<string, any>,
  ): Promise<DatabaseResult<T>> {
    const operationId = this.pendingOpsManager.generateOperationId();
    this.pendingOpsManager.addPendingOperation(operationId, collection, "update");

    try {
      const response = await axios.patch(this.baseUrl,
        { collection, updateOperation, operationId },
        { headers: this.getAuthHeaders() }
      );
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to update records";
        return { success: false, error: message };
      }
      throw error;
    }
  }

  async replace<T = any>(
    collection: string,
    id: string,
    newItem: object,
  ): Promise<DatabaseResult<T>> {
    const operationId = this.pendingOpsManager.generateOperationId();
    this.pendingOpsManager.addPendingOperation(operationId, collection, "update");

    try {
      const response = await axios.put(`${this.baseUrl}/${id}`,
        { collection, newItem, operationId },
        { headers: this.getAuthHeaders() }
      );
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to replace record";
        return { success: false, error: message };
      }
      throw error;
    }
  }

// DELETE OPERATIONS
  async removeOne<T = any>(
    collection: string,
    id: string,
  ): Promise<DatabaseResult<T>> {
    const operationId = this.pendingOpsManager.generateOperationId();
    this.pendingOpsManager.addPendingOperation(operationId, collection, "delete");

    try {
      const response = await axios.delete(`${this.baseUrl}/${id}`,
        {
          params: { collection, operationId },
          headers: this.getAuthHeaders(),
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to delete record";
        return { success: false, error: message };
      }
      throw error;
    }
  }

  async removeSome<T = any>(
    collection: string,
    ids: string[],
  ): Promise<DatabaseResult<T>> {
    const operationId = this.pendingOpsManager.generateOperationId();
    this.pendingOpsManager.addPendingOperation(operationId, collection, "delete");

    try {
      if (ids.length === 0) {
        throw new Error("one or more ids required for removeSome");
      }

      const idsParam = ids.map((id) => id.trim()).join(",");
      const response = await axios.delete(`${this.baseUrl}/some`,
        {
          params: { collection, ids: idsParam, operationId },
          headers: this.getAuthHeaders(),
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to delete records";
        return { success: false, error: message };
      }
      throw error;
    }
  }

  async removeAll<T = any>(collection: string): Promise<DatabaseResult<T>> {
    const operationId = this.pendingOpsManager.generateOperationId();
    this.pendingOpsManager.addPendingOperation(operationId, collection, "delete");

    try {
      const response = await axios.delete(this.baseUrl,
        {
          params: { collection, operationId },
          headers: this.getAuthHeaders(),
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to delete records";
        return { success: false, error: message };
      }
      throw error;
    }
  }
}
