import axios from "axios";
import { Database } from "./db";
import { Auth } from "./auth";
import { Realtime } from "./realtime";
import { PendulumConfig } from "./types";

export class PendulumClient {
  private config: Required<PendulumConfig>;
  private baseUrl: string;
  public db: Database;
  public auth: Auth;
  public realtime: Realtime;

  constructor(config: PendulumConfig = {}) {
    this.config = {
      apiUrl: config.apiUrl || "http://localhost:3000",
      eventsUrl: config.eventsUrl || "http://localhost:8080/events",
    };

    this.baseUrl = `${this.config.apiUrl}/permissions`

    this.db = new Database(this.config.apiUrl);
    this.auth = new Auth(this.config.apiUrl);
    this.realtime = new Realtime(this.config.eventsUrl);
  }

  async getCollectionPermissions(collectionName: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/${collectionName}/permissions`);
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || 'Failed to get collection permissions'; // SIMPLIFY THIS
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
    }
  ) {
    try {
      const response = await axios.put(
        `${this.baseUrl}/${collectionName}/permissions`,
        { newPermissions: permissions }
      );
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || 'Failed to update collection permissions'; // SIMPLIFY THIS
        return { success: false, error: message };
      }
      throw error;
    }
  }
}
