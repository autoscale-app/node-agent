import { setup, TOKEN } from "./helpers";
import { WebDispatchers } from "../src/web_dispatchers";
import { WebDispatcher } from "../src/web_dispatcher";

beforeEach(setup);

test("already set error", () => {
  const dispatchers = new WebDispatchers();
  dispatchers.queueTime = new WebDispatcher(TOKEN);
  expect(() => dispatchers.setQueueTime(new WebDispatcher(TOKEN))).toThrow(
    "queue time dispatcher already set"
  );
});

test("prune", () => {
  const dispatchers = new WebDispatchers();
  dispatchers.setQueueTime(new WebDispatcher(TOKEN));
  dispatchers.queueTime && (dispatchers.queueTime.prune = jest.fn());
  dispatchers.prune();
  expect(dispatchers.queueTime?.prune).toHaveBeenCalled();
});

test("dispatch", () => {
  const dispatchers = new WebDispatchers();
  dispatchers.setQueueTime(new WebDispatcher(TOKEN));
  dispatchers.queueTime && (dispatchers.queueTime.dispatch = jest.fn());
  dispatchers.dispatch();
  expect(dispatchers.queueTime?.dispatch).toHaveBeenCalled();
});
