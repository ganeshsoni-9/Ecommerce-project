
## Quick start (Windows)

```powershell
cd commerce-scale
npm run install-all
cd server
copy .env.example .env
# open server/.env and set MONGODB_URI
cd ..
npm run seed
npm run dev
```

The seed creates 30 real-looking catalog products, 10 categories, 3 coupons, 2 banners, one admin and one manager.

### Seeded credentials

Admin: `admin@commerce-scale.local` / `ChangeMe_Admin_123!`

Manager: `manager@commerce-scale.local` / `ChangeMe_Manager_123!`

Change these values in `server/.env` before any real deployment.

### Mobile testing

Set the Vite server to expose LAN and open the Network URL shown by Vite on your phone. For API calls, create `client/.env` from `client/.env.example` and set `VITE_API_URL` to `http://YOUR-PC-IP:5000/api`.

# CommerceScale

CommerceScale is an original MERN-stack enterprise D2C commerce platform with customer, manager and admin workflows.

## Stack
React + Vite + Tailwind CSS v3 + Redux Toolkit + Express + MongoDB/Mongoose + JWT + Cloudinary + Nodemailer + Razorpay architecture.

## Requirements
Node.js 20+, MongoDB Atlas/local MongoDB.

## Install
```bash
npm run install-all
```

Copy `server/.env.example` to `server/.env` and configure MongoDB/JWT. Razorpay, Cloudinary and email credentials are optional for local development; payment/email/image features degrade gracefully when credentials are absent.

## Seed
```bash
npm run seed
```
Seed credentials are configured with `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_MANAGER_EMAIL`, `SEED_MANAGER_PASSWORD`.

## Development
```bash
npm run dev
```
Frontend: http://localhost:5173
Backend: http://localhost:5000

## Production
```bash
npm run build
npm start
```

## Deployment
Frontend can be deployed to Netlify/Vercel with `VITE_API_URL=https://your-api.example.com/api`.
Backend can be deployed to Render with root directory `server`, build command `npm install`, start command `npm start`.
MongoDB Atlas supplies `MONGODB_URI`; Cloudinary stores media; Razorpay handles payments.

## API
Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
Products: `/api/products`, `/api/products/:id`
Categories: `/api/categories`
Cart: `/api/cart`
Wishlist: `/api/wishlist`
Orders: `/api/orders`
Payments: `/api/payments`
Reviews: `/api/reviews`
Coupons: `/api/coupons/validate`
Admin: `/api/admin/*`
Analytics: `/api/analytics/dashboard`

All responses follow `{ success, message, data }`.

## Security
Secrets remain server-side. JWT, bcrypt, Helmet, CORS, rate limiting, validation, role middleware and centralized errors are included.

## Default seeded login
Use the credentials from your `.env` seed variables. Never use production passwords in source code.
