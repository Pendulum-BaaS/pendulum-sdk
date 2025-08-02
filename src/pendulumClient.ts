import axios from "axios";
import { Database } from "./db";
import { Auth } from "./auth";
import { Realtime } from "./realtime";

export class PendulumClient {
  private appUrl: string;
  private eventsUrl: string;
  private permissionsUrl: string;
  private authToken: string | null = null;
  private adminKey: string | null = null;
  public db: Database;
  public auth: Auth;
  public realtime?: Realtime;

  constructor(enableRealtime?: boolean) {
    this.appUrl = "/pendulum";
    this.eventsUrl = "/pendulum-events";
    this.permissionsUrl = `${this.appUrl}/permissions`;

    this.authToken = this.getStoredAuthToken();
    this.adminKey = this.getStoredAdminKey();

    this.db = new Database(this.appUrl, () => this.getAuthHeaders());
    this.auth = new Auth(this.appUrl, () => this.getAuthHeaders());
    if (enableRealtime) {
      this.realtime = new Realtime(this.eventsUrl);
    }
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem("pendulum_auth_token", token);
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem("pendulum_auth_token");
  }

  setAdminKey(key: string): void {
    this.adminKey = key;
    localStorage.setItem("pendulum_admin_key", key);
  }

  getAdminKey(): string | null {
    return this.adminKey;
  }

  clearAdminKey(): void {
    this.adminKey = null;
    localStorage.removeItem("pendulum_admin_key");
  }

  isAuthenticated(): boolean {
    return !!this.authToken || !!this.adminKey;
  }

  isAdmin(): boolean {
    return !!this.adminKey;
  }

  private getStoredAuthToken(): string | null {
    try {
      return localStorage.getItem("pendulum_auth_token");
    } catch (error) {
      console.warn("Failed to retrieve auth token from localStorage:", error);
      return null;
    }
  }

  private getStoredAdminKey(): string | null {
    try {
      return localStorage.getItem("pendulum_admin_key");
    } catch (error) {
      console.warn("Failed to retrieve admin key from localStorage:", error);
      return null;
    }
  }

  getAuthHeaders(): Record<string, string> {
    if (this.adminKey) {
      return { Authorization: `Bearer ${this.adminKey}` };
    }

    if (this.authToken) {
      return { Authorization: `Bearer ${this.authToken}` };
    }

    return {};
  }

  async validateAdminKey(
    key: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await axios.post(`${this.appUrl}/auth/admin/validate`, {
        adminKey: key,
      });

      if (response.data?.success && response.data?.role === "admin") {
        return { success: true };
      } else {
        return {
          success: false,
          error: "Invalid admin key",
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error?.message || "Invalid admin key";
        return {
          success: false,
          error: errorMessage,
        };
      } else {
        return {
          success: false,
          error: "Failed to validate admin key",
        };
      }
    }
  }

  async getCollectionPermissions(collectionName: string) {
    try {
      const response = await axios.get(
        `${this.permissionsUrl}/${collectionName}/permissions`,
        { headers: this.getAuthHeaders() },
      );
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          this.clearAuthToken();
          this.clearAdminKey();
        }
        const message =
          error.response?.data?.error?.message ||
          "Failed to get collection permissions";
        return { success: false, error: message };
      }
      throw error;
    }
  }

  async updateCollectionPermissions(
    collectionName: string,
    permissions: {
      create: string[];
      read: string[];
      update: string[];
      delete: string[];
    },
  ) {
    try {
      const response = await axios.put(
        `${this.permissionsUrl}/${collectionName}/permissions`,
        { newPermissions: permissions },
        { headers: this.getAuthHeaders() },
      );
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          this.clearAuthToken();
          this.clearAdminKey();
        }
        const message =
          error.response?.data?.error?.message ||
          "Failed to update collection permissions";
        return { success: false, error: message };
      }
      throw error;
    }
  }

  async createCollection(newCollection: string) {
    try {
      const response = await axios.post(
        `${this.appUrl}/collections`,
        {
          newCollection,
        },
        { headers: this.getAuthHeaders() },
      );
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          this.clearAuthToken();
          this.clearAdminKey();
        }
        const message =
          error.response?.data?.error?.message ||
          "Failed to get collection permissions";
        return { success: false, error: message };
      }
      throw error;
    }
  }

  async getAllCollections() {
    try {
      const response = await axios.get(`${this.appUrl}/collections`, {
        headers: this.getAuthHeaders(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          this.clearAuthToken();
          this.clearAdminKey();
        }
        const message =
          error.response?.data?.error?.message ||
          "Failed to get collection permissions";
        return { success: false, error: message };
      }
      throw error;
    }
  }

  async deleteCollection(collection: string) {
    try {
      const response = await axios.delete(
        `${this.appUrl}/collections?collection=${collection}`,
        { headers: this.getAuthHeaders() },
      );
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          this.clearAuthToken();
          this.clearAdminKey();
        }
        const message =
          error.response?.data?.error?.message ||
          "Failed to get collection permissions";
        return { success: false, error: message };
      }
      throw error;
    }
  }
}
