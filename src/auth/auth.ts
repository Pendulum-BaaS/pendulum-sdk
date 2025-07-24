import axios from "axios";
import { AuthResult, LoginResult } from "src/types";

export class Auth {
  private readonly baseUrl: string;

  constructor(apiUrl: string) {
    this.baseUrl = `${apiUrl}/auth`;
  }

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<AuthResult> {
    try {
      await axios.post(`${this.baseUrl}/register`, {
        username,
        email,
        password,
      });
      return { success: true };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "Registration failed";
        return { success: false, error: message };
      }
      throw error;
    }
  }

  async login(username: string, password: string): Promise<LoginResult> {
    try {
      const response = await axios.post(`${this.baseUrl}/login`, {
        username,
        password,
      });
      return { success: true, userId: response.data.userId };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // catches 4XX and 5XX status codes
        const message = error.response?.data?.message || "Login failed";
        return { success: false, error: message };
      }
      throw error;
    }
  }

  async logout(): Promise<AuthResult> {
    try {
      await axios.post(`${this.baseUrl}/logout`);
      return { success: true };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "Logout failed";
        return { success: false, error: message };
      }
      throw error;
    }
  }
}
