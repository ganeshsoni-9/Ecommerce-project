const crypto=require("crypto"); const Razorpay=require("razorpay");
const getRazorpay=()=>process.env.RAZORPAY_KEY_ID&&process.env.RAZORPAY_KEY_SECRET?new Razorpay({key_id:process.env.RAZORPAY_KEY_ID,key_secret:process.env.RAZORPAY_KEY_SECRET}):null;
exports.createGatewayOrder=async({amount,receipt})=>{const r=getRazorpay();if(!r)return {mock:true,id:`mock_${Date.now()}`,amount,currency:"INR",receipt};return r.orders.create({amount:Math.round(amount*100),currency:"INR",receipt,payment_capture:1})};
exports.verify=({orderId,paymentId,signature})=>{if(String(orderId).startsWith("mock_"))return true;const digest=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");return digest===signature};
