"use client";

import { useEffect, useState } from "react";
import { Activity, Check, Lock, Archive, Sparkles, BarChart2 } from "lucide-react";

interface PulseVote {
  id: string;
  option: string;
}

interface PulsePoll {
  id: string;
  question: string;
  options: string; // JSON array string
  isActive: boolean;
  createdAt: string;
  votes: PulseVote[];
}

export default function PulsePage() {
  const [activePoll, setActivePoll] = useState<PulsePoll | null>(null);
  const [archivePolls, setArchivePolls] = useState<PulsePoll[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOption, setVotedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const res = await fetch("/api/pulse");
      const json = await res.json();
      if (json.success) {
        setActivePoll(json.activePoll);
        setArchivePolls(json.archivePolls || []);

        if (json.activePoll) {
          const localKey = `voted_pulse_${json.activePoll.id}`;
          const savedVote = localStorage.getItem(localKey);
          if (savedVote) {
            setHasVoted(true);
            setVotedOption(savedVote);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load pulse polls:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (option: string) => {
    if (!activePoll || hasVoted) return;

    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pollId: activePoll.id,
          option,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to record vote");
      }

      setHasVoted(true);
      setVotedOption(option);
      localStorage.setItem(`voted_pulse_${activePoll.id}`, option);
      if (json.poll) {
        setActivePoll(json.poll);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to cast vote.");
    } finally {
      setSubmitting(false);
    }
  };

  const calculatePollResults = (poll: PulsePoll) => {
    let optionsList: string[] = [];
    try {
      optionsList = JSON.parse(poll.options);
    } catch (e) {
      optionsList = [];
    }

    const totalVotes = poll.votes ? poll.votes.length : 0;
    const counts: Record<string, number> = {};
    optionsList.forEach((opt) => (counts[opt] = 0));

    if (poll.votes) {
      poll.votes.forEach((v) => {
        counts[v.option] = (counts[v.option] || 0) + 1;
      });
    }

    return optionsList.map((opt) => {
      const count = counts[opt] || 0;
      const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      return { option: opt, count, percentage };
    });
  };

  return (
    <div className="space-y-8 pb-8 max-w-3xl mx-auto">
      {/* HEADER */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-mint/10 border border-mint/20 px-3 py-1 text-xs font-semibold text-mint">
          <Activity className="h-3.5 w-3.5" />
          NACOSS UNILAG Student Pulse
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-navy-heading">
          Departmental Pulse Polls
        </h1>
        <p className="text-xs md:text-sm text-navy-body max-w-xl">
          Anonymous one-tap voting on upcoming masterclass tracks, hackathon themes, and departmental decisions. No student identity stored.
        </p>
      </div>

      {/* ACTIVE POLL CARD */}
      {loading ? (
        <div className="h-64 rounded-3xl bg-navy-card/40 animate-pulse border border-navy-border" />
      ) : !activePoll ? (
        <div className="p-8 rounded-3xl border border-navy-border bg-navy-card text-center text-xs text-navy-body">
          No active poll at the moment.
        </div>
      ) : (
        <div className="p-6 md:p-8 rounded-3xl border border-mint/30 bg-gradient-to-br from-navy-card via-navy-bgStart to-navy-card space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-mint animate-pulse" />
              <span className="text-xs font-bold uppercase text-mint tracking-wider">
                Live Active Poll
              </span>
            </div>
            <span className="text-[11px] font-mono text-navy-subtle">
              Total Votes: {activePoll.votes ? activePoll.votes.length : 0}
            </span>
          </div>

          <h2 className="text-lg md:text-2xl font-bold text-navy-heading leading-snug">
            {activePoll.question}
          </h2>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {errorMsg}
            </div>
          )}

          {/* POLL OPTIONS & RESULTS */}
          <div className="space-y-3">
            {calculatePollResults(activePoll).map(({ option, count, percentage }) => {
              const isSelected = votedOption === option;

              return (
                <div
                  key={option}
                  onClick={() => !hasVoted && handleVote(option)}
                  className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${
                    hasVoted
                      ? isSelected
                        ? "border-mint bg-mint/15 shadow-md"
                        : "border-navy-border bg-navy-bgStart/80"
                      : "cursor-pointer border-navy-border bg-navy-bgStart hover:bg-navy-cardHover hover:border-mint/40"
                  }`}
                >
                  {/* Animated Result Bar background */}
                  {hasVoted && (
                    <div
                      className="absolute inset-y-0 left-0 bg-mint/15 transition-all duration-700 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  )}

                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {!hasVoted && (
                        <div className="h-4 w-4 rounded-full border border-navy-subtle flex items-center justify-center shrink-0" />
                      )}
                      {hasVoted && isSelected && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-mint text-navy-onAccent shrink-0">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <span className="text-xs md:text-sm font-semibold text-navy-heading">
                        {option}
                      </span>
                    </div>

                    {hasVoted && (
                      <span className="text-xs font-mono font-bold text-mint shrink-0">
                        {percentage}% ({count})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-navy-subtle pt-2 border-t border-navy-border">
            <span className="flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-mint" /> 1 Vote Per Device (Anonymous)
            </span>
            {hasVoted && <span className="text-mint font-semibold">Your vote has been recorded!</span>}
          </div>
        </div>
      )}

      {/* ARCHIVE POLLS */}
      {archivePolls.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-mint" />
            <h3 className="font-bold text-sm uppercase text-navy-heading tracking-wide">
              Past Poll Archives & Published Results
            </h3>
          </div>

          <div className="space-y-4">
            {archivePolls.map((pastPoll) => (
              <div
                key={pastPoll.id}
                className="p-5 rounded-3xl border border-navy-border bg-navy-card space-y-3"
              >
                <h4 className="font-bold text-sm text-navy-heading">{pastPoll.question}</h4>
                <div className="space-y-2">
                  {calculatePollResults(pastPoll).map(({ option, count, percentage }) => (
                    <div key={option} className="space-y-1 text-xs">
                      <div className="flex justify-between text-navy-body">
                        <span>{option}</span>
                        <span className="font-mono text-mint font-bold">{percentage}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-navy-bgStart overflow-hidden">
                        <div
                          className="h-full bg-mint/60 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
