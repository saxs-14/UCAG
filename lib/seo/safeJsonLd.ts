/**
 * JSON.stringify() never escapes "</script>" in a string value. Embedded
 * verbatim into a <script type="application/ld+json"> via
 * dangerouslySetInnerHTML, a catalogue field containing that literal
 * sequence (e.g. an admin-edited programme name via the Course Editor's
 * raw-JSON patch) would close the script tag early and let whatever
 * follows run as HTML/script -- a real stored-XSS path, not a theoretical
 * one, since this app's catalogue data is admin-editable. Escaping "<" to
 * its unicode form breaks that sequence while leaving the JSON semantically
 * identical (valid JSON allows an escaped "<" inside a string).
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
