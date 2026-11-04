import { ShieldAlert } from 'lucide-react';

export default function UnavailableModuleNotice({ title, description }: { title: string; description: string }) {
  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-black/10 bg-[#f7f8fa] p-8 shadow-sm">
      <span className="mb-5 inline-flex rounded-2xl bg-[#080909] p-3 text-[#c4b5fd]"><ShieldAlert className="h-6 w-6" /></span>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">Planned feature</p>
      <h2 className="mt-2 font-epilogue text-2xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65">{description}</p>
    </section>
  );
}
