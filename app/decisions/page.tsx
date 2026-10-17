import { getPublishedDecisionDigests } from "@/lib/minutes-workflow";

export const dynamic = "force-dynamic";

export default async function DecisionsPage() {
  const digests = await getPublishedDecisionDigests();
  return <main className="mx-auto min-h-screen max-w-4xl space-y-6 px-4 py-12">
    <header><p className="text-xs font-bold uppercase tracking-widest text-mint">NACOSS Hub · public records</p>
      <h1 className="mt-2 text-3xl font-extrabold text-navy-heading">Decision Digest</h1>
      <p className="mt-2 text-sm text-navy-body">Only decisions marked shareable in approved meeting minutes are published here.</p></header>
    {digests.map((digest) => <article key={digest.id} className="rounded-2xl border border-navy-border bg-navy-card p-5">
      <h2 className="font-bold text-navy-heading">{digest.title}</h2>
      <p className="mt-1 text-xs text-navy-subtle">{digest.publishedAt?.toLocaleDateString()}</p>
      <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-navy-body">{digest.content || "No shareable decisions were recorded."}</div>
    </article>)}
    {!digests.length && <p className="rounded-2xl border border-navy-border bg-navy-card p-5 text-sm text-navy-body">No approved digests have been published.</p>}
  </main>;
}
