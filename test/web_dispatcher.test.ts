import nock from "nock";
import { CONSOLE, TOKEN, setup, travelTo } from "./helpers";
import { WebDispatcher } from "../src/web_dispatcher";

beforeEach(setup);

test("id", () => {
  const dispatcher = new WebDispatcher(TOKEN);
  expect(dispatcher.id).toBe("u4quBFg");
});

test("dispatch", async () => {
  travelTo("2000");
  const dispatcher = new WebDispatcher(TOKEN);
  const metrics = [[1], [2, 3], [4], [5], [6], [7], [8]];
  for (const i in metrics) {
    jest.setSystemTime(new Date(`2000-01-01T00:00:0${i}Z`));
    dispatcher.add(metrics[i] as number[]);
  }
  jest.useRealTimers();
  const requestA = nock("https://metrics.autoscale.app", {
    reqheaders: {
      "user-agent": "Autoscale Agent (Node)",
      "content-type": "application/json",
      "content-length": "83",
      "autoscale-metric-token": "u4quBFgM72qun74EwashWv6Ll5TzhBVktVmicoWoXla",
    },
  })
    .post("/", {
      "946684800": [1],
      "946684801": [2, 3],
      "946684802": [4],
      "946684803": [5],
      "946684804": [6],
    })
    .reply(200, "");
  const requestB = nock("https://metrics.autoscale.app", {
    reqheaders: {
      "user-agent": "Autoscale Agent (Node)",
      "content-type": "application/json",
      "content-length": "33",
      "autoscale-metric-token": "u4quBFgM72qun74EwashWv6Ll5TzhBVktVmicoWoXla",
    },
  })
    .post("/", {
      "946684805": [7],
      "946684806": [8],
    })
    .reply(200, "");
  await dispatcher.dispatch();
  expect(requestA.isDone()).toBe(true);
  expect(requestB.isDone()).toBe(true);
  expect(dispatcher["buffer"]).toStrictEqual(new Map());
});

test("dispatch 500", async () => {
  travelTo("2000");
  const dispatcher = new WebDispatcher(TOKEN);
  const request = nock("https://metrics.autoscale.app")
    .post("/")
    .reply(500, "");
  dispatcher.add([1]);
  jest.useRealTimers();
  await dispatcher.dispatch();
  expect(request.isDone()).toBe(true);
  expect(dispatcher["buffer"]).toStrictEqual(
    new Map(Object.entries({ "946684800": [1] }))
  );
  expect(CONSOLE).toHaveBeenCalledWith(
    "WebDispatcher[u4quBFg]: Failed to dispatch"
  );
});

test("prune", async () => {
  travelTo("2000");
  const dispatcher = new WebDispatcher(TOKEN);
  dispatcher.add([1]);
  jest.setSystemTime(new Date("2000-01-01T00:00:30Z"));
  dispatcher.add([1]);
  jest.setSystemTime(new Date("2000-01-01T00:00:40Z"));
  dispatcher.prune();
  expect(dispatcher["buffer"]).toStrictEqual(
    new Map(Object.entries({ "946684830": [1] }))
  );
});
