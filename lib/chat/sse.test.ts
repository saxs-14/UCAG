import { describe, expect, it } from "vitest";
import { formatSseEvent, splitSseFrames } from "./sse";

describe("formatSseEvent", () => {
  it("formats a plain data frame with no event name", () => {
    expect(formatSseEvent({ text: "hi" })).toBe('data: {"text":"hi"}\n\n');
  });

  it("formats a named event frame", () => {
    expect(formatSseEvent({}, "done")).toBe("event: done\ndata: {}\n\n");
  });
});

describe("splitSseFrames", () => {
  it("returns no frames and the whole buffer as rest when there's no complete frame yet", () => {
    const result = splitSseFrames('data: {"text":"partial');
    expect(result.frames).toEqual([]);
    expect(result.rest).toBe('data: {"text":"partial');
  });

  it("extracts one complete frame and leaves the remainder as rest", () => {
    const result = splitSseFrames('data: {"text":"hi"}\n\ndata: {"text":"more');
    expect(result.frames).toEqual([{ event: "message", data: '{"text":"hi"}' }]);
    expect(result.rest).toBe('data: {"text":"more');
  });

  it("extracts multiple complete frames in one call", () => {
    const result = splitSseFrames(
      'data: {"text":"one"}\n\ndata: {"text":"two"}\n\n'
    );
    expect(result.frames).toEqual([
      { event: "message", data: '{"text":"one"}' },
      { event: "message", data: '{"text":"two"}' },
    ]);
    expect(result.rest).toBe("");
  });

  it("reads the event name when a frame has one", () => {
    const result = splitSseFrames('event: done\ndata: {}\n\n');
    expect(result.frames).toEqual([{ event: "done", data: "{}" }]);
  });

  it("ignores a frame with no data line", () => {
    const result = splitSseFrames("event: done\n\ndata: {\"text\":\"hi\"}\n\n");
    expect(result.frames).toEqual([{ event: "message", data: '{"text":"hi"}' }]);
  });
});
