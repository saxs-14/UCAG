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
    primaryColor: "#003b5c",
    secondaryColor: "#00a896",
    accentColor: "#d4af37",
    logoUrl: "https://www.ump.ac.za/images/logo.png",
    heroStyle: "bg-gradient-to-br from-[#003b5c] via-[#004f7c] to-[#00a896]",
    gradient: "from-[#003b5c] to-[#d4af37]",
    textColor: "text-white",
    officialDomains: ["ump.ac.za", "student.ump.ac.za"],
  },
  up: {
    institutionId: "up",
    name: "University of Pretoria",
    shortName: "UP",
    primaryColor: "#8b0000",
    secondaryColor: "#d4af37",
    accentColor: "#111827",
    logoUrl: null, // was a guessed URL that 404s -- never verified
    heroStyle: "bg-gradient-to-br from-[#700000] via-[#8b0000] to-[#b30000]",
    gradient: "from-[#8b0000] to-[#d4af37]",
    textColor: "text-white",
    officialDomains: ["up.ac.za", "tuks.co.za"],
  },
  wits: {
    institutionId: "wits",
    name: "University of the Witwatersrand",
    shortName: "Wits",
    primaryColor: "#002147",
    secondaryColor: "#c5a059",
    accentColor: "#0056b3",
    logoUrl: null, // was a guessed URL that doesn't resolve -- never verified
    heroStyle: "bg-gradient-to-br from-[#001733] via-[#002147] to-[#003366]",
    gradient: "from-[#002147] to-[#c5a059]",
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
    primaryColor: "#004d40",
    secondaryColor: "#d84315",
    accentColor: "#00897b",
    logoUrl: null, // was a guessed URL that doesn't resolve -- never verified
    heroStyle: "bg-gradient-to-br from-[#00332c] via-[#004d40] to-[#00796b]",
    gradient: "from-[#004d40] to-[#d84315]",
    textColor: "text-white",
    officialDomains: ["tut.ac.za", "tut4life.ac.za"],
  },
  uct: {
    institutionId: "uct",
    name: "University of Cape Town",
    shortName: "UCT",
    primaryColor: "#0f2027",
    secondaryColor: "#203a43",
    accentColor: "#2c5364",
    logoUrl: null, // was a guessed URL that doesn't resolve -- never verified
    heroStyle: "bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]",
    gradient: "from-[#0f2027] to-[#2c5364]",
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
    primaryColor: "#002f6c",
    secondaryColor: "#ffc72c",
    accentColor: "#0066b2",
    logoUrl: null, // was a guessed URL that doesn't resolve -- never verified
    heroStyle: "bg-gradient-to-br from-[#001e47] via-[#002f6c] to-[#004b93]",
    gradient: "from-[#002f6c] to-[#ffc72c]",
    textColor: "text-white",
    officialDomains: ["mandela.ac.za", "mandela.ac.za"],
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
