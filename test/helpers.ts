const nock = require("nock");

export const PLATFORM = "render";
export const OPTIONS = { run: false };
export const TOKEN = "u4quBFgM72qun74EwashWv6Ll5TzhBVktVmicoWoXla";
export const BASE_TIMESTAMP = 946684800;
export let CONSOLE: jest.SpyInstance;

export function travelTo(datetime: string) {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(datetime));
}

export function travel(distance: number) {
  jest.advanceTimersByTime(distance);
}

export function setup() {
  jest.restoreAllMocks();
  jest.useRealTimers();
  nock.cleanAll();
  nock.disableNetConnect();
  CONSOLE = jest.spyOn(console, "log");
}
