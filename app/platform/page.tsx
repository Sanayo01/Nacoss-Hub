import { StudentPlatformRequestForm } from "@/components/office/ThreeOfficeWorkspaces";

export default function PlatformFeedbackPage() {
  return <section className="mx-auto max-w-3xl space-y-5">
    <header><p className="text-xs font-bold uppercase tracking-widest text-mint">NACOSS Hub feedback</p><h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Platform bug or feature request</h1>
      <p className="mt-1 text-sm text-navy-body">Send a platform issue or improvement idea to the Software Director. Avoid including passwords, sensitive information, or real student records.</p></header>
    <StudentPlatformRequestForm />
  </section>;
}
