import { describe, expect, it } from "vitest";
import {
  deriveApplicationWindowStatus,
  resolveApplicationCta,
  resolveEffectiveApplicationWindowStatus,
} from "./applicationStatus";

describe("deriveApplicationWindowStatus", () => {
  const now = new Date("2026-07-23T00:00:00Z");

  it("returns unknown when neither opensOn nor closesOn is set", () => {
    expect(
      deriveApplicationWindowStatus({ opensOn: null, closesOn: null, lateClosesOn: null }, now)
    ).toBe("unknown");
  });

  it("returns openingSoon when now is before opensOn", () => {
    expect(
      deriveApplicationWindowStatus(
        { opensOn: "2026-08-01", closesOn: "2026-10-01", lateClosesOn: null },
        now
      )
    ).toBe("openingSoon");
  });

  it("returns open when now is between opensOn and closesOn", () => {
    expect(
      deriveApplicationWindowStatus(
        { opensOn: "2026-07-01", closesOn: "2026-10-01", lateClosesOn: null },
        now
      )
    ).toBe("open");
  });

  it("returns closed when now is after closesOn and there's no lateClosesOn", () => {
    expect(
      deriveApplicationWindowStatus(
        { opensOn: "2026-01-01", closesOn: "2026-06-01", lateClosesOn: null },
        now
      )
    ).toBe("closed");
  });

  it("respects lateClosesOn as the effective deadline over closesOn", () => {
    expect(
      deriveApplicationWindowStatus(
        { opensOn: "2026-01-01", closesOn: "2026-06-01", lateClosesOn: "2026-08-01" },
        now
      )
    ).toBe("open");
  });
});

describe("resolveEffectiveApplicationWindowStatus", () => {
  const now = new Date("2026-11-01T00:00:00Z");

  it("real bug, found live 2026-11-01: a stored status of 'open' past the real closesOn date must resolve to closed, not stay open", () => {
    // This is exactly UP's seeded window: status hand-set to "open" months
    // ago, closesOn long since passed, never revisited.
    expect(
      resolveEffectiveApplicationWindowStatus(
        { status: "open", opensOn: "2026-04-01", closesOn: "2026-06-30", lateClosesOn: null },
        now
      )
    ).toBe("closed");
  });

  it("a stored 'closed' can override dates that haven't passed yet (a legitimate early closure)", () => {
    expect(
      resolveEffectiveApplicationWindowStatus(
        { status: "closed", opensOn: "2026-04-01", closesOn: "2026-12-31", lateClosesOn: null },
        now
      )
    ).toBe("closed");
  });

  it("falls back to the stored status only when no dates exist at all", () => {
    expect(
      resolveEffectiveApplicationWindowStatus(
        { status: "open", opensOn: null, closesOn: null, lateClosesOn: null },
        now
      )
    ).toBe("open");
  });

  it("null window resolves to unknown, never guesses", () => {
    expect(resolveEffectiveApplicationWindowStatus(null, now)).toBe("unknown");
  });

  it("dates still correctly derive openingSoon even with a stale stored 'open'", () => {
    expect(
      resolveEffectiveApplicationWindowStatus(
        { status: "open", opensOn: "2027-01-01", closesOn: "2027-03-01", lateClosesOn: null },
        now
      )
    ).toBe("openingSoon");
  });
});

describe("resolveApplicationCta", () => {
  const urls = {
    applyUrl: "https://example.test/apply",
    statusCheckUrl: "https://example.test/status",
    websiteUrl: "https://example.test/",
  };

  it("open + applyUrl on record -> apply CTA with the real URL", () => {
    const cta = resolveApplicationCta("open", urls, null);
    expect(cta.kind).toBe("apply");
    if (cta.kind === "apply") expect(cta.url).toBe(urls.applyUrl);
  });

  it("open + no applyUrl on record -> never fabricates a link, falls back to the institution site", () => {
    const cta = resolveApplicationCta("open", { ...urls, applyUrl: null }, null);
    expect(cta.kind).toBe("datesBeingVerified");
  });

  it("openingSoon carries the real open date, not a guess", () => {
    const cta = resolveApplicationCta("openingSoon", urls, "2026-09-01");
    expect(cta.kind).toBe("openingSoon");
    if (cta.kind === "openingSoon") expect(cta.opensOn).toBe("2026-09-01");
  });

  it("closed NEVER returns an apply CTA, even though applyUrl is set on the programme", () => {
    const cta = resolveApplicationCta("closed", urls, null);
    expect(cta.kind).not.toBe("apply");
    expect(cta.kind).toBe("statusCheck");
    if (cta.kind === "statusCheck") expect(cta.url).toBe(urls.statusCheckUrl);
  });

  it("unknown never claims open or closed", () => {
    const cta = resolveApplicationCta("unknown", urls, null);
    expect(cta.kind).toBe("datesBeingVerified");
  });
});
