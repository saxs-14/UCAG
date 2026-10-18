/**
 * Minimal SSE helpers shared by both directions of this app's chat
 * streaming: lib/chat/geminiChatClient.ts uses splitSseFrames to parse
 * Gemini's incoming streamGenerateContent?alt=sse response, and
 * app/api/chat/route.ts uses formatSseEvent to write the outgoing
 * stream this app sends the browser -- which components/chat/ChatWidget.tsx
 * parses with splitSseFrames again. One tested wire format, three call
 * sites, instead of three separate ad-hoc parsers.
 */

export function formatSseEvent(data: unknown, event?: string): string {
  const lines: string[] = [];
  if (event) lines.push(`event: ${event}`);
  lines.push(`data: ${JSON.stringify(data)}`);
  return lines.join("\n") + "\n\n";
}

export interface ParsedSseFrame {
  event: string;
  data: string;
}

/** Splits a raw SSE byte buffer (already decoded to text) into complete
 * frames -- each terminated by a blank line, per the SSE spec -- plus
 * whatever incomplete tail remains for the next chunk. A frame with no
 * `data:` line is dropped; this app never sends a dataless frame on
 * purpose, so treating one as noise (rather than throwing) is the
 * simpler, equally-correct behavior. */
// Matches a blank line as the frame terminator under either LF or CRLF
// line endings. The original indexOf("\n\n") assumed LF-only framing --
// this app's own formatSseEvent always writes LF, but Gemini's
// streamGenerateContent?alt=sse response is Google's wire format, not
// ours, and was never actually confirmed to use bare LF. A CRLF stream
// (every "\n\n" replaced by "\r\n\r\n") makes indexOf("\n\n") never
// match: the entire body sits unprocessed in `rest` and this function
// silently returns zero frames -- no exception, no malformed-JSON error,
// just nothing -- which is exactly the symptom production logged
// ("Gemini response contained no reply text. functionCall=none
// lastChunk=none", i.e. the chunk loop ran to completion having yielded
// nothing at all).
const FRAME_BOUNDARY = /\r\n\r\n|\n\n/;

export function splitSseFrames(buffer: string): { frames: ParsedSseFrame[]; rest: string } {
  const frames: ParsedSseFrame[] = [];
  let rest = buffer;
  let match: RegExpMatchArray | null;

  while ((match = rest.match(FRAME_BOUNDARY)) && match.index !== undefined) {
    const rawFrame = rest.slice(0, match.index);
    rest = rest.slice(match.index + match[0].length);

    // \r?\n (not a bare \n) for the same CRLF-vs-LF reason: a frame whose
    // lines are "data: {...}\r" would otherwise come back as one line
    // with a stray trailing \r still attached.
    const lines = rawFrame.split(/\r?\n/);
    const eventLine = lines.find((l) => l.startsWith("event: "));
    const dataLine = lines.find((l) => l.startsWith("data: "));

    if (dataLine) {
      frames.push({
        event: eventLine ? eventLine.slice("event: ".length) : "message",
        data: dataLine.slice("data: ".length),
      });
    }
  }

  return { frames, rest };
}
