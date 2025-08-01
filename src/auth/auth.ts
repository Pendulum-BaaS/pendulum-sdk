import axios from "axios";
import { AuthResult, LoginResult } from "src/types";

export class Auth {
  private readonly baseUrl: string;
  private getAuthHeaders: () => Record<string, string>;

  constructor(appUrl: string) {
    this.baseUrl = `${appUrl}/auth`;
  }

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<AuthResult> {
    try {
      await axios.post(`${this.baseUrl}/register`,
        { username, email, password },
        { headers: this.getAuthHeaders() },
      );
      return { success: true };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || "Registration failed";
        return { success: false, error: message };
      }
      throw error;
    }
  }

  async login(identifier: string, password: string): Promise<LoginResult> {
    try {
      const response = await axios.post(`${this.baseUrl}/login`,
        { identifier: username, password },
        { headers: this.getAuthHeaders() },
      );
      return { success: true, userId: response.data.userId };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // catches 4XX and 5XX status codes
        const message = error.response?.data?.error?.message || "Login failed";
        return { success: false, error: message };
      }
      throw error;
    }
  }

  async logout(): Promise<AuthResult> {
    try {
      await axios.post(`${this.baseUrl}/logout`,
        {},
        { headers: this.getAuthHeaders() },
      );
      return { success: true };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || "Logout failed";
        return { success: false, error: message };
      }
      throw error;
    }
  }
}
