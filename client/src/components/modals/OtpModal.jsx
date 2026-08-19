import { useState, useEffect } from "react";
import { X, ShieldAlert, Mail, Phone, User, CheckCircle2 } from "lucide-react";
import { sendOtp, verifyOtp } from "../../services/authService";
import { useDispatch } from "react-redux";
import { setAuth } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";

export default function OtpModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: details, 2: otp
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [timer, setTimer] = useState(0);

  const dispatch = useDispatch();

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter email");
      return;
    }
    try {
      setLoading(true);
      const res = await sendOtp({ email, phone, name });
      if (res.data.success) {
        toast.success("OTP sent to your email and phone!");
        setStep(2);
        setTimer(60);
        if (res.data.devOtp) {
          setDevOtp(res.data.devOtp);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter 6-digit OTP");
      return;
    }
    try {
      setLoading(true);
      const res = await verifyOtp({ email, otp });
      if (res.data.success) {
        toast.success("Identity verified successfully!");
        dispatch(setAuth(res.data.data));
        onSuccess && onSuccess(res.data.data.user);
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (timer > 0) return;
    try {
      setLoading(true);
      const res = await sendOtp({ email, phone, name });
      if (res.data.success) {
        toast.success("OTP resent!");
        setTimer(60);
        if (res.data.devOtp) {
          setDevOtp(res.data.devOtp);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative border border-slate-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X size={20} />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 mb-4">
              {step === 1 ? <ShieldAlert size={24} /> : <CheckCircle2 size={24} />}
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {step === 1 ? "Quick Verification" : "Verify OTP Code"}
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-xs">
              {step === 1 
                ? "Enter your details to receive a 6-digit OTP on your Gmail and phone." 
                : `We sent a verification code to ${email}.`}
            </p>
          </div>

          {/* Dev Mode Banner */}
          {devOtp && step === 2 && (
            <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 text-center text-xs text-indigo-700">
              <span className="font-bold">Development Helper:</span> Simulated OTP is <span className="font-mono font-black text-sm bg-indigo-200 px-1.5 py-0.5 rounded text-indigo-900 tracking-wider">{devOtp}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-slate-400" size={17} />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input !pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Gmail Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-slate-400" size={17} />
                  <input
                    type="email"
                    required
                    placeholder="john@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input !pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Phone (for SMS)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 text-slate-400" size={17} />
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input !pl-11"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full py-3 mt-6 font-bold disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Get Verification Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider text-center">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="input text-center text-2xl font-bold tracking-[8px] py-3.5 max-w-[200px] mx-auto block"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full py-3 mt-4 font-bold disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              <div className="flex items-center justify-between text-sm mt-4 text-slate-500">
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="hover:text-indigo-600 font-semibold"
                >
                  ← Edit details
                </button>
                {timer > 0 ? (
                  <span>Resend in <strong className="text-slate-800">{timer}s</strong></span>
                ) : (
                  <button 
                    type="button" 
                    onClick={resend} 
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
