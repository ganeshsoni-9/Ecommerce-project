import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="h-16 bg-slate-950 px-6 text-white flex items-center justify-between">
        <Link to="/admin" className="font-black text-lg">
          CommerceScale Admin
        </Link>

        <Link to="/" className="text-sm hover:text-slate-300">
          Storefront
        </Link>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden md:block w-60 bg-white border-r p-5">
          <nav className="space-y-2">
            <Link
              to="/admin"
              className="block rounded-lg p-3 hover:bg-slate-100"
            >
              Overview
            </Link>

            <Link
              to="/admin/products"
              className="block rounded-lg p-3 hover:bg-slate-100"
            >
              Products
            </Link>

            <Link
              to="/admin/orders"
              className="block rounded-lg p-3 hover:bg-slate-100"
            >
              Orders
            </Link>

            <Link
              to="/admin/users"
              className="block rounded-lg p-3 hover:bg-slate-100"
            >
              Users
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}