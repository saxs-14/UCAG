/**
 * Labeled training examples for the bursary/internship scam classifier
 * (see classify.ts, and CLAUDE.md non-negotiable #5 on why this exists at
 * all). There is no real corpus of scraped South African bursary scam
 * listings to train on -- these examples were written by hand to cover
 * the phrasing patterns real scams use (urgency, guarantees, upfront
 * payment framed many different ways, informal-only contact) versus how
 * real, legitimate SA bursary/internship listings actually read (named
 * funder, clear academic/means criteria, official channels, no payment).
 *
 * This is a real limitation, not a hidden one: accuracy reported by
 * scripts/train-bursary-scam-model.mts is against a held-out split of
 * these same hand-written examples, not independent real-world listings.
 * It should generalise reasonably well precisely because the two classes
 * use genuinely different vocabulary (funding/criteria/faculty language
 * vs. urgency/payment/guarantee language), but it is a synthetic-data
 * accuracy number, not a field-tested one -- treat the model as a strong
 * second opinion layered on top of the deterministic keyword checks in
 * bursarySafety.ts, not a replacement for eventual review against real
 * flagged listings once the ingestion pipeline is live.
 */

export type ScamLabel = "scam" | "legitimate";

export interface LabeledListing {
  text: string;
  label: ScamLabel;
}

export const TRAINING_DATA: LabeledListing[] = [
  // ---------------------------------------------------------------------
  // legitimate
  // ---------------------------------------------------------------------
  {
    label: "legitimate",
    text: "The Investec Bursary Programme covers full tuition, accommodation, and a monthly living allowance for students accepted into an accredited engineering, finance, or actuarial science degree. Applicants must have achieved at least 70% for Mathematics and Physical Science in matric and demonstrate financial need. Apply through the official Investec careers portal before 30 September.",
  },
  {
    label: "legitimate",
    text: "NSFAS provides funding for tuition, accommodation, and a book allowance to South African citizens who meet the household income threshold and have been accepted to study at a public university or TVET college. There is no fee to apply. Apply online at the official NSFAS portal using your ID number and supporting documents.",
  },
  {
    label: "legitimate",
    text: "The Funza Lushaka Bursary is awarded to students committed to teaching in a public school after graduation, in a scarce-skills subject such as Mathematics, Science, or an official South African language. Selection is based on academic merit and a commitment contract with the Department of Basic Education. No payment is required to apply.",
  },
  {
    label: "legitimate",
    text: "Sasol's bursary scheme for chemical engineering students covers tuition, residence fees, and textbooks for the duration of the degree, with vacation work included each year. Shortlisted candidates will be invited for an interview and psychometric assessment at a Sasol regional office. Applications close 31 August and must be submitted via the Sasol careers website.",
  },
  {
    label: "legitimate",
    text: "The Department of Health's Green Book bursary supports students enrolled in a Bachelor of Medicine and Bachelor of Surgery programme in exchange for a period of community service after qualifying. Applicants must submit a certified academic transcript and proof of South African citizenship through their provincial Department of Health office.",
  },
  {
    label: "legitimate",
    text: "Old Mutual's actuarial bursary is open to matriculants who achieved a minimum of 80% for Mathematics and are registered or planning to register for a BSc Actuarial Science degree at a recognised South African university. The bursary covers tuition and provides mentorship, with no obligation to repay if academic requirements are maintained.",
  },
  {
    label: "legitimate",
    text: "This internship with Standard Bank's graduate programme is open to final-year and recent BCom graduates. Successful candidates will rotate through retail banking, risk, and technology departments over 12 months, earning a market-related stipend. Applications are submitted through the Standard Bank careers page and shortlisted candidates undergo a formal interview process.",
  },
  {
    label: "legitimate",
    text: "The Anglo American bursary for mining engineering students covers full university costs including tuition, accommodation, and a laptop allowance. Recipients commit to working for Anglo American for a period equal to the length of the bursary after graduation. Interviews are conducted at Anglo American offices; there is no cost to the applicant at any stage.",
  },
  {
    label: "legitimate",
    text: "Eskom's Learnership Programme offers matriculants with strong Mathematics and Science results a fully funded 12-month technical training programme, including a monthly stipend, at an Eskom training academy. Applications open annually on the Eskom careers portal and require certified copies of your ID and matric certificate.",
  },
  {
    label: "legitimate",
    text: "The Allan Gray Orbis Foundation Fellowship identifies entrepreneurially minded matriculants and funds their tertiary education in full, including accommodation, in exchange for participation in the Fellowship's leadership development programme. Selection involves an assessment day and panel interview; there is never a fee at any stage of the process.",
  },
  {
    label: "legitimate",
    text: "This SETA-accredited internship for unemployed graduates in the ICT sector provides a 12-month placement with a registered host employer, a monthly stipend in line with SETA guidelines, and mentorship toward a recognised qualification. Apply directly through your local SETA office; no registration fee is ever charged to applicants.",
  },
  {
    label: "legitimate",
    text: "The University of Pretoria's Vice-Chancellor's Academic Excellence Scholarship is automatically considered for first-year applicants who achieve an aggregate of 85% or higher in the NSC, based on the university's own admissions data. No separate application or payment is needed; successful students are notified via their official student email address.",
  },
  {
    label: "legitimate",
    text: "Nedbank's bursary for BCom Accounting students covers tuition, prescribed textbooks, and residence fees, and includes structured vacation work each year leading to a permanent offer on graduation, subject to satisfactory academic progress. Enquiries can be directed to Nedbank's official recruitment email listed on their corporate website.",
  },
  {
    label: "legitimate",
    text: "The Media24 cadet journalism internship accepts recent journalism or communications graduates for a 12-month paid placement across its print and digital newsrooms. Selection is based on a written assessment and portfolio review conducted by Media24's editorial team, with no cost to candidates at any stage.",
  },
  {
    label: "legitimate",
    text: "This bursary from the Wits Faculty of Health Sciences is awarded based on financial need and academic merit to registered MBChB students, covering tuition and a book allowance for the academic year. Applications are processed through the university's financial aid office using your student number.",
  },
  {
    label: "legitimate",
    text: "The Property Sector Charter Council's bursary for quantity surveying and construction management students is renewable annually based on academic performance, and includes vacation work with a participating property development firm. All communication is conducted through the applicant's university email address and the Council's official website.",
  },
  {
    label: "legitimate",
    text: "PPS's bursary for graduate professionals studying towards actuarial, medical, dental, or engineering qualifications provides funding for tuition and study materials for students in their final years of study, subject to academic performance criteria published on the PPS website. There is no application fee.",
  },
  {
    label: "legitimate",
    text: "This 6-month internship in software development at a registered fintech company is aimed at recent computer science graduates and offers a market-related monthly stipend, on-the-job mentorship, and the possibility of permanent employment. Shortlisted candidates are contacted for a technical interview via the company's official recruitment email.",
  },
  {
    label: "legitimate",
    text: "The Thuthuka Bursary Fund, administered by SAICA, supports African and Coloured students pursuing a Chartered Accountancy qualification with full funding for tuition, accommodation, and a laptop, in return for academic commitment and mentorship participation. Apply through SAICA's official website; the programme never requests payment from applicants.",
  },
  {
    label: "legitimate",
    text: "Toyota South Africa's bursary programme for mechanical and industrial engineering students covers tuition fees and provides structured vacation work at a Toyota manufacturing plant each year. Applicants are shortlisted based on academic results and undergo an interview at a Toyota facility; no fees are charged at any stage.",
  },
  {
    label: "legitimate",
    text: "The Rhodes University Vice-Chancellor's Scholarship is awarded to top-performing first-year students based on their final NSC results as submitted during the normal admissions process, with no separate application. Recipients are notified in writing by the university's financial aid office once registration is confirmed.",
  },
  {
    label: "legitimate",
    text: "This graduate internship at a JSE-listed logistics company offers unemployed graduates a 12-month contract with a fixed monthly stipend and structured training in supply chain management. Interested candidates should apply via the company's official careers page, where the full job description and closing date are published.",
  },
  {
    label: "legitimate",
    text: "The KFC Add Hope Bursary Fund provides financial assistance for tuition and accommodation to students from disadvantaged backgrounds who have been accepted into an accredited hospitality or business management qualification. Selection is based on a means test and academic record; applicants never pay a fee.",
  },
  {
    label: "legitimate",
    text: "MTN's Science, Technology, Engineering and Mathematics bursary covers full tuition and a data allowance for students registered in a relevant STEM degree at a South African public university, and includes a guaranteed vacation work placement each year. Apply through MTN's official bursary portal linked from their corporate website.",
  },
  {
    label: "legitimate",
    text: "This SAICA-accredited traineeship at an audit firm offers a three-year training contract for BCom Accounting graduates, including a competitive salary and full study support toward the CA(SA) qualification. Applications are submitted directly to the firm's HR department through their listed corporate email address.",
  },
  {
    label: "legitimate",
    text: "The Department of Basic Education's National Student Financial Aid for TVET colleges funds tuition, accommodation, and transport allowances for qualifying students enrolled in an NC(V) or Report 191 programme. Applications are made through your TVET college's financial aid office; there is no cost to apply.",
  },
  {
    label: "legitimate",
    text: "Sanlam's actuarial bursary provides full cost of study cover, a laptop, and a mentor from Sanlam's actuarial department to students who achieve at least 75% for Mathematics in matric and are registered for a relevant degree. All correspondence is through Sanlam's official recruitment team, with no payment ever required from students.",
  },
  {
    label: "legitimate",
    text: "This internship programme with a provincial Department of Health offers unemployed pharmacy graduates a 12-month structured pre-registration placement at a public hospital, with a stipend paid in line with public sector guidelines. Apply through the relevant provincial vacancy circular; no fees apply.",
  },
  {
    label: "legitimate",
    text: "The Vodacom Foundation's ICT bursary supports students studying computer science or information systems with full tuition cover and a paid vacation internship at Vodacom each year of study. Selection is competitive and merit-based, administered entirely through Vodacom's official bursary application system.",
  },
  {
    label: "legitimate",
    text: "This learnership at a registered financial services company is accredited with the relevant SETA and combines a recognised qualification with practical workplace experience over 12 months, including a monthly stipend set according to sector guidelines. Applications are made via the company's official recruitment portal, and shortlisted candidates are interviewed in person.",
  },

  // ---------------------------------------------------------------------
  // scam
  // ---------------------------------------------------------------------
  {
    label: "scam",
    text: "Congratulations! You have been pre-selected for a guaranteed bursary of R50,000. To release your funds immediately, simply pay a small refundable processing charge via EFT within 24 hours or your slot will be given to someone else.",
  },
  {
    label: "scam",
    text: "This exclusive bursary opportunity is only open to the first 15 applicants. Secure your spot today by sending a R200 deposit to the account below. No documents required, approval is instant, and funds are paid out the same week.",
  },
  {
    label: "scam",
    text: "We are offering fully funded internships with 100% guaranteed placement for matriculants. To activate your application and unlock your placement letter, WhatsApp us your ID number and pay a small activation cost of R150.",
  },
  {
    label: "scam",
    text: "Urgent: limited bursary slots remaining! Reply now to claim yours. A once-off registration fee is required before we can process your funding, and payment must be made via voucher code within 48 hours to avoid losing your place.",
  },
  {
    label: "scam",
    text: "This internship guarantees a job offer within one month, no interview needed. To reserve your spot, send your banking details and a refundable insurance fee of R300 to our WhatsApp number listed above.",
  },
  {
    label: "scam",
    text: "You qualify for an instant government bursary of R80,000. There is no application form, just pay the admin cost to release the funds and we will deposit the money into your account the same day, guaranteed.",
  },
  {
    label: "scam",
    text: "Act fast, only a few spots left! We guarantee acceptance into this bursary programme with zero requirements. Just complete payment of the processing fee via the link below and your funding will be approved within hours.",
  },
  {
    label: "scam",
    text: "Get a fully paid internship abroad with no experience needed. To confirm your seat, a small deposit is required to cover your visa processing, refundable once you arrive. Contact us only on WhatsApp for fastest response.",
  },
  {
    label: "scam",
    text: "This is a limited time offer: guaranteed funding for any course, any university, no minimum marks required. Pay a quick activation fee today via EFT or cash deposit to unlock your bursary certificate immediately.",
  },
  {
    label: "scam",
    text: "Your details have been selected for an exclusive scholarship worth R120,000. To avoid losing this opportunity, send your ID copy and a small handling charge within the next 24 hours. No further documents needed.",
  },
  {
    label: "scam",
    text: "We guarantee 100% approval for this bursary regardless of your marks. Simply pay the once-off release fee to our agent via WhatsApp and your funds will be transferred instantly, no forms or interviews required.",
  },
  {
    label: "scam",
    text: "Hurry, this bursary offer expires tonight! Send a small refundable deposit to confirm you are serious about the opportunity, and we will fast-track your application ahead of everyone else on the waiting list.",
  },
  {
    label: "scam",
    text: "Free laptop and guaranteed bursary for all matriculants who register today. A small once-off registration payment is required to process your details before the deadline tonight. Only WhatsApp contact available, no office visits.",
  },
  {
    label: "scam",
    text: "This opportunity has zero requirements and guarantees instant approval. Just pay a processing charge through the voucher link to unlock your funding certificate, which will be emailed to you within minutes.",
  },
  {
    label: "scam",
    text: "Congratulations, your application has been automatically approved for a fully funded scholarship. To claim it, pay the small administration cost via instant EFT today, as slots are limited and closing very soon.",
  },
  {
    label: "scam",
    text: "Get paid internship placement guaranteed within 48 hours, no CV or interview needed. Just send a refundable security deposit to secure your placement and our agent will contact you only through WhatsApp to finalise everything.",
  },
  {
    label: "scam",
    text: "This scholarship guarantees full payment of your fees with no minimum requirements. To activate, send a once-off processing fee immediately, as we can only hold your reserved spot for the next few hours.",
  },
  {
    label: "scam",
    text: "You have won a bursary award! No application needed, just confirm your details and pay a small handling fee to release the funds today. Contact our agent directly on WhatsApp for urgent processing.",
  },
  {
    label: "scam",
    text: "Limited slots available for this guaranteed funding opportunity, first come first served. Reserve yours now with a quick deposit and receive your acceptance letter and payment the very same day, no waiting.",
  },
  {
    label: "scam",
    text: "This internship comes with a guaranteed monthly stipend and job offer, no experience or qualifications required. To be added to the list, pay a small activation fee via the WhatsApp number provided before spots run out.",
  },
  {
    label: "scam",
    text: "Act now, this is your final chance! Pay the small refundable fee to unlock your guaranteed bursary approval instantly, no documents, no interview, no waiting, funds released the same day via EFT.",
  },
  {
    label: "scam",
    text: "We are giving away fully funded scholarships to anyone who registers today. Simply send your ID number and a processing charge to our agent's personal account to receive your funding letter within the hour.",
  },
  {
    label: "scam",
    text: "This is a once in a lifetime guaranteed bursary offer with no minimum marks and no selection process. Send the small admin payment today via voucher to avoid missing out, as we are closing registrations tonight.",
  },
  {
    label: "scam",
    text: "Your CV has been shortlisted automatically for a guaranteed internship with instant approval. To confirm your placement, pay a small refundable deposit through WhatsApp before the end of the day to avoid disqualification.",
  },
  {
    label: "scam",
    text: "Don't miss this opportunity, only a few spots remain! Pay the small processing fee now to guarantee your bursary approval, funds will reflect immediately after payment is confirmed, no forms required.",
  },
  {
    label: "scam",
    text: "This bursary requires no academic results and guarantees full funding for any field of study. Complete your registration by paying the small once-off fee via EFT today, as we cannot hold spots beyond tonight.",
  },
  {
    label: "scam",
    text: "Free money for students! Guaranteed approval, no interview, no documents. Just send a small refundable deposit through the link to activate your scholarship account and receive your first payment within 24 hours.",
  },
  {
    label: "scam",
    text: "This is an urgent notice: your bursary slot expires in 12 hours. Pay the quick activation charge now via voucher code to secure guaranteed funding, no further steps needed after payment is received.",
  },
  {
    label: "scam",
    text: "Guaranteed internship placement paid weekly, no CV needed. To be added to our exclusive list, send a small registration fee via WhatsApp today, as we only accept a limited number of applicants per week.",
  },
];
