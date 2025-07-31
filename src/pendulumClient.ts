import axios from "axios";
import { Database } from "./db";
import { Auth } from "./auth";
import { Realtime } from "./realtime";

export class PendulumClient {
  private appUrl: string;
  private eventsUrl: string;
  private permissionsUrl: string;
  public db: Database;
  public auth: Auth;
  public realtime: Realtime;

  constructor() {
    this.appUrl = "/pendulum";
    this.eventsUrl = "/pendulum-events";
    this.permissionsUrl = `${this.appUrl}/permissions`;
    this.db = new Database(this.appUrl);
    this.auth = new Auth(this.appUrl);
    this.realtime = new Realtime(this.eventsUrl);
  }

  async getCollectionPermissions(collectionName: string) {
    try {
      const response = await axios.get(
        `${this.permissionsUrl}/${collectionName}/permissions`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.error?.message ||
          "Failed to get collection permissions"; // SIMPLIFY THIS
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
      );
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.error?.message ||
          "Failed to update collection permissions"; // SIMPLIFY THIS
        return { success: false, error: message };
      }
      throw error;
    }
  }
}
