const nodemailer=require("nodemailer");
const sendEmail=async({to,subject,html})=>{if(!process.env.EMAIL_USER)return {skipped:true};const t=nodemailer.createTransport({host:process.env.EMAIL_HOST,port:Number(process.env.EMAIL_PORT||587),secure:Number(process.env.EMAIL_PORT)===465,auth:{user:process.env.EMAIL_USER,pass:process.env.EMAIL_PASS}});return t.sendMail({from:process.env.EMAIL_USER,to,subject,html})};
exports.sendEmail=sendEmail;
exports.sendWelcome=(u)=>sendEmail({to:u.email,subject:"Welcome to CommerceScale",html:`<h2>Welcome, ${u.name}</h2><p>Your CommerceScale account is ready.</p>`});
exports.sendOtp = (email, otp) => sendEmail({
  to: email,
  subject: "Your OTP Verification Code - CommerceScale",
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; border: 1px solid #e0e0e0; border-radius: 16px; max-width: 500px; margin: auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <h2 style="color: #4f46e5; text-align: center; margin-top: 0; font-weight: 800; font-size: 24px;">CommerceScale</h2>
      <p style="color: #334155; font-size: 16px; line-height: 1.5;">Hello,</p>
      <p style="color: #334155; font-size: 16px; line-height: 1.5;">Use the following one-time password (OTP) to verify your account. This OTP is valid for 10 minutes:</p>
      <div style="font-size: 36px; font-weight: 900; text-align: center; color: #4f46e5; letter-spacing: 6px; padding: 20px; background-color: #f5f3ff; border-radius: 12px; margin: 25px 0; border: 1px dashed #c7d2fe;">
        ${otp}
      </div>
      <p style="font-size: 13px; color: #6b7280; text-align: center; margin-bottom: 0;">If you didn't request this code, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">© ${new Date().getFullYear()} CommerceScale. All rights reserved.</p>
    </div>
  `
});
exports.sendOrderConfirmation = (user, order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
        <p style="margin: 0; font-weight: 600; color: #1e293b;">${item.name}</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">SKU: ${item.sku} | Qty: ${item.quantity}</p>
      </td>
      <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1e293b; border-bottom: 1px solid #e2e8f0;">
        ₹${Number(item.price * item.quantity).toLocaleString("en-IN")}
      </td>
    </tr>
  `).join('');
  return sendEmail({
    to: user.email,
    subject: `Order Confirmed - ${order.orderNumber}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <h2 style="color: #4f46e5; margin-top: 0; font-weight: 800; font-size: 24px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px;">Order Confirmation</h2>
        
        <p style="color: #334155; font-size: 16px; line-height: 1.5; margin-top: 20px;">Dear ${user.name || "Customer"},</p>
        <p style="color: #334155; font-size: 16px; line-height: 1.5;">Thank you for your order! We've received your booking, and we are preparing it for shipment.</p>
        
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 16px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Order Details</h3>
          <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Status:</strong> ${order.orderStatus}</p>
        </div>
        <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; margin-top: 25px; margin-bottom: 10px;">Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase;">Item Description</th>
              <th style="text-align: right; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Subtotal</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #334155; font-size: 14px;">₹${Number(order.subtotal).toLocaleString("en-IN")}</td>
          </tr>
          ${order.discount > 0 ? `
          <tr>
            <td style="padding: 6px 0; color: #16a34a; font-size: 14px;">Discount</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #16a34a; font-size: 14px;">-₹${Number(order.discount).toLocaleString("en-IN")}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Tax (18% GST)</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #334155; font-size: 14px;">₹${Number(order.tax).toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Shipping Fee</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #334155; font-size: 14px;">₹${Number(order.shippingFee).toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0 0 0; border-top: 2px solid #e2e8f0; font-size: 18px; font-weight: 800; color: #1e293b;">Total Amount</td>
            <td style="padding: 12px 0 0 0; border-top: 2px solid #e2e8f0; text-align: right; font-size: 18px; font-weight: 800; color: #4f46e5;">₹${Number(order.totalAmount).toLocaleString("en-IN")}</td>
          </tr>
        </table>
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0 0 0; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 14px; font-weight: 700; color: #1e293b;">Shipping Address</h3>
          <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.6;">
            <strong>${order.shippingAddress?.fullName}</strong><br/>
            ${order.shippingAddress?.address}<br/>
            ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}<br/>
            Phone: ${order.shippingAddress?.phone}
          </p>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">© ${new Date().getFullYear()} CommerceScale. All rights reserved.</p>
      </div>
    `
  });
};
