import http from "http";
import nock from "nock";
import { setup, TOKEN, BASE_TIMESTAMP } from "./helpers";
import { dispatch } from "../src/request";

beforeEach(setup);

test("dispatch", async () => {
  const request = nock("https://metrics.autoscale.app/", {
    reqheaders: {
      "user-agent": "Autoscale Agent (Node)",
      "content-type": "application/json",
      "content-length": "20",
      "autoscale-metric-token": "u4quBFgM72qun74EwashWv6Ll5TzhBVktVmicoWoXla",
    },
  })
    .post("/", '{"946684800":[1.23]}')
    .reply(200, "", {});
  const payload = { [BASE_TIMESTAMP]: [1.23] };
  const body = JSON.stringify(payload);
  await dispatch(body, TOKEN);
  expect(request.isDone()).toBe(true);
});

test("dispatch 500", async () => {
  const request = nock("https://metrics.autoscale.app/", {
    reqheaders: {
      "user-agent": "Autoscale Agent (Node)",
      "content-type": "application/json",
      "content-length": "20",
      "autoscale-metric-token": "u4quBFgM72qun74EwashWv6Ll5TzhBVktVmicoWoXla",
    },
  })
    .post("/", '{"946684800":[1.23]}')
    .reply(500, "", {});
  const payload = { [BASE_TIMESTAMP]: [1.23] };
  const body = JSON.stringify(payload);
  await expect(dispatch(body, TOKEN)).rejects.toBeInstanceOf(
    http.IncomingMessage
  );
  expect(request.isDone()).toBe(true);
});
