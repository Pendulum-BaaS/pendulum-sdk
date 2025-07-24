import { Database } from "./db";
import { Auth } from "./auth";
import { Realtime } from "./realtime";
import { PendulumConfig } from "./types";

export class PendulumClient {
  private config: Required<PendulumConfig>;
  public db: Database;
  public auth: Auth;
  public realtime: Realtime;

  constructor(config: PendulumConfig = {}) {
    this.config = {
      apiUrl: config.apiUrl || "http://localhost:3000",
      eventsUrl: config.eventsUrl || "http://localhost:8080/events",
    };

    this.db = new Database(this.config.apiUrl);
    this.auth = new Auth(this.config.apiUrl);
    this.realtime = new Realtime(this.config.eventsUrl);
  }
}
