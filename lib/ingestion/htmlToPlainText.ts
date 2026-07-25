/**
 * Strips script/style blocks and HTML tags, collapses whitespace -- a
 * real, direct cost lever, not just cleanup: raw HTML markup (nav menus,
 * inline scripts, style attributes) is mostly not the actual page text
 * an admissions page's key dates live in, and every extra character is a
 * token billed to the LLM call. Not a full HTML parser -- good enough for
 * "get the visible text out," which is all extraction needs.
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
