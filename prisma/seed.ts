import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing tables
  await prisma.concernUpdate.deleteMany();
  await prisma.concern.deleteMany();
  await prisma.executive.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.document.deleteMany();
  await prisma.siwesPlacement.deleteMany();
  await prisma.alumnus.deleteMany();
  await prisma.siwesCheckIn.deleteMany();
  await prisma.removalRequest.deleteMany();
  await prisma.pulseVote.deleteMany();
  await prisma.pulsePoll.deleteMany();


  // 1. Executive directory (11 current offices; no student IDs are stored)
  const executivesData = [
    {
      name: "Adeniji Fowoyemi",
      position: "President",
      officeSlug: "president",
      photoUrl: null,
      bio: "Leading NACOS UNILAG towards technological innovation, student welfare advocacy, and strategic partnerships across the tech ecosystem.",
      goToThemFor: "High-level department advocacy, external partnerships, and presidential interventions.",
      officeEmail: "president@nacos-unilag.example",
      isActive: true,
    },
    {
      name: "Ladipo Samuel Sunday",
      position: "Vice President",
      officeSlug: "vice-president",
      photoUrl: null,
      bio: "Overseeing internal committee coordination, female computing initiatives, and student mentorship programs.",
      goToThemFor: "Mentorship opportunities, Women in Tech circle, and internal executive committees.",
      officeEmail: "vice-president@nacos-unilag.example",
      isActive: true,
    },
    {
      name: "Sanusi Taiwo Ayodeji",
      position: "General Secretary",
      officeSlug: "general-secretary",
      photoUrl: null,
      bio: "Managing departmental administrative operations, official correspondence, constitutional records, and student concern tracking.",
      goToThemFor: "Official departmental letters, general inquiries, status tracking, and executive accountability.",
      officeEmail: "gensec@nacos-unilag.example",
      isActive: true,
    },
    {
      name: "Abimbola Obafisayo",
      position: "Assistant General Secretary",
      officeSlug: "assistant-general-secretary",
      photoUrl: null,
      bio: "Assisting the Secretariat with meeting documentation, logistics, and student records management.",
      goToThemFor: "Meeting minutes, event registration confirmations, and Secretariat support.",
      officeEmail: "ags@nacos-unilag.example",
      isActive: true,
    },
    {
      name: "Adeyanju Iremide Joseph",
      position: "Financial Secretary",
      officeSlug: "financial-secretary",
      photoUrl: null,
      bio: "Handling departmental dues, receipts issuance, and transparent financial record keeping for all NACOS events.",
      goToThemFor: "Departmental dues payment, clearance receipts, and financial clearance inquiries.",
      officeEmail: "finsec@nacos-unilag.example",
      isActive: true,
    },
    {
      name: "Akinsohun Oluwanifemi Susanna",
      position: "Treasurer",
      officeSlug: "treasurer",
      photoUrl: null,
      bio: "Managing departmental funds disbursement, budget audits, and financial integrity.",
      goToThemFor: "Reimbursements, budget verification, and vendor payment confirmation.",
      officeEmail: "treasurer@nacos-unilag.example",
      isActive: true,
    },
    {
      name: "Oseh Praise",
      position: "Public Relations Officer (PRO)",
      officeSlug: "pro",
      photoUrl: null,
      bio: "Broadcasting official announcements, managing social channels, media partnerships, and press releases.",
      goToThemFor: "Event promotion, official broadcasts, social media features, and press coverage.",
      officeEmail: "pro@nacos-unilag.example",
      isActive: true,
    },
    {
      name: "Anuoluwapo Odebiyi",
      position: "Social Secretary",
      officeSlug: "social-secretary",
      photoUrl: null,
      bio: "Organizing departmental dinners, hackathons social night, freshers orientation, and gaming tournaments.",
      goToThemFor: "NACOS social events, dinner ticketing, orientation week, and gaming competitions.",
      officeEmail: "socials@nacos-unilag.example",
      isActive: true,
    },
    {
      name: "Olaronke Bakare",
      position: "Sports Secretary",
      officeSlug: "sports-secretary",
      photoUrl: null,
      bio: "Coordinating inter-level football matches, e-sports leagues, and Faculty Dean's Cup representation.",
      goToThemFor: "NACOS sports teams, Dean's Cup registration, and esports league entry.",
      officeEmail: "sports@nacos-unilag.example",
      isActive: true,
    },
    {
      name: "John Samuel Olamide",
      position: "Welfare Secretary",
      officeSlug: "welfare-secretary",
      photoUrl: null,
      bio: "Championing student mental health, lab facility concerns, lecture hall acoustics, and emergency aid.",
      goToThemFor: "Hostel/Lab welfare issues, lecture hall complaints, and emergency student assistance.",
      officeEmail: "welfare@nacos-unilag.example",
      isActive: true,
    },
    {
      name: "Name to be confirmed",
      position: "Software Director",
      officeSlug: "software-director",
      photoUrl: null,
      bio: "Leading software development projects, open-source workshops, developer circles, and departmental portal tech.",
      goToThemFor: "Code lab sessions, developer mentorship, open-source projects, and GitHub community.",
      officeEmail: "software@nacos-unilag.example",
      isActive: true,
    },
  ];

  for (const exec of executivesData) {
    await prisma.executive.create({ data: exec });
  }
  console.log("Seeded 11 active executive offices.");

  // 2. Announcements
  const announcementsData = [
    {
      title: "URGENT: CSC 301 Mid-Semester Test Rescheduled to Friday",
      body: "Please note that the CSC 301 (Data Structures) test originally fixed for Thursday morning has been rescheduled to Friday at 10:00 AM in Lab 2. All 300L students must present their NACOS dues receipt at the entrance.",
      category: "Urgent",
      pinned: true,
      authorOfficeSlug: "vice-president",
    },
    {
      title: "NACOS Annual Hackathon 2026 Registration Open!",
      body: "Build the future of Fintech, AI, and EdTech! The 2026 NACOS UNILAG Hackathon features total prizes of ₦1,500,000, sponsor mentorship from top tech companies, and free refreshments. Form teams of 3-4 students across 100L-500L.",
      category: "Event",
      pinned: true,
      authorOfficeSlug: "software-director",
    },
    {
      title: "Departmental Dues Payment Deadline & Clearance Notice",
      body: "All students are advised to pay their departmental dues before the upcoming exam clearance exercise. Payment details and online verification receipt generator are available on the NACOS Hub.",
      category: "Deadline",
      pinned: false,
      authorOfficeSlug: "financial-secretary",
    },
    {
      title: "Free AWS & Cloud Engineering Bootcamp for 200L/300L",
      body: "The Directorate of Software in partnership with AWS Cloud Club UNILAG is hosting a 4-week cloud engineering masterclass covering Docker, Kubernetes, and Serverless deployment.",
      category: "Academic",
      pinned: false,
      authorOfficeSlug: "software-director",
    },
    {
      title: "SIWES Defense Preparation Workshop for 400L Students",
      body: "Learn how to write a top-grade SIWES logbook and deliver an outstanding oral presentation before the departmental panel. Mock defense sessions start next Wednesday.",
      category: "Academic",
      pinned: false,
      authorOfficeSlug: "general-secretary",
    },
    {
      title: "NACOS Sports Festival & E-Sports Championship",
      body: "Get ready for the annual NACOS Sports Week! Inter-level FIFA 26 tournament, 5-a-side football, and chess championships kick off at the UNILAG Sports Centre.",
      category: "General",
      pinned: false,
      authorOfficeSlug: "sports-secretary",
    },
  ];

  for (const ann of announcementsData) {
    await prisma.announcement.create({ data: ann });
  }
  console.log("Seeded 6 Announcements.");

  // 3. Calendar Events (Relative to today)
  const today = new Date();
  const addDays = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d;
  };

  const calendarEventsData = [
    {
      title: "CSC 301 Data Structures Mid-Semester Test",
      description: "Mandatory mid-term assessment for all 300L Computer Science students in Lab 2.",
      location: "Computer Science Main Lab 2",
      startsAt: addDays(2),
      endsAt: addDays(2),
      category: "Academic",
    },
    {
      title: "NACOS Hackathon 2026 Kickoff & Mentorship",
      description: "Opening ceremony, problem statement announcement, and team pairing.",
      location: "Faculty of Science Auditorium",
      startsAt: addDays(5),
      endsAt: addDays(6),
      category: "Hackathon",
    },
    {
      title: "Git, GitHub & Open Source Masterclass",
      description: "Hands-on workshop on version control, branching strategies, and open-source contribution.",
      location: "New Science Complex Room 104",
      startsAt: addDays(8),
      endsAt: addDays(8),
      category: "Workshop",
    },
    {
      title: "SIWES Defense Orientation & Logbook Review",
      description: "Preparation session for returning 400L SIWES students ahead of faculty defense.",
      location: "CSC Lecture Theatre",
      startsAt: addDays(12),
      endsAt: addDays(12),
      category: "Academic",
    },
    {
      title: "NACOS Freshers Welcome & Tech Fireside Chat",
      description: "Welcome event for 100L freshers featuring talks from senior software engineers and alumni.",
      location: "UNILAG Lagoon Front Park",
      startsAt: addDays(15),
      endsAt: addDays(15),
      category: "Social",
    },
    {
      title: "Inter-Level FIFA 26 & Chess Championship",
      description: "Annual NACOS esports competition with trophies and cash prizes.",
      location: "Student Union Building (SUB) Hall",
      startsAt: addDays(18),
      endsAt: addDays(18),
      category: "Sports",
    },
    {
      title: "NACOS Tech Career Fair & Internship Drive",
      description: "Meet recruiters from Paystack, Flutterwave, Moniepoint, and Kuda Bank.",
      location: "Faculty of Science Foyer",
      startsAt: addDays(22),
      endsAt: addDays(22),
      category: "Career",
    },
    {
      title: "NACOS End-of-Semester Dinner & Awards Night",
      description: "Celebrating academic excellence, tech achievements, and departmental leadership.",
      location: "UNILAG Multi-Purpose Hall (MPH)",
      startsAt: addDays(30),
      endsAt: addDays(30),
      category: "Social",
    },
  ];

  for (const ev of calendarEventsData) {
    await prisma.calendarEvent.create({ data: ev });
  }
  console.log("Seeded 8 Calendar Events.");

  // 4. Documents
  const documentsData = [
    {
      title: "NACOS UNILAG Constitution (Revised 2025)",
      description: "The official governing constitution of the Nigerian Association of Computing Students, UNILAG Chapter.",
      category: "Handbook",
      fileUrl: "https://example.com/docs/nacos-unilag-constitution.pdf",
    },
    {
      title: "Departmental Dues Payment & Receipt Form",
      description: "Official form and instructions for paying annual departmental dues.",
      category: "Form",
      fileUrl: "https://example.com/docs/dues-payment-form.pdf",
    },
    {
      title: "SIWES Recommendation Letter Request Form",
      description: "Template form required to obtain an official IT recommendation letter signed by HOD.",
      category: "Official Letter",
      fileUrl: "https://example.com/docs/siwes-letter-request.docx",
    },
    {
      title: "Course Registration Guide for 100L - 500L",
      description: "Comprehensive guide to required core and elective courses for Computer Science.",
      category: "Handbook",
      fileUrl: "https://example.com/docs/course-registration-guide.pdf",
    },
    {
      title: "NACOS Hackathon Sponsorship Proposal Template",
      description: "Official sponsorship proposal deck for student lead initiatives and hackathons.",
      category: "Proposal",
      fileUrl: "https://example.com/docs/hackathon-sponsorship-proposal.pdf",
    },
    {
      title: "Academic Grievance & Grade Review Application",
      description: "Standard application form to lodge grade verification requests with the Directorate of Academics.",
      category: "Form",
      fileUrl: "https://example.com/docs/grade-review-form.pdf",
    },
    {
      title: "NACOS Committee Application & Volunteer Form",
      description: "Join the Secretariat, Welfare, Media, or Software committees.",
      category: "Form",
      fileUrl: "https://example.com/docs/committee-volunteer-form.pdf",
    },
    {
      title: "Past Exam Questions Bank (CSC 201 - CSC 405)",
      description: "Curated repository of past exam papers and solution marking schemes.",
      category: "Template",
      fileUrl: "https://example.com/docs/past-questions-archive.zip",
    },
    {
      title: "Event Budget Approval Template",
      description: "Official financial budget breakdown template for departmental event leads.",
      category: "Template",
      fileUrl: "https://example.com/docs/event-budget-template.xlsx",
    },
    {
      title: "NACOS Project Defense Logbook Sample",
      description: "Sample final year project defense presentation outline and documentation standard.",
      category: "Handbook",
      fileUrl: "https://example.com/docs/project-defense-sample.pdf",
    },
  ];

  for (const doc of documentsData) {
    await prisma.document.create({ data: doc });
  }
  console.log("Seeded 10 Documents.");

  // 5. SIWES Placements (10 fictional placements with realistic Nigerian tech companies)
  const siwesData = [
    {
      studentName: "Damilola Adeyemi",
      level: "400L",
      company: "Paystack",
      role: "Backend Engineering Intern",
      techStack: "Node.js, TypeScript, PostgreSQL, Redis",
      city: "Lagos (Yaba)",
      startDate: "2026-03-01",
      endDate: "2026-08-31",
      howIGotIn: "Applied via Paystack early careers portal; prepared 2 GitHub backend projects.",
      tipsToApply: "Build a solid REST API project on GitHub. Practice data structures in JavaScript and be ready to explain async programming clearly during technical interviews.",
      contactPreference: "LinkedIn only",
      consentGiven: true,
      isApproved: true,
    },
    {
      studentName: "Emeka Nwosu",
      level: "400L",
      company: "Flutterwave",
      role: "Frontend Developer Intern",
      techStack: "React, Next.js, Tailwind CSS, Redux",
      city: "Lagos (Victoria Island)",
      startDate: "2026-03-15",
      endDate: "2026-09-15",
      howIGotIn: "Submitted portfolio during the UNILAG NACOS tech exhibition.",
      tipsToApply: "Ensure your portfolio site is clean and responsive. Showcase interactive web applications with real API integrations.",
      contactPreference: "email via the Hub",
      consentGiven: true,
      isApproved: true,
    },
    {
      studentName: "Fatima Aliyu",
      level: "400L",
      company: "Moniepoint",
      role: "Mobile App Engineer Intern",
      techStack: "Flutter, Dart, Firebase",
      city: "Lagos (Lekki)",
      startDate: "2026-02-15",
      endDate: "2026-08-15",
      howIGotIn: "Showcased a published mobile banking demo on Google Play Store.",
      tipsToApply: "Focus on clean architecture in Flutter. Having a live app on Play Store gives you a huge advantage during selection.",
      contactPreference: "none",
      consentGiven: true,
      isApproved: true,
    },
    {
      studentName: "Kelechi Iheanacho",
      level: "400L",
      company: "Interswitch Group",
      role: "DevOps & Cloud Intern",
      techStack: "Docker, Kubernetes, AWS, Linux Shell",
      city: "Lagos (Victoria Island)",
      startDate: "2026-04-01",
      endDate: "2026-09-30",
      howIGotIn: "Direct assessment test via the Interswitch Developer community.",
      tipsToApply: "Understand Linux fundamentals, basic containerization with Docker, and CI/CD pipeline concepts.",
      contactPreference: "LinkedIn only",
      consentGiven: true,
      isApproved: true,
    },
    {
      studentName: "Zainab Bello",
      level: "400L",
      company: "Kuda Microfinance Bank",
      role: "Product Management Intern",
      techStack: "Jira, Figma, Mixpanel, SQL",
      city: "Lagos (Lekki)",
      startDate: "2026-03-01",
      endDate: "2026-08-31",
      howIGotIn: "Submitted a 5-page teardown of a fintech onboarding UX flow.",
      tipsToApply: "Prepare product case studies. Understand user onboarding flows, metrics, and wireframing.",
      contactPreference: "none",
      consentGiven: true,
      isApproved: true,
    },
    {
      studentName: "Tunde Oladipo",
      level: "400L",
      company: "Andela",
      role: "Software Engineering Fellow",
      techStack: "Python, Django, React, GraphQL",
      city: "Remote (Lagos)",
      startDate: "2026-03-01",
      endDate: "2026-08-31",
      howIGotIn: "Passed Andela Technical Assessment coding challenges.",
      tipsToApply: "Practice technical communication. Soft skills and problem-solving explanation matter as much as coding.",
      contactPreference: "LinkedIn only",
      consentGiven: true,
      isApproved: true,
    },
    {
      studentName: "Blessing Ogbonna",
      level: "400L",
      company: "PiggyVest",
      role: "Cybersecurity Analyst Intern",
      techStack: "Wireshark, Python, Burp Suite, Linux",
      city: "Lagos (Ikeja)",
      startDate: "2026-04-01",
      endDate: "2026-09-30",
      howIGotIn: "Referral following the NACOS annual CTF tournament.",
      tipsToApply: "Participate in CTF competitions and show certifications like CompTIA Security+ or TryHackMe rooms.",
      contactPreference: "email via the Hub",
      consentGiven: true,
      isApproved: true,
    },
    {
      studentName: "Samuel Ajayi",
      level: "400L",
      company: "Horizon Labs",
      role: "AI & Machine Learning Intern",
      techStack: "Python, PyTorch, Scikit-Learn, Pandas",
      city: "Lagos (Yaba)",
      startDate: "2026-03-15",
      endDate: "2026-09-15",
      howIGotIn: "Shared NLP classification demo on HuggingFace Spaces.",
      tipsToApply: "Clean data pipeline projects and HuggingFace spaces demonstration make your application stand out.",
      contactPreference: "none",
      consentGiven: true,
      isApproved: true,
    },
    {
      studentName: "Halimat Danjuma",
      level: "400L",
      company: "Nomba",
      role: "QA & Test Automation Intern",
      techStack: "Cypress, Playwright, Jest, JavaScript",
      city: "Lagos (Ikeja)",
      startDate: "2026-03-01",
      endDate: "2026-08-31",
      howIGotIn: "Applied via student internship drive hosted by NACOS.",
      tipsToApply: "Learn end-to-end automation with Playwright. Test cases and boundary testing skills are highly valued.",
      contactPreference: "LinkedIn only",
      consentGiven: true,
      isApproved: true,
    },
    {
      studentName: "Olamide Bakare",
      level: "400L",
      company: "FairMoney",
      role: "Data Engineering Intern",
      techStack: "PostgreSQL, Python, Apache Airflow, dbt",
      city: "Lagos (Victoria Island)",
      startDate: "2026-04-01",
      endDate: "2026-10-01",
      howIGotIn: "Submitted a data pipeline portfolio project processing public Nigerian financial data.",
      tipsToApply: "Master SQL window functions and basic ETL pipelines before your interview.",
      contactPreference: "email via the Hub",
      consentGiven: true,
      isApproved: true,
    },
  ];

  for (const s of siwesData) {
    await prisma.siwesPlacement.create({ data: s });
  }
  console.log("Seeded 10 SIWES Placements.");

  // 5b. Alumni Directory (6 fictional alumni with realistic Nigerian tech companies)
  const alumniData = [
    {
      name: "Dr. Adebayo Ogunlesi",
      graduationYear: "2019",
      currentCompany: "Moniepoint",
      currentRole: "Principal Systems Architect",
      city: "Lagos",
      techStack: "Go, Distributed Systems, Kafka, Kubernetes",
      advice: "Master core computer science fundamentals. Frameworks change every 3 years, but algorithms, memory models, and networking protocols remain timeless.",
      linkedinUrl: "https://linkedin.com/in/example-adebayo",
      consentGiven: true,
      isApproved: true,
    },
    {
      name: "Chiamaka Eze",
      graduationYear: "2021",
      currentCompany: "Paystack",
      currentRole: "Staff Software Engineer",
      city: "Lagos",
      techStack: "TypeScript, Node.js, AWS, Postgres",
      advice: "Build in public. Your side projects and willingness to write clear technical documentation will open doors faster than just your degree.",
      linkedinUrl: "https://linkedin.com/in/example-chiamaka",
      consentGiven: true,
      isApproved: true,
    },
    {
      name: "Farouk Abdullahi",
      graduationYear: "2020",
      currentCompany: "Flutterwave",
      currentRole: "Engineering Manager (Payments)",
      city: "Lagos",
      techStack: "Java, Spring Boot, Microservices, Redis",
      advice: "Learn how to collaborate in teams. Soft skills, code reviews, and empathetic communication are what elevate senior engineers into leadership.",
      linkedinUrl: "https://linkedin.com/in/example-farouk",
      consentGiven: true,
      isApproved: true,
    },
    {
      name: "Ngozi Adeleke",
      graduationYear: "2022",
      currentCompany: "Google",
      currentRole: "Cloud Solutions Architect",
      city: "London / Remote",
      techStack: "GCP, Terraform, Python, Docker",
      advice: "Pursue cloud certifications early (AWS, GCP, Azure) and contribute to open source. The global tech market values verified practical implementations.",
      linkedinUrl: "https://linkedin.com/in/example-ngozi",
      consentGiven: true,
      isApproved: true,
    },
    {
      name: "Segun Arinze",
      graduationYear: "2023",
      currentCompany: "Kuda Bank",
      currentRole: "Mobile Engineering Lead",
      city: "Lagos",
      techStack: "Kotlin, Swift, Flutter, Architecture Components",
      advice: "Focus on application performance, battery efficiency, and offline resilience when building mobile solutions for the African market.",
      linkedinUrl: "https://linkedin.com/in/example-segun",
      consentGiven: true,
      isApproved: true,
    },
    {
      name: "Yetunde Soyinka",
      graduationYear: "2021",
      currentCompany: "PiggyVest",
      currentRole: "Head of Product Security",
      city: "Lagos",
      techStack: "AppSec, OAuth2, DevSecOps, Python",
      advice: "Security is everyone's responsibility. Understand OWASP Top 10 before writing production code, and never hardcode secrets.",
      linkedinUrl: "https://linkedin.com/in/example-yetunde",
      consentGiven: true,
      isApproved: true,
    },
  ];

  for (const a of alumniData) {
    await prisma.alumnus.create({ data: a });
  }
  console.log("Seeded 6 Alumni records.");


  // 6. Pulse Poll & Votes
  const poll = await prisma.pulsePoll.create({
    data: {
      question: "Which tech stack or track should NACOS prioritize for the upcoming 6-week Masterclass Bootcamp?",
      options: JSON.stringify([
        "Full-Stack Web Dev (Next.js & Node.js)",
        "Mobile App Development (Flutter & React Native)",
        "Cloud Engineering & DevOps (AWS & Docker)",
        "Cybersecurity & Ethical Hacking",
      ]),
      isActive: true,
    },
  });

  const mockVotes = [
    "Full-Stack Web Dev (Next.js & Node.js)",
    "Full-Stack Web Dev (Next.js & Node.js)",
    "Full-Stack Web Dev (Next.js & Node.js)",
    "Full-Stack Web Dev (Next.js & Node.js)",
    "Cloud Engineering & DevOps (AWS & Docker)",
    "Cloud Engineering & DevOps (AWS & Docker)",
    "Mobile App Development (Flutter & React Native)",
    "Mobile App Development (Flutter & React Native)",
    "Cybersecurity & Ethical Hacking",
  ];

  for (const opt of mockVotes) {
    await prisma.pulseVote.create({
      data: {
        pollId: poll.id,
        option: opt,
      },
    });
  }
  console.log("Seeded 1 Pulse Poll with votes.");

  // 7. Concerns & Updates (Sample data for tracking ID test)
  const concernsSample = [
    {
      trackingId: "NH-2026-A1B2",
      category: "Academics",
      subject: "CSC 201 Practical Lab Timetable Clash",
      message: "The 200L CSC 201 practical lab on Tuesday at 2 PM clashes directly with the General Studies (GST 212) lecture in the Main Auditorium. Over 80 students are affected.",
      isAnonymous: false,
      senderName: "Boluwatife Williams",
      senderEmail: "bolu.williams@example.com",
      level: "200L",
      targetOfficeSlug: "vice-president",
      status: "RESOLVED",
      publicResponse: "The Directorate of Academics liaised with the GST department and HOD. CSC 201 Lab session 2 has been moved to Wednesday 8 AM.",
      updates: [
        { status: "RECEIVED", note: "Concern registered and routed to Vice President." },
        { status: "BEING_HANDLED", note: "Meeting held with GST Coordinator and CSC Lab Manager." },
        { status: "RESOLVED", note: "Lab schedule updated on departmental notice board." },
      ],
    },
    {
      trackingId: "NH-2026-C3D4",
      category: "Welfare",
      subject: "Faulty AC and Poor Lighting in Computer Science Lab 1",
      message: "Three air conditioners in Lab 1 have not been functioning for 2 weeks, making afternoon practicals extremely uncomfortable for students.",
      isAnonymous: true,
      senderName: null,
      senderEmail: null,
      level: "300L",
      targetOfficeSlug: "welfare-secretary",
      status: "BEING_HANDLED",
      publicResponse: "Welfare team inspected Lab 1 with Faculty Works department. Maintenance team scheduled to service units on Thursday.",
      updates: [
        { status: "RECEIVED", note: "Concern submitted anonymously." },
        { status: "BEING_HANDLED", note: "Inspection completed with Faculty Maintenance unit." },
      ],
    },
    {
      trackingId: "NH-2026-E5F6",
      category: "Finance/Dues",
      subject: "Online Dues Clearance Receipt Verification Issue",
      message: "I completed payment via bank transfer 3 days ago but my online status still shows pending clearance.",
      isAnonymous: false,
      senderName: "Chisom Eke",
      senderEmail: "chisom.eke@example.com",
      level: "100L",
      targetOfficeSlug: "financial-secretary",
      status: "RECEIVED",
      publicResponse: null,
      updates: [
        { status: "RECEIVED", note: "Awaiting bank statement reconciliation by Financial Secretary." },
      ],
    },
  ];

  for (const c of concernsSample) {
    const { updates, ...cData } = c;
    const createdConcern = await prisma.concern.create({ data: cData });
    for (const u of updates) {
      await prisma.concernUpdate.create({
        data: {
          concernId: createdConcern.id,
          status: u.status,
          note: u.note,
        },
      });
    }
  }
  console.log("Seeded 3 Sample Concerns with audit updates.");

  const demoDuesMembers = [
    { memberCode: "DEMO-1001", displayName: "Mock Member One", level: "100L", status: "PAID", amountPaid: 2500, receiptRef: "DEMO-RCPT-01", paidAt: new Date() },
    { memberCode: "DEMO-2001", displayName: "Mock Member Two", level: "200L", status: "UNPAID", amountPaid: 0, receiptRef: null, paidAt: null },
    { memberCode: "DEMO-3001", displayName: "Mock Member Three", level: "300L", status: "PAID", amountPaid: 2500, receiptRef: "DEMO-RCPT-02", paidAt: new Date() },
    { memberCode: "DEMO-4001", displayName: "Mock Member Four", level: "400L", status: "UNPAID", amountPaid: 0, receiptRef: null, paidAt: null },
  ];
  for (const member of demoDuesMembers) {
    await prisma.duesMember.upsert({
      where: { memberCode: member.memberCode },
      create: member,
      update: member,
    });
  }
  console.log("Seeded four mock dues records.");
  console.log("Database Seeding Completed Successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
