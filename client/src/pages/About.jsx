import { Link } from "react-router-dom";
import { ArrowRight, Boxes, HeartHandshake, Layers3, ShieldCheck, Sparkles, Target } from "lucide-react";

const values = [
  { icon: <Target />, title: "Customer first", text: "Every part of the experience is designed around easier discovery, clearer decisions and confident checkout." },
  { icon: <Layers3 />, title: "Built to scale", text: "CommerceScale is structured like a real commerce platform with products, inventory, orders, payments and operations." },
  { icon: <HeartHandshake />, title: "Trust by design", text: "Transparent pricing, order visibility and useful support experiences help customers stay informed." }
];

export default function About() {
  return (
    <div>
      <section className="bg-slate-950 text-white">
        <div className="container-page py-20 md:py-28 max-w-5xl">
          <p className="text-indigo-300 font-semibold">ABOUT COMMERCE SCALE</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mt-4">A commerce experience made for modern retail.</h1>
          <p className="text-slate-300 text-lg leading-8 max-w-3xl mt-6">CommerceScale is an original enterprise D2C commerce concept focused on product discovery, reliable operations and a premium customer journey.</p>
          <Link to="/shop" className="btn bg-white text-slate-950 mt-8">Explore the collection <ArrowRight size={17} className="ml-2" /></Link>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-indigo-600 font-semibold">OUR APPROACH</p>
            <h2 className="text-4xl font-black mt-2">Simple for shoppers. Powerful for operators.</h2>
            <p className="text-slate-500 leading-7 mt-5">The platform brings catalog discovery, customer accounts, cart, wishlist, checkout, payments and order operations into one connected commerce system.</p>
            <p className="text-slate-500 leading-7 mt-4">It is intentionally original — the brand language, content and interface are built for CommerceScale rather than copied from another company.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Metric icon={<Boxes />} number="30+" label="Products" />
            <Metric icon={<Sparkles />} number="10" label="Categories" />
            <Metric icon={<ShieldCheck />} number="24/7" label="Digital access" />
            <Metric icon={<Layers3 />} number="3" label="User roles" />
          </div>
        </div>
      </section>

      <section className="bg-slate-100 border-y border-slate-200">
        <div className="container-page py-16">
          <h2 className="text-3xl font-black text-center">What we believe</h2>
          <div className="grid md:grid-cols-3 gap-5 mt-10">{values.map((v) => <div className="card p-7" key={v.title}><div className="text-indigo-600">{v.icon}</div><h3 className="font-bold text-xl mt-5">{v.title}</h3><p className="text-slate-500 mt-3 leading-6">{v.text}</p></div>)}</div>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon, number, label }) {
  return <div className="card p-6"><div className="text-indigo-600">{icon}</div><p className="text-3xl font-black mt-5">{number}</p><p className="text-sm text-slate-500 mt-1">{label}</p></div>;
}
