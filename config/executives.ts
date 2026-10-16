export interface ExecutiveDefinition {
  officeSlug: string;
  position: string;
  name: string;
  officeEmail: string;
  goToThemFor: string;
  handles: string[];
  isListed: boolean;
  emailConsent: boolean;
  bio?: string;
}

/**
 * SINGLE SOURCE OF TRUTH: NACOSS UNILAG executive positions and public directory details
 * Displayed in exact constitutional hierarchy order:
 * 1. President
 * 2. Vice President
 * 3. General Secretary
 * 4. Assistant General Secretary
 * 5. Financial Secretary
 * 6. Treasurer
 * 7. Social Secretary
 * 8. Sports Secretary
 * 9. Welfare Secretary
 * 10. Software Director
 * 11. PRO
 *
 * Public contact emails remain placeholders until each representative provides
 * an address and grants permission to list it.
 */
export const EXECUTIVES_LIST: ExecutiveDefinition[] = [
  {
    officeSlug: "president",
    position: "President",
    name: "Adeniji Fowoyemi",
    officeEmail: "president@nacoss-unilag.example",
    goToThemFor: "[Draft - to be confirmed by executive] Overall departmental leadership, university administration representation, and strategic ecosystem partnerships.",
    handles: [
      "Executive Council leadership and departmental strategic direction",
      "Official representation before the HOD, Dean, and University of Lagos administration",
      "High-level corporate industry partnerships and external sponsorships",
      "Presidential executive interventions on unresolved departmental matters",
    ],
    isListed: true,
    emailConsent: false,
    bio: "Chief Executive Officer of the Nigerian Association of Computing Students (NACOSS), UNILAG Chapter. Oversees overall administration, faculty advocacy, and student representation.",
  },
  {
    officeSlug: "vice-president",
    position: "Vice President",
    name: "Ladipo Samuel Sunday",
    officeEmail: "vice-president@nacoss-unilag.example",
    goToThemFor: "[Draft - to be confirmed by executive] Internal committee coordination, academic welfare advocacy, and female computing community initiatives.",
    handles: [
      "Coordination of internal standing executive committees",
      "Departmental academic grievance escalation and tutorial oversight",
      "Women in Technology initiatives and female developer circles",
      "Student mentorship pairings across all academic levels",
    ],
    isListed: true,
    emailConsent: false,
    bio: "Supports presidential administration, coordinates departmental standing committees, and champions academic and diversity programs across Computing.",
  },
  {
    officeSlug: "general-secretary",
    position: "General Secretary",
    name: "Sanusi Taiwo Ayodeji",
    officeEmail: "gensec@nacoss-unilag.example",
    goToThemFor: "[Draft - to be confirmed by executive] Official departmental correspondence, Secretariat clearance records, HOD letters, and NACOSS Hub concern tracking.",
    handles: [
      "Secretariat operations and official meeting documentation",
      "Official departmental letters, recommendation requests, and HOD endorsements",
      "Constitutional records, committee registrations, and administrative archives",
      "NACOSS Hub concern tracking oversight and executive accountability",
    ],
    isListed: true,
    emailConsent: false,
    bio: "Head of the Secretariat. Responsible for official records, student correspondence, constitutional administration, and responsive departmental tracking.",
  },
  {
    officeSlug: "assistant-general-secretary",
    position: "Assistant General Secretary",
    name: "Abimbola Obafisayo",
    officeEmail: "ags@nacoss-unilag.example",
    goToThemFor: "[Draft - to be confirmed by executive] Secretariat meeting minutes, event attendance logs, and administrative record assistance.",
    handles: [
      "Assisting the General Secretary with Secretariat operations",
      "Documenting minutes of general and executive council meetings",
      "Event registration records and physical sign-in management",
      "Student correspondence archiving and secretariat logistics",
    ],
    isListed: true,
    emailConsent: false,
    bio: "Assists the Secretariat in maintaining accurate administrative logs, meeting minutes, and event operational coordination.",
  },
  {
    officeSlug: "financial-secretary",
    position: "Financial Secretary",
    name: "Adeyanju Iremide Joseph",
    officeEmail: "finsec@nacoss-unilag.example",
    goToThemFor: "[Draft - to be confirmed by executive] Departmental dues payment, online dues verification, clearance receipts, and financial clearance forms.",
    handles: [
      "Departmental dues collection, bank transfer verification, and receipts",
      "Issuance of official NACOSS exam and clearance receipts",
      "Maintenance of transparent student financial ledgers",
      "Financial clearance verification for graduating and returning students",
    ],
    isListed: true,
    emailConsent: false,
    bio: "Custodian of departmental dues records, clearance receipt issuance, and student financial accounts.",
  },
  {
    officeSlug: "treasurer",
    position: "Treasurer",
    name: "Akinsohun Oluwanifemi Susanna",
    officeEmail: "treasurer@nacoss-unilag.example",
    goToThemFor: "[Draft - to be confirmed by executive] Departmental fund disbursements, event budget reimbursements, and official financial audits.",
    handles: [
      "Management of NACOSS departmental bank accounts and cash flow",
      "Disbursement of approved committee budgets and vendor payments",
      "Reimbursement processing for official departmental initiatives",
      "Preparation of periodic financial statements and audit balance sheets",
    ],
    isListed: true,
    emailConsent: false,
    bio: "Manages departmental treasury, bank accounts, expenditure audits, and transparent financial stewardship.",
  },
  {
    officeSlug: "social-secretary",
    position: "Social Secretary",
    name: "Anuoluwapo Odebiyi",
    officeEmail: "socials@nacoss-unilag.example",
    goToThemFor: "[Draft - to be confirmed by executive] Departmental social events, freshers orientation, annual dinner tickets, and tech social mixers.",
    handles: [
      "Planning the Annual NACOSS Dinner & Awards Night",
      "Freshers Orientation Week and tech mixer social gatherings",
      "Hackathon social night logistics, gaming breaks, and entertainment",
      "Departmental merchandise, hoodies, and social packages",
    ],
    isListed: true,
    emailConsent: false,
    bio: "Leads social bonding, freshers orientation, tech networking mixers, and departmental celebrations.",
  },
  {
    officeSlug: "sports-secretary",
    position: "Sports Secretary",
    name: "Olaronke Bakare",
    officeEmail: "sports@nacoss-unilag.example",
    goToThemFor: "[Draft - to be confirmed by executive] Departmental sports teams, inter-level football matches, Dean's Cup representation, and esports tournaments.",
    handles: [
      "Inter-level football tournaments, basketball, and athletics events",
      "Faculty of Science Dean's Cup team selection and training sessions",
      "Annual NACOSS Esports Championship (FIFA, CODM, Chess, Scrabble)",
      "Sports facility access and student wellness fitness activities",
    ],
    isListed: true,
    emailConsent: false,
    bio: "Coordinates sports teams, university tournaments, Dean's Cup representation, and competitive esports leagues.",
  },
  {
    officeSlug: "welfare-secretary",
    position: "Welfare Secretary",
    name: "John Samuel Olamide",
    officeEmail: "welfare@nacoss-unilag.example",
    goToThemFor: "[Draft - to be confirmed by executive] Student lab facilities, AC and power complaints, lecture hall acoustics, hostel issues, and emergency aid.",
    handles: [
      "Computer Science laboratory conditions (AC units, chairs, power sockets, lighting)",
      "Lecture hall maintenance, microphone acoustics, and projector availability",
      "Student health, hostel accommodation complaints, and emergency assistance",
      "General student welfare advocacy before faculty management",
    ],
    isListed: true,
    emailConsent: false,
    bio: "Champions student welfare, laboratory and lecture hall facility maintenance, and compassionate emergency student support.",
  },
  {
    officeSlug: "software-director",
    position: "Software Director",
    name: "Name to be confirmed",
    officeEmail: "software@nacoss-unilag.example",
    goToThemFor: "[Draft - to be confirmed by executive] Developer circles, coding masterclasses, hackathons, open-source workshops, and departmental tech portal.",
    handles: [
      "Organizing NACOSS coding bootcamps, masterclasses, and code labs",
      "Annual NACOSS UNILAG Hackathon problem statements and mentorship",
      "Open-source projects, GitHub organization management, and code reviews",
      "Departmental digital portal development and developer community circles",
    ],
    isListed: true,
    emailConsent: false,
    bio: "Directs technical workshops, software engineering hackathons, developer mentorship, and student open-source innovation.",
  },
  {
    officeSlug: "pro",
    position: "Public Relations Officer (PRO)",
    name: "Oseh Praise",
    officeEmail: "pro@nacoss-unilag.example",
    goToThemFor: "[Draft - to be confirmed by executive] Official broadcast notices, social media features, press coverage, event promotions, and media partnerships.",
    handles: [
      "Official departmental broadcast announcements across social channels and WhatsApp",
      "Social media management (X, Instagram, LinkedIn, YouTube)",
      "Event publicity, flyer design coordination, and press releases",
      "Media partnerships and external student press relations",
    ],
    isListed: true,
    emailConsent: false,
    bio: "Public Relations Officer. Manages departmental communication channels, verified announcements, press relations, and social media brand presence.",
  },
];
