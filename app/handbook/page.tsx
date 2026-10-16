"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Search, ChevronDown, Send } from "lucide-react";

interface AccordionItem {
  id: string;
  category: string;
  question: string;
  answer: string[];
}

const HANDBOOK_ITEMS: AccordionItem[] = [
  {
    id: "office-duties",
    category: "Executive Duties",
    question: "What does each NACOS executive office actually do?",
    answer: [
      "President: Overall departmental lead, university administration advocacy, and external sponsorship deals.",
      "Vice President: Coordinates female tech initiatives, mentorship circles, and internal committee leads.",
      "General Secretary: Secretariat head, official letters, meeting minutes, constitutional records, and NACOS Hub concern tracking.",
      "Assistant General Secretary: Assists Secretariat documentation, meeting logistics, and student records.",
      "Financial Secretary: Collects departmental dues, issues clearance receipts, and maintains financial ledgers.",
      "Treasurer: Oversees departmental bank accounts, budget disbursements, and vendor audits.",
      "PRO: Broadcasts official announcements, handles press coverage, social channels, and media partnerships.",
      "Social Secretary: Organizes hackathons social night, freshers orientation, gaming tournaments, and annual dinner.",
      "Sports Secretary: Coordinates Dean's Cup team, inter-level football matches, and e-sports leagues.",
      "Welfare Secretary: Manages lab facilities, AC/lighting complaints, lecture hall acoustics, and emergency student aid.",
      "Software Director: Leads developer masterclasses, open-source projects, code labs, and portal maintenance.",
    ],
  },
  {
    id: "official-letter",
    category: "Administrative Requests",
    question: "How do I request an official NACOS letter or HOD recommendation?",
    answer: [
      "1. Go to the Document Vault on NACOS Hub and download the SIWES / Official Letter Request Form.",
      "2. Fill in your full student name, matriculation number, course level, and target organization details.",
      "3. Submit a concern on NACOS Hub categorized under General/Other addressed to the General Secretary.",
      "4. The Secretariat will process and issue an official stamped recommendation letter signed by the HOD within 48 business hours.",
    ],
  },
  {
    id: "dues-clearance",
    category: "Finance and Dues",
    question: "How do I pay departmental dues and get my online clearance receipt?",
    answer: [
      "1. Pay annual NACOS UNILAG departmental dues into the official UNILAG NACOS Bank Account provided in announcements.",
      "2. Keep your bank transfer receipt reference.",
      "3. Submit your payment receipt to the Financial Secretary or verify online on NACOS Hub.",
      "4. Your clearance status will be updated to RESOLVED and your official digital receipt will be downloadable.",
    ],
  },
  {
    id: "join-committee",
    category: "Student Involvement",
    question: "How do I join a NACOS executive committee or volunteer for events?",
    answer: [
      "NACOS operates four active student committees:",
      "- Software and Dev Committee (led by the Software Director)",
      "- Media and Publicity Unit (led by PRO)",
      "- Welfare and Student Aid Taskforce (led by the Welfare Secretary)",
      "- Academic and Tutorials Circle (coordinated by the Vice President)",
      "Applications open at the start of every semester. Check the Document Vault for the Committee Application Form.",
    ],
  },
  {
    id: "elections-constitution",
    category: "Elections and Governance",
    question: "How do NACOS UNILAG elections work and who is eligible to vote?",
    answer: [
      "- Elections take place at the end of the academic session under the supervision of the Independent Electoral Committee (IEC).",
      "- All matriculated Computer Science students who have cleared their annual departmental dues are eligible to vote.",
      "- Campaigning rules, candidate manifestos, and voting portals are published officially on NACOS Hub.",
    ],
  },
  {
    id: "academic-complaint",
    category: "Academic Support",
    question: "Who do I contact if I have a timetable clash or grade recording issue?",
    answer: [
      "Submit a routed concern on NACOS Hub under Academics. The Vice President works directly with Course Representatives and the Departmental Examination Officer to resolve practical lab clashes and grade verification requests.",
    ],
  },
];

export default function HandbookPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState<string[]>(["office-duties"]);

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredItems = HANDBOOK_ITEMS.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchQuestion = item.question.toLowerCase().includes(q);
    const matchCategory = item.category.toLowerCase().includes(q);
    const matchAnswer = item.answer.some((line) => line.toLowerCase().includes(q));
    return matchQuestion || matchCategory || matchAnswer;
  });

  return (
    <div className="space-y-8 pb-8 max-w-3xl mx-auto">
      {/* HEADER */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-mint/10 border border-mint/20 px-3 py-1 text-xs font-semibold text-mint">
          <BookOpen className="h-3.5 w-3.5" />
          How NACOS UNILAG Works
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-navy-heading">
          Student Handbook
        </h1>
        <p className="text-xs md:text-sm text-navy-body">
          Everything you need to know about departmental governance, requesting official letters, paying dues, joining committees, and resolving complaints.
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-subtle" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search handbook (e.g., 'Official Letter', 'Dues', 'Academics')..."
          className="w-full rounded-2xl border border-navy-border bg-navy-card py-3.5 pl-10 pr-4 text-xs md:text-sm text-navy-heading placeholder:text-navy-subtle focus:border-mint focus:outline-none"
        />
      </div>

      {/* ACCORDION LIST */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-navy-border bg-navy-card">
            <p className="text-sm text-navy-body">No handbook topic found matching &quot;{searchQuery}&quot;.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl border transition-colors overflow-hidden bg-navy-card ${
                openIds.includes(item.id) ? "border-mint/40" : "border-navy-border"
              }`}
            >
              <button
                onClick={() => toggleAccordion(item.id)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-navy-cardHover transition-colors min-h-touch"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-navy-bgStart text-mint border border-mint/20">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-sm md:text-base text-navy-heading">
                    {item.question}
                  </h3>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-mint transition-transform duration-200 shrink-0 ${
                    openIds.includes(item.id) ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openIds.includes(item.id) && (
                <div className="px-5 pb-5 pt-2 text-xs md:text-sm text-navy-body leading-relaxed space-y-1.5 border-t border-navy-border/50">
                  {item.answer.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* FOOTER NEED MORE HELP BANNER */}
      <div className="p-6 rounded-3xl border border-navy-border bg-navy-card text-center space-y-3">
        <h3 className="font-bold text-base text-navy-heading">Still have a question not answered here?</h3>
        <p className="text-xs text-navy-body max-w-md mx-auto">
          Submit your question directly to the General Secretary or responsible director.
        </p>
        <Link
          href="/concern"
          className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-xl shadow min-h-touch"
        >
          <Send className="h-4 w-4" /> Reach an Exec Now
        </Link>
      </div>
    </div>
  );
}
