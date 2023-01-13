import { TOKEN } from "./helpers";
import { WorkerServers } from "../src/worker_servers";
import { WorkerServer } from "../src/worker_server";

test("find", () => {
  const servers = new WorkerServers();
  const server = new WorkerServer(TOKEN, async () => 1.23);
  servers.push(server);
  expect(servers.find(["token-a", TOKEN, "token-b"])).toBe(server);
});

test("find nothing", () => {
  const servers = new WorkerServers();
  const server = new WorkerServer(TOKEN, async () => 1.23);
  servers.push(server);
  expect(servers.find(["token-a", "token-b"])).toBe(null);
});
