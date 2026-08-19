import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const submit = (e) => {
    e.preventDefault();
    toast.success("Thanks! Your message has been received.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };
  return (
    <div className="container-page py-12 md:py-20">
      <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8">
        <section>
          <p className="text-indigo-600 font-semibold">CUSTOMER SUPPORT</p>
          <h1 className="text-5xl font-black mt-3">Let’s talk.</h1>
          <p className="text-slate-500 leading-7 mt-5">Questions about products, orders, returns or your account? Send us a message and the support team can follow up.</p>
          <div className="space-y-4 mt-8">
            <Info icon={<Mail />} title="Email" value="support@commercescale.local" />
            <Info icon={<Phone />} title="Phone" value="+91 1800 123 4567" />
            <Info icon={<MapPin />} title="Office" value="Jaipur, Rajasthan, India" />
          </div>
          <div className="mt-8 rounded-2xl bg-slate-950 text-white p-6"><p className="font-bold">Support hours</p><p className="text-slate-400 mt-2 text-sm">Monday–Saturday · 9:00 AM–7:00 PM IST</p></div>
        </section>

        <form onSubmit={submit} className="card p-6 md:p-8">
          <h2 className="text-2xl font-black">Send a message</h2>
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <Field label="Name"><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></Field>
            <Field label="Email"><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></Field>
          </div>
          <Field label="Subject"><input className="input" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" /></Field>
          <Field label="Message"><textarea className="input min-h-40 resize-y" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us what you need help with..." /></Field>
          <button className="btn-primary w-full mt-2"><Send size={17} className="mr-2" /> Send message</button>
        </form>
      </div>
    </div>
  );
}

function Info({ icon, title, value }) { return <div className="flex gap-4 items-center"><div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">{icon}</div><div><p className="text-sm text-slate-500">{title}</p><p className="font-semibold">{value}</p></div></div>; }
function Field({ label, children }) { return <label className="block mt-4"><span className="text-sm font-semibold">{label}</span><div className="mt-2">{children}</div></label>; }
