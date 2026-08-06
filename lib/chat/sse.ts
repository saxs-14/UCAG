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
export function splitSseFrames(buffer: string): { frames: ParsedSseFrame[]; rest: string } {
  const frames: ParsedSseFrame[] = [];
  let rest = buffer;
  let boundary: number;

  while ((boundary = rest.indexOf("\n\n")) !== -1) {
    const rawFrame = rest.slice(0, boundary);
    rest = rest.slice(boundary + 2);

    const lines = rawFrame.split("\n");
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
