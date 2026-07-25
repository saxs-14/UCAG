import { describe, expect, it } from "vitest";
import { htmlToPlainText } from "./htmlToPlainText";

describe("htmlToPlainText", () => {
  it("removes script and style blocks entirely, including their content", () => {
    const html = "<html><head><style>.x{color:red}</style></head><body><script>track();</script><p>Hello</p></body></html>";
    expect(htmlToPlainText(html)).toBe("Hello");
  });

  it("strips tags but keeps the visible text", () => {
    const html = "<div><h1>Applications open</h1><p>From <b>1 April</b> to 30 November.</p></div>";
    expect(htmlToPlainText(html)).toBe("Applications open From 1 April to 30 November.");
  });

  it("decodes common HTML entities", () => {
    const html = "<p>Terms &amp; Conditions &mdash; read &quot;before&quot; you apply</p>";
    expect(htmlToPlainText(html)).toContain('Terms & Conditions');
    expect(htmlToPlainText(html)).toContain('"before"');
  });

  it("collapses repeated whitespace and newlines into single spaces", () => {
    const html = "<p>Line one</p>\n\n\n<p>   Line   two   </p>";
    expect(htmlToPlainText(html)).toBe("Line one Line two");
  });

  it("removes HTML comments", () => {
    const html = "<p>Visible</p><!-- internal note, never send this to the model --><p>Also visible</p>";
    const result = htmlToPlainText(html);
    expect(result).not.toContain("internal note");
    expect(result).toBe("Visible Also visible");
  });
});
