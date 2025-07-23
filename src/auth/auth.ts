import axios from "axios";

export class Auth {
	private readonly baseUrl: string;

	constructor(apiUrl: string) {
		this.baseUrl = `${apiUrl}/auth`;
	}

	async register(username: string, email: string, password: string) {
		const body = { username, email, password };
		const response = await axios.post(`${this.baseUrl}/register`, body);
		return response.status === 201;
	}

	async login(username: string, password: string) {
		const body = { username, password };
		const response = await axios.post(`${this.baseUrl}/login`, body);
		return response.data.userId;
	}

	async logout() {
		const response = await axios.post(`${this.baseUrl}/logout`);
		return response.status === 200;
	}
}
