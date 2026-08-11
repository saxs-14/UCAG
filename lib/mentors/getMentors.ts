export interface MentorProfile {
  id: string;
  name: string;
  programme: string;
  yearOfStudy: string;
  faculty: string;
  campus: "Mbombela" | "Siyabuswa";
  expertise: string[];
  bio: string;
  verificationStatus: "verified" | "pending";
  availability: "Available" | "Limited";
  contactEmail: string;
}

export const UMP_MENTORS: MentorProfile[] = [
  {
    id: "mentor-1",
    name: "Sibusiso Nkosi",
    programme: "Bachelor of Information and Communication Technology",
    yearOfStudy: "3rd Year",
    faculty: "Economics, Development and Business Sciences",
    campus: "Mbombela",
    expertise: ["Python Coding", "Maths Level 4+ Pass", "First-Year Adaptation"],
    bio: "Passionate about helping first-year ICT students get comfortable with programming and university math.",
    verificationStatus: "verified",
    availability: "Available",
    contactEmail: "sibusiso.mentor@student.ump.ac.za",
  },
  {
    id: "mentor-2",
    name: "Nokuthula Zwane",
    programme: "BSc in Agricultural Sciences",
    yearOfStudy: "4th Year",
    faculty: "Agriculture and Natural Sciences",
    campus: "Mbombela",
    expertise: ["Crop Science", "AgriSETA Bursary Applications", "Lab Reports"],
    bio: "Senior Agriculture student with experience in practical farming modules and bursary applications.",
    verificationStatus: "verified",
    availability: "Available",
    contactEmail: "nokuthula.mentor@student.ump.ac.za",
  },
];

export function getUmpMentors(): MentorProfile[] {
  return UMP_MENTORS;
}
