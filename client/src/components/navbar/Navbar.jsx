import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X, Bell } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { useState, useEffect } from "react";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../../services/notificationService";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const nav = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((s) => s.auth.user);
  const token = useSelector((s) => s.auth.token);
  const count = useSelector((s) => s.cart.items.reduce((a, i) => a + i.quantity, 0));

  const loadNotifs = async () => {
    if (token) {
      try {
        const res = await getNotifications();
        setNotifications(res.data || []);
      } catch (e) {
        console.error("Notifications fetch failed:", e);
      }
    }
  };

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      loadNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      loadNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <div className="bg-slate-900 text-white text-center text-xs py-2">
        Free shipping on orders above ₹1,000
      </div>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b">
        <div className="container-page h-16 flex items-center justify-between gap-4">
          <Link to="/" className="font-black text-xl tracking-tight">
            Commerce<span className="text-indigo-600">Scale</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-semibold">
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </nav>
          <div className="flex items-center gap-2 relative">
            <button onClick={() => nav("/search")} className="btn-light !p-2">
              <Search size={18} />
            </button>
            <button onClick={() => nav("/cart")} className="relative btn-light !p-2">
              <ShoppingCart size={18} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 rounded-full bg-indigo-600 text-white text-[10px] px-1.5">
                  {count}
                </span>
              )}
            </button>

            {/* Notification Bell */}
            {token && (
              <div className="relative">
                <button
                  onClick={() => setShowNotif(!showNotif)}
                  className="relative btn-light !p-2"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white text-[10px] px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotif && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="font-extrabold text-sm text-slate-800">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="mt-2 divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400 font-medium">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`py-3 flex gap-2 items-start ${
                              !n.isRead ? "bg-indigo-50/40 -mx-4 px-4" : ""
                            }`}
                          >
                            <div className="flex-1">
                              <p className="text-xs font-bold text-slate-800">{n.title}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                              <span className="text-[9px] text-slate-400 font-semibold mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            {!n.isRead && (
                              <button
                                onClick={() => handleMarkRead(n._id)}
                                className="text-[10px] text-indigo-600 hover:text-indigo-850 font-bold self-center"
                              >
                                Read
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link
              to={token ? "/profile" : "/login"}
              className="hidden sm:flex btn-light !py-2 !px-3 flex items-center gap-1.5 text-sm font-semibold"
            >
              <User size={16} /> {user?.name ? user.name.split(" ")[0] : "Account"}
            </Link>
            <button className="md:hidden btn-light !p-2" onClick={() => setOpen(!open)}>
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden border-t p-4 flex flex-col gap-3">
            <Link to="/shop">Shop</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to={token ? "/profile" : "/login"} onClick={() => setOpen(false)}>
              Account
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
