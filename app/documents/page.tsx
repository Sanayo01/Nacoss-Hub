"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Search,
  Download,
  ExternalLink,
  Shield,
  FileCheck,
  FolderOpen,
} from "lucide-react";

interface DocumentItem {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  updatedAt: string;
}

const CATEGORIES = ["All", "Official Letter", "Proposal", "Form", "Template", "Handbook"];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await fetch("/api/documents");
        const json = await res.json();
        if (json.success) {
          setDocuments(json.data);
        }
      } catch (err) {
        console.error("Failed to load documents:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, []);

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-8 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-mint/10 border border-mint/20 px-3 py-1 text-xs font-semibold text-mint">
          <FolderOpen className="h-3.5 w-3.5" />
          NACOSS UNILAG Official Document Repository
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-navy-heading">
          Document Vault
        </h1>
        <p className="text-xs md:text-sm text-navy-body">
          Official letters, proposals, clearance forms, past exam banks, and templates in one place. No more lost PDF links on WhatsApp groups.
        </p>
      </div>

      {/* SEARCH BAR & CATEGORY TABS */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title or description..."
            className="w-full rounded-2xl border border-navy-border bg-navy-card py-3 pl-10 pr-4 text-xs md:text-sm text-navy-heading placeholder:text-navy-subtle focus:border-mint focus:outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors whitespace-nowrap min-h-touch ${
                selectedCategory === cat
                  ? "border-mint bg-mint text-navy-onAccent"
                  : "border-navy-border bg-navy-card text-navy-body hover:text-navy-heading"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* DOCUMENT GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-navy-card/40 animate-pulse border border-navy-border" />
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-navy-border bg-navy-card">
          <p className="text-sm text-navy-body">No documents found matching &quot;{searchQuery}&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-3xl border border-navy-border bg-navy-card hover:bg-navy-cardHover transition-colors flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-mint/10 text-mint border border-mint/20">
                    {doc.category}
                  </span>
                  <span className="text-[10px] font-mono text-navy-subtle">
                    Updated {new Date(doc.updatedAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-bgStart border border-navy-border text-mint group-hover:border-mint transition-colors">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-navy-heading group-hover:text-mint transition-colors line-clamp-1">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-navy-body line-clamp-2 mt-0.5">{doc.description}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-navy-border/50 flex items-center justify-between">
                <span className="text-[11px] text-navy-subtle font-mono">PDF / DOCX File</span>

                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-xl shadow transition-colors flex items-center gap-1.5 min-h-touch"
                >
                  <Download className="h-3.5 w-3.5" /> Download / Open
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
