import { TOKEN } from "./helpers";
import { WorkerServer } from "../src/worker_server";

test("serve", async () => {
  const server = new WorkerServer(TOKEN, async () => 1.23);
  expect(await server.serve()).toEqual(1.23);
});
