import axios from "axios";
import { DatabaseResult } from "src/types";

export class Database {
	private baseUrl: string;

	constructor(apiUrl: string) {
		this.baseUrl = `${apiUrl}/api`;
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
	): Promise<DatabaseResult<T>> {
		try {
			const response = await axios.get(`${this.baseUrl}/some`, {
				params: { collection, limit, offset, sortKey },
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

	async insert(collection: string, newItems: object[]) {
		const body = { collection, newItems };
		const response = await axios.post(this.baseUrl, body);
		return response.data;
	}

	async updateOne(
		collection: string,
		id: string,
		updateOperation: Record<string, any>,
	) {
		const body = { collection, updateOperation };
		const response = await axios.patch(`${this.baseUrl}/${id}`, body);
		return response.data;
	}

	async updateSome(
		collection: string,
		filter: Record<string, any>,
		updateOperation: Record<string, any>,
	) {
		const body = { collection, filter, updateOperation };
		const response = await axios.patch(`${this.baseUrl}/some`, body);
		return response.data;
	}

	async updateAll(collection: string, updateOperation: Record<string, any>) {
		const body = { collection, updateOperation };
		const response = await axios.patch(this.baseUrl, body);
		return response.data;
	}

	async replace(collection: string, id: string, newItem: object) {
		const body = { collection, newItem };
		const response = await axios.put(`${this.baseUrl}/${id}`, body);
		return response.data;
	}

	async removeOne(collection: string, id: string) {
		const response = await axios.delete(`${this.baseUrl}/${id}`, {
			params: { collection },
		});
		return response.data;
	}

	async removeSome(collection: string, filter: Record<string, any>) {
		const response = await axios.delete(`${this.baseUrl}/some`, {
			params: { collection, ...filter },
		});
		return response.data;
	}

	async removeAll(collection: string) {
		const response = await axios.delete(this.baseUrl, {
			params: { collection },
		});
		return response.data;
	}
}
