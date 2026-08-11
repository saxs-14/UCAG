import { describe, expect, it } from "vitest";
import {
  formatWhatsAppApsMessage,
  formatWhatsAppRecommendationsMessage,
  formatWhatsAppApplicationAlert,
} from "./adapter";

describe("whatsapp/adapter.ts", () => {
  it("formats APS calculated message with bold text and link", () => {
    const msg = formatWhatsAppApsMessage(34, 12);
    expect(msg).toContain("*34*");
    expect(msg).toContain("*12 verified programme(s)*");
    expect(msg).toContain("https://ucag.ac.za/ump/programmes");
  });

  it("formats application window alert", () => {
    const alert = formatWhatsAppApplicationAlert({
      id: "win-1",
      institutionId: "ump",
      programmeId: null,
      status: "open",
      opensOn: "2026-04-01",
      closesOn: "2026-11-30",
      lateClosesOn: "2026-12-15",
      sourceUrl: "https://www.ump.ac.za",
      verifiedOn: "2026-08-11",
      academicYear: 2026,
    });
    expect(alert).toContain("*OPEN*");
    expect(alert).toContain("2026-11-30");
  });

  it("formats recommended programmes message", () => {
    const msg = formatWhatsAppRecommendationsMessage([]);
    expect(msg).toContain("No exact matches found");
  });
});
