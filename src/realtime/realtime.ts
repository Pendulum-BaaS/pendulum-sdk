import { RealtimeFunction } from "../types";

export class Realtime {
	private subscriptions: Map<string, Set<RealtimeFunction>>;
	private eventSource: EventSource | null = null;
	private reconnectAttempts: number = 0;
	private maxReconnectAttempts: number = 5;
	private reconnectDelay: number = 1000;

	constructor() {
		this.subscriptions = new Map();
		this.initializeEventSource();
	}

	private initializeEventSource() {
		if (this.eventSource) this.eventSource.close();
		this.eventSource = new EventSource("http://localhost:8080/events");
		this.eventSource.onmessage = (event) => {
			// event listener
			try {
				const data = JSON.parse(event.data);
				const callbacks = this.subscriptions.get(data.collection);
				if (callbacks) callbacks.forEach((cb) => cb(data));
			} catch (error) {
				console.log("Error parsing SSE message:", error);
			}
		};

		this.eventSource.onopen = () => {
			console.log("SSE connection opened");
			this.reconnectAttempts = 0;
		};

		this.eventSource.onerror = (error) => {
			console.error("SSE connection error:", error);
			this.handleReconnect();
		};
	}

	private handleReconnect() {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts += 1;
			console.log("Attempting to reconnect...");

			setTimeout(() => {
				this.initializeEventSource();
			}, this.reconnectDelay * this.reconnectAttempts);
		} else {
			console.error("Max reconnection attempts reached. Please refresh.");
		}
	}

	subscribe(collection: string, callback: RealtimeFunction) {
		const collectionSub = this.subscriptions.get(collection); // returns array of callback functions or undefined

		if (collectionSub === undefined) {
			this.subscriptions.set(collection, new Set([callback])); // create collection callback function Set inside subscriptions Map
		} else if (!collectionSub.has(callback)) {
			collectionSub.add(callback); // add callback function to existing callback function Set inside subscriptions Map
		}
	}

	unsubscribe(collection: string, callback: RealtimeFunction) {
		const collectionSub = this.subscriptions.get(collection);
		if (collectionSub === undefined || !collectionSub.has(callback)) return;
		collectionSub.delete(callback);
	}

	disconnect() {
		if (this.eventSource) {
			this.eventSource.close();
			this.eventSource = null;
		}

		this.subscriptions.clear();
	}
}
