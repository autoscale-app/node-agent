import nock from "nock";
import { setup, CONSOLE, TOKEN } from "./helpers";
import { WorkerDispatcher } from "../src/worker_dispatcher";

beforeEach(setup);

test("id", () => {
  const dispatcher = new WorkerDispatcher(TOKEN, async () => 1.23);
  expect(dispatcher.id).toBe("u4quBFg");
});

test("dispatch", async () => {
  const request = nock("https://metrics.autoscale.app", {
    reqheaders: {
      "user-agent": "Autoscale Agent (Node)",
      "content-type": "application/json",
      "content-length": "18",
      "autoscale-metric-token": "u4quBFgM72qun74EwashWv6Ll5TzhBVktVmicoWoXla",
    },
  })
    .post("/", { "946684800": 1.23 })
    .reply(200, "", {});
  const dispatcher = new WorkerDispatcher(TOKEN, async () => 1.23);
  await dispatcher.dispatch();
  expect(request.isDone()).toBe(true);
});

test("dispatch non-number", async () => {
  const dispatcher = new WorkerDispatcher(TOKEN, async () => null);
  await dispatcher.dispatch();
  expect(CONSOLE).toHaveBeenCalledWith(
    "WorkerDispatcher[u4quBFg]: Failed to calculate worker information"
  );
});

test("dispatch 500", async () => {
  const request = nock("https://metrics.autoscale.app")
    .post("/")
    .reply(500, "", {});
  const dispatcher = new WorkerDispatcher(TOKEN, async () => 1.23);
  await dispatcher.dispatch();
  expect(request.isDone()).toBe(true);
  expect(CONSOLE).toHaveBeenCalledWith(
    "WorkerDispatcher[u4quBFg]: Failed to dispatch (500)"
  );
});
