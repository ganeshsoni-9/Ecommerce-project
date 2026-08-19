import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { login, register as reg } from "../services/authService";
import { addToCart, getCart } from "../services/cartService";
import { useDispatch } from "react-redux";
import { setAuth } from "../redux/slices/authSlice";
import { setCart } from "../redux/slices/cartSlice";
import toast from "react-hot-toast";

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Tab state: "login" or "register"
  const initialTab = searchParams.get("tab") === "register" ? "register" : "login";
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "register") setTab("register");
    else if (t === "login") setTab("login");
  }, [searchParams]);

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState(searchParams.get("val") || "");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Prefill login identifier if passed via query
  useEffect(() => {
    const val = searchParams.get("val");
    if (val) setLoginIdentifier(val);
  }, [searchParams]);

  // Register Form States
  const [regName, setRegName] = useState("");
  const [regMethod, setRegMethod] = useState("EMAIL"); // "EMAIL" or "MOBILE"
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Perform pending cart actions after successful login
  const handleAuthSuccess = async (authData) => {
    dispatch(setAuth(authData));
    const pending = localStorage.getItem("pending_cart_action");
    if (pending) {
      try {
        const { productId, quantity } = JSON.parse(pending);
        await addToCart({ productId, quantity });
        const cartRes = await getCart();
        dispatch(setCart(cartRes.data?.data || cartRes.data || {}));
        localStorage.removeItem("pending_cart_action");
        toast.success("Successfully logged in and product added to cart!");
        navigate("/cart");
        return;
      } catch (err) {
        console.error("Failed to run pending cart action:", err);
      }
    }
    toast.success("Welcome back!");
    navigate("/");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      return toast.error("Please fill in all fields");
    }

    setLoginLoading(true);
    try {
      // Determine if identifier is email or phone
      const isEmail = loginIdentifier.includes("@");
      const payload = {
        password: loginPassword,
        [isEmail ? "email" : "phone"]: loginIdentifier
      };

      const res = await login(payload);

      if (res.data?.verificationRequired) {
        toast(res.data.message || "Verification required.");
        navigate(`/verify-otp?method=${res.data.verificationMethod}&val=${res.data.email || res.data.phone}`);
        return;
      }

      await handleAuthSuccess(res.data?.data || res.data || {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect email/mobile number or password.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!regName || !regPassword || !regConfirmPassword) {
      return toast.error("Please fill in all required fields");
    }

    if (regPassword !== regConfirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (regPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    if (regMethod === "EMAIL" && !regEmail) {
      return toast.error("Email is required for email verification");
    }

    if (regMethod === "MOBILE" && !regPhone) {
      return toast.error("Mobile number is required for mobile verification");
    }

    setRegLoading(true);
    try {
      const payload = {
        name: regName,
        password: regPassword,
        verificationMethod: regMethod,
        email: regMethod === "EMAIL" ? regEmail : undefined,
        phone: regMethod === "MOBILE" ? regPhone : undefined
      };

      const res = await reg(payload);

      if (res.data?.verificationRequired) {
        toast.success(res.data.message || "Registration successful! OTP sent.");
        const val = regMethod === "EMAIL" ? res.data.email : res.data.phone;
        navigate(`/verify-otp?method=${regMethod}&val=${val}`);
      } else {
        toast.success("Account created successfully!");
        setTab("login");
        setLoginIdentifier(regMethod === "EMAIL" ? regEmail : regPhone);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="card w-full max-w-md p-8 shadow-xl bg-white rounded-2xl border border-slate-100">
        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 mb-8">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 pb-3 text-center font-bold text-lg border-b-2 transition ${
              tab === "login"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 pb-3 text-center font-bold text-lg border-b-2 transition ${
              tab === "register"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Create Account
          </button>
        </div>

        {tab === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email or Mobile Number
              </label>
              <input
                type="text"
                placeholder="e.g. rahul@example.com or 9876543210"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="input w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="input w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="btn-primary w-full py-3 rounded-lg font-bold text-white transition duration-200"
            >
              {loginLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="input w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Choose Verification Method
              </label>
              <div className="flex items-center gap-6 mb-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="radio"
                    name="verificationMethod"
                    value="EMAIL"
                    checked={regMethod === "EMAIL"}
                    onChange={() => setRegMethod("EMAIL")}
                    className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  />
                  Email Address
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="radio"
                    name="verificationMethod"
                    value="MOBILE"
                    checked={regMethod === "MOBILE"}
                    onChange={() => setRegMethod("MOBILE")}
                    className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  />
                  Mobile Number
                </label>
              </div>
            </div>

            {regMethod === "EMAIL" ? (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="input w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="input w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="input w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Retype password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                className="input w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={regLoading}
              className="btn-primary w-full py-3 rounded-lg font-bold text-white transition duration-200"
            >
              {regLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
