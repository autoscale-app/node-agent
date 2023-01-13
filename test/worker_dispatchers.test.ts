import { TOKEN } from "./helpers";
import { WorkerDispatcher } from "../src/worker_dispatcher";
import { WorkerDispatchers } from "../src/worker_dispatchers";

test("dispatch", () => {
  const dispatchers = new WorkerDispatchers();
  const dispatcher = new WorkerDispatcher(TOKEN, async () => 1.23);
  dispatcher.dispatch = jest.fn();
  dispatchers.push(dispatcher);
  dispatchers.dispatch();
  expect(dispatcher.dispatch).toHaveBeenCalled();
});
