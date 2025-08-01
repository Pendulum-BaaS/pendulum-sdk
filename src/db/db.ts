import axios from "axios";
import { DatabaseResult } from "src/types";

export class Database {
  private baseUrl: string;
  private getAuthHeaders: () => Record<string, string>;


  constructor(appUrl: string, getAuthHeaders: () => Record<string, string> = () => ({})) {
    this.baseUrl = `${appUrl}/api`;
    this.getAuthHeaders = getAuthHeaders
  }

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

  async insert<T = any>(
    collection: string,
    newItems: object[],
  ): Promise<DatabaseResult<T>> {
    try {
      const response = await axios.post(
        this.baseUrl,
        { collection, newItems },
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

  async updateOne<T = any>(
    collection: string,
    id: string,
    updateOperation: Record<string, any>,
  ): Promise<DatabaseResult<T>> {
    try {
      const response = await axios.patch(`${this.baseUrl}/${id}`,
        { collection, updateOperation },
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
    try {
      const response = await axios.patch(`${this.baseUrl}/some`,
        { collection, filter, updateOperation,},
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
    try {
      const response = await axios.patch(this.baseUrl,
        { collection, updateOperation, },
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
    try {
      const response = await axios.put(`${this.baseUrl}/${id}`,
        { collection, newItem },
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

  async removeOne<T = any>(
    collection: string,
    id: string,
  ): Promise<DatabaseResult<T>> {
    try {
      const response = await axios.delete(`${this.baseUrl}/${id}`,
        {
          params: { collection },
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
    try {
      if (ids.length === 0) {
        throw new Error("one or more ids required for removeSome");
      }

      const idsParam = ids.map((id) => id.trim()).join(",");
      const response = await axios.delete(`${this.baseUrl}/some`,
        {
          params: { collection, ids: idsParam },
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
    try {
      const response = await axios.delete(this.baseUrl,
        {
          params: { collection },
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
