import { Database } from "./db";
import { Auth } from "./auth";
import { Realtime } from "./realtime";

export class PendulumClient {
	private db: Database;
	private auth: Auth;
	private realtime: Realtime;

	constructor() {
		this.db = new Database();
		this.auth = new Auth();
		this.realtime = new Realtime();
	}
}
