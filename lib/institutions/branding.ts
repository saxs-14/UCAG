export interface InstitutionBranding {
  institutionId: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  heroStyle: string;
  gradient: string;
  textColor: string;
  officialDomains: string[];
}

export const INSTITUTION_BRANDINGS: Record<string, InstitutionBranding> = {
  ump: {
    institutionId: "ump",
    name: "University of Mpumalanga",
    shortName: "UMP",
    // Real colors, cross-validated via two independent scrapes of
    // ump.ac.za's own homepage/CSS (2026-10-26): #242753 is the live
    // .navbar background-color, matching the crest's navy outline;
    // #f7a600 is the active/hover nav accent (not Bootstrap's stock
    // alert-warning, which is #fff3cd/#856404 -- a deliberate override),
    // matching the crest's gold quadrant; #613098 is a heavily-used
    // (14x in both passes) hover-text accent, not visible in the crest
    // itself but a genuine, consistent site-wide UI color. The old navy/
    // teal/gold values below in git history were never verified and
    // were wrong (real site has no teal at all). This DOES deliberately
    // diverge from app/ump/page.tsx's own UMP_NAVY/UMP_GOLD/UMP_TEAL,
    // which docs/FIGMA_IMPLEMENTATION_PLAN.md documents as an
    // intentionally preserved identity for that dedicated subsite --
    // that page was left untouched; this is only the generic
    // cross-institution banner/card branding used elsewhere.
    primaryColor: "#242753",
    secondaryColor: "#f7a600",
    accentColor: "#613098",
    logoUrl: "https://www.ump.ac.za/images/logo.png",
    heroStyle: "bg-gradient-to-br from-[#242753] via-[#1a1d3f] to-[#613098]",
    gradient: "from-[#242753] to-[#f7a600]",
    textColor: "text-white",
    officialDomains: ["ump.ac.za", "student.ump.ac.za"],
  },
  up: {
    institutionId: "up",
    name: "University of Pretoria",
    shortName: "UP",
    // Real colors, cross-validated via two independent scrapes of
    // up.ac.za (direct site blocked by a Cloudflare challenge both
    // times; fell back to a clean, 6-day-old Wayback snapshot, same
    // technique as uj.ac.za). Primary/secondary/accent are the up2024
    // theme's own named CSS custom properties (--color--primary--up-blue,
    // --up-red, --color--secondary--up-ochre), each used hundreds of
    // times and independently corroborated by the matching fill colors
    // baked into two official logo SVGs (crest blue/red/gold). The old
    // dark-red/gold/near-black guess below in git history was missing
    // UP's actual dominant color (blue) entirely.
    primaryColor: "#0c6fb8",
    secondaryColor: "#d71c33",
    accentColor: "#c48b3b",
    logoUrl: "https://www.up.ac.za/themes/custom/up2024/images/Footer-logo.svg",
    heroStyle: "bg-gradient-to-br from-[#003087] via-[#0c6fb8] to-[#d71c33]",
    gradient: "from-[#0c6fb8] to-[#c48b3b]",
    textColor: "text-white",
    officialDomains: ["up.ac.za", "tuks.co.za"],
  },
  wits: {
    institutionId: "wits",
    name: "University of the Witwatersrand",
    shortName: "Wits",
    // Real colors, cross-validated via two independent scrapes of
    // wits.ac.za (reachable directly, robots.txt permits it). #003b5c
    // and #85714d are not inferred -- Wits' own CSS literally names
    // utility classes after them (.bg-wits-blue, .bg-wits-brown),
    // confirmed in both passes with 60-100+ occurrences each across
    // header/nav backgrounds and link/heading colors. #002f6c is the
    // navy's own hover/active shade. The old navy/gold-ish guess below
    // in git history was in the right color family but not an exact
    // match to the real, self-named site colors.
    primaryColor: "#003b5c",
    secondaryColor: "#85714d",
    accentColor: "#002f4a",
    logoUrl: "https://www.wits.ac.za/media/wits-university-style-assets/images/wits-logo.svg",
    heroStyle: "bg-gradient-to-br from-[#002f4a] via-[#003b5c] to-[#85714d]",
    gradient: "from-[#003b5c] to-[#85714d]",
    textColor: "text-white",
    officialDomains: ["wits.ac.za", "students.wits.ac.za"],
  },
  uj: {
    institutionId: "uj",
    name: "University of Johannesburg",
    shortName: "UJ",
    // Real colors, verified from uj.ac.za's own homepage CSS (scraped
    // 2026-10-18, scripts/scraping/output/uj.json) -- the old #e65100/
    // #1a237e pairing below it in git history was never confirmed
    // against the real site.
    primaryColor: "#f26522",
    secondaryColor: "#171717",
    accentColor: "#00d084",
    logoUrl: null,
    heroStyle: "bg-gradient-to-br from-[#171717] via-[#2a1608] to-[#f26522]",
    gradient: "from-[#f26522] to-[#00d084]",
    textColor: "text-white",
    officialDomains: ["uj.ac.za", "student.uj.ac.za"],
  },
  tut: {
    institutionId: "tut",
    name: "Tshwane University of Technology",
    shortName: "TUT",
    // Real colors, cross-validated via two independent scrapes of
    // tut.ac.za (reachable directly, no robots.txt exists at all).
    // #005596 and #e31837 are the live theme CSS's .text-primary /
    // .btn-t4-secondary values (185 and 72 occurrences), independently
    // corroborated by near-identical fill colors (#0a5796, #e01e38)
    // baked into the official navbar logo SVG. #fab416 (gold) appears
    // only twice, exclusively inside the logo artwork -- genuine but a
    // minor accent, not a core color. The old dark-teal/burnt-orange
    // guess below in git history matched nothing on the real site at all.
    primaryColor: "#005596",
    secondaryColor: "#e31837",
    accentColor: "#fab416",
    logoUrl: "https://www.tut.ac.za/media/tshwane-interim/site-assets/images/tut-logo.svg",
    heroStyle: "bg-gradient-to-br from-[#003a66] via-[#005596] to-[#e31837]",
    gradient: "from-[#005596] to-[#e31837]",
    textColor: "text-white",
    officialDomains: ["tut.ac.za", "tut4life.ac.za"],
  },
  uct: {
    institutionId: "uct",
    name: "University of Cape Town",
    shortName: "UCT",
    // Real colors, cross-validated via two independent scrapes of
    // uct.ac.za (reachable directly, robots.txt permits the homepage and
    // /themes/ path). #00243a and #0098db are the theme's own named CSS
    // custom properties (--uct-color--primary, --uct-color--highlight),
    // with no :root override found anywhere -- i.e. their fallback
    // values are the actual rendered colors. #0098db is independently
    // corroborated by the near-identical fill color (#009ada) baked into
    // the official crest logo SVG. #0076d1 is the site's --uct-color--link
    // token, a real but more generic link-blue. Both passes explicitly
    // caught and excluded Bootstrap's stock alert-warning colors
    // (#fcf8e3/#8a6d3b) sitting in a dead, commented-out HTML block --
    // exactly what fooled the prior pass that originally flagged this
    // entry as needing re-verification. The old "Midnight City" CSS
    // gradient below in git history was a generic design-asset-site
    // gradient, not anything from the real site.
    primaryColor: "#00243a",
    secondaryColor: "#0098db",
    accentColor: "#0076d1",
    logoUrl: "https://www.uct.ac.za/themes/custom/blip_uct/logo.svg",
    heroStyle: "bg-gradient-to-br from-[#00243a] via-[#003c69] to-[#0098db]",
    gradient: "from-[#00243a] to-[#0098db]",
    textColor: "text-white",
    officialDomains: ["uct.ac.za", "myuct.ac.za"],
  },
  unisa: {
    institutionId: "unisa",
    name: "University of South Africa",
    shortName: "UNISA",
    // Real colors, verified from unisa.ac.za's own theme CSS (scraped
    // 2026-10-18, scripts/scraping/output/unisa.json). The old green/
    // amber pairing below it in git history was never confirmed against
    // the real site and was simply wrong -- UNISA's actual identity is
    // maroon/navy/gold, not green.
    primaryColor: "#930010",
    secondaryColor: "#003366",
    accentColor: "#ffc107",
    logoUrl: null,
    heroStyle: "bg-gradient-to-br from-[#4d0008] via-[#930010] to-[#003366]",
    gradient: "from-[#930010] to-[#ffc107]",
    textColor: "text-white",
    officialDomains: ["unisa.ac.za", "mylife.unisa.ac.za"],
  },
  cput: {
    institutionId: "cput",
    name: "Cape Peninsula University of Technology",
    shortName: "CPUT",
    // Real colors, verified from cput.ac.za's own homepage CSS via a
    // Wayback Machine snapshot (the live site was down with a PHP fatal
    // error at scrape time, 2026-10-18 -- scripts/scraping/output/cput.json
    // documents why the archived copy was used).
    primaryColor: "#0198cd",
    secondaryColor: "#00508a",
    accentColor: "#6f6ac3",
    logoUrl: null,
    heroStyle: "bg-gradient-to-br from-[#00508a] via-[#0198cd] to-[#6f6ac3]",
    gradient: "from-[#0198cd] to-[#6f6ac3]",
    textColor: "text-white",
    officialDomains: ["cput.ac.za", "mycput.ac.za"],
  },
  nmu: {
    institutionId: "nmu",
    name: "Nelson Mandela University",
    shortName: "NMU",
    // Real colors, cross-validated via two independent scrapes of
    // mandela.ac.za (reachable directly, robots.txt permits the
    // homepage -- a prior pass's "unreachable" result was a transient
    // tooling failure, not a real site outage). #061c2c is the live
    // navbar background (class literally named "navNMU"), also the
    // explicit .color-bg-dark-blue utility; #fdc939 is the consistent
    // nav/menu hover-state gold accent (9 occurrences, both passes).
    // #07395d is a lighter secondary navy (.color-bg-blue utility,
    // secondary nav row). The old navy/gold guess below in git history
    // was in the right family but not an exact hex match to the real,
    // self-named site colors.
    primaryColor: "#061c2c",
    secondaryColor: "#fdc939",
    accentColor: "#07395d",
    logoUrl: "https://www.mandela.ac.za/App_Themes/global/images/logo-white.png",
    heroStyle: "bg-gradient-to-br from-[#061c2c] via-[#07395d] to-[#fdc939]",
    gradient: "from-[#061c2c] to-[#fdc939]",
    textColor: "text-white",
    officialDomains: ["mandela.ac.za", "mandela.ac.za"],
  },
  nwu: {
    institutionId: "nwu",
    name: "North-West University",
    shortName: "NWU",
    // Real colors, read from nwu.ac.za's own compiled theme CSS
    // (Drupal theme "nwu_theme", scripts/scraping/output/nwu.json,
    // 2026-10-31). #6c3d91 (purple) appears 25 times across more than a
    // dozen distinct selectors as background/text/border, paired with a
    // matching soft tint (#e2d8e9) the same way this app's own
    // "-soft" tokens work -- confirmed as the real primary, not a
    // library default. #00889c (teal) appears 13 times with the same
    // cross-file consistency; recorded as secondary with lower
    // confidence than the primary. The site's compiled CSS is built on
    // stock Bootstrap 3 (#337ab7/#5cb85c/#5bc0de/#f0ad4e/#d9534f and
    // their tints) -- excluded, not NWU's own colors.
    primaryColor: "#6c3d91",
    secondaryColor: "#00889c",
    accentColor: "#4a2a63",
    logoUrl: "https://www.nwu.ac.za/sites/www.nwu.ac.za/files/NWU-logo-pers_1.png",
    heroStyle: "bg-gradient-to-br from-[#4a2a63] via-[#6c3d91] to-[#00889c]",
    gradient: "from-[#6c3d91] to-[#00889c]",
    textColor: "text-white",
    officialDomains: ["nwu.ac.za", "mynwu.ac.za"],
  },
  ukzn: {
    institutionId: "ukzn",
    name: "University of KwaZulu-Natal",
    shortName: "UKZN",
    // Real colors, read directly from pixel values in UKZN's own crest
    // logo artwork (scripts/scraping/output/ukzn.json, 2026-10-31) --
    // the site's CSS was mostly generic WordPress/Gutenberg
    // block-editor default-palette noise (#cf2e2e/#ff6900/#fcb900/
    // #7bdcb5/#00d084/#abb8c3, excluded), not UKZN's own. This is a
    // crest-style multi-color mark (red dominant, 27636px vs ~2400px
    // for each accent), not a two-tone brand -- #ed1c24 is the
    // overwhelming majority color so it's primary; #ffde00 (gold) is
    // picked as secondary over the other two accents (#f99d1b orange,
    // #00a651 green -- both real, both present in the crest, just not
    // used here) as the single most visually distinctive complement to
    // the red. That role assignment is a judgment call on an otherwise
    // real, pixel-verified palette, not itself independently confirmed.
    primaryColor: "#ed1c24",
    secondaryColor: "#ffde00",
    accentColor: "#00aeef",
    logoUrl: "https://ukzn.ac.za/wp-content/uploads/2020/03/Transp_bg.png",
    heroStyle: "bg-gradient-to-br from-[#8e1115] via-[#ed1c24] to-[#ffde00]",
    gradient: "from-[#ed1c24] to-[#ffde00]",
    textColor: "text-white",
    officialDomains: ["ukzn.ac.za"],
  },
};

export function getInstitutionBranding(institutionId: string): InstitutionBranding {
  return INSTITUTION_BRANDINGS[institutionId.toLowerCase()] ?? INSTITUTION_BRANDINGS.ump;
}

export function detectInstitutionFromEmail(email: string): InstitutionBranding | null {
  if (!email || !email.includes("@")) return null;
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return null;

  for (const branding of Object.values(INSTITUTION_BRANDINGS)) {
    if (branding.officialDomains.some((d) => domain === d || domain.endsWith("." + d))) {
      return branding;
    }
  }

  return null;
}
