import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyOtp, sendOtp } from "../services/authService";
import toast from "react-hot-toast";

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const method = searchParams.get("method") || "EMAIL";
  const val = searchParams.get("val") || "";

  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(45);

  useEffect(() => {
    if (!val) {
      toast.error("Invalid verification context.");
      navigate("/login");
    }
  }, [val, navigate]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const maskValue = (value, type) => {
    if (!value) return "";
    if (type === "EMAIL") {
      if (!value.includes("@")) return value;
      const [local, domain] = value.split("@");
      if (local.length <= 2) return `${local[0]}*@${domain}`;
      return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
    } else {
      if (value.length <= 4) return value;
      return "*".repeat(value.length - 4) + value.slice(-4);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6 || isNaN(otp)) {
      return toast.error("Please enter a valid 6-digit numeric OTP");
    }

    setVerifying(true);
    try {
      const payload = {
        otp,
        [method === "EMAIL" ? "email" : "phone"]: val
      };

      const res = await verifyOtp(payload);
      toast.success(res.data?.message || "Account verified successfully!");
      navigate(`/login?tab=login&val=${val}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      const payload = {
        [method === "EMAIL" ? "email" : "phone"]: val
      };
      const res = await sendOtp(payload);
      toast.success(res.data?.message || "A new verification code has been sent!");
      setCountdown(45);
      setOtp("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="card w-full max-w-md p-8 shadow-xl bg-white rounded-2xl border border-slate-100 text-center">
        <h1 className="text-3xl font-black mb-3">Verify Your Account</h1>
        <p className="text-sm text-slate-500 mb-6">
          We sent a verification code to <br />
          <span className="font-semibold text-slate-800 text-base">
            {maskValue(val, method)}
          </span>
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <input
              type="text"
              maxLength={6}
              placeholder="0 0 0 0 0 0"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full text-center text-3xl tracking-[10px] font-bold py-3.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-slate-300"
              required
            />
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="btn-primary w-full py-3 rounded-lg font-bold text-white transition duration-200"
          >
            {verifying ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-sm">
          <span className="text-slate-500">Didn't receive the code?</span>
          {countdown > 0 ? (
            <span className="font-semibold text-indigo-600">
              Resend in {countdown}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="font-bold text-indigo-600 hover:text-indigo-800 transition"
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
