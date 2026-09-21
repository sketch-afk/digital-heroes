# Digital Heroes

Digital Heroes is a modern, gamified subscription platform where users can win cash prizes based on their golf scores, while simultaneously supporting their favorite charities. 

The application utilizes a sleek, dark-themed "Deep Lagoon" aesthetic with dynamic GSAP animations to create a highly engaging, premium user experience.

## Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Animations**: [GSAP (GreenSock)](https://gsap.com/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: [Stripe](https://stripe.com/)

## Key Features

- **Subscriber Dashboard**: A beautiful Bento-grid layout where users can track their stableford scores, manage their subscription, and view their impact.
- **Animated Score Entry**: A gamified "lottery ticket stack" using GSAP Flip animations that makes submitting scores satisfying and tactile.
- **Admin Control Panel**: A comprehensive suite for administrators to manage users, process prize payouts, verify score proofs, and run algorithmic monthly draws.
- **Charity Integration**: Users choose a charity to support with their subscription, and the platform aggregates total impact dynamically.
- **Stripe Subscriptions**: Seamless monthly or annual billing integrated directly with the user profile.

## Getting Started

First, ensure you have the required environment variables in your `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pub_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

Then, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Design System

The application relies on a bespoke global theme called **Deep Lagoon**:
- **Backgrounds**: Dark teal/navy (`#071F29`, `#0A2632`)
- **Accents**: 
  - Vibrant Charity Mint (`#7DE0C3`)
  - Prize Pool Gold (`#FFC145`)
- **Typography**: 
  - Headers: **Bricolage Grotesque**
  - Body: **Figtree**
- **Shapes**: High-radius rounded panels (`24px` to `36px`) for a friendly, modern feel.

## Deployment

This project is configured to be seamlessly deployed on [Vercel](https://vercel.com).
Note: ESLint and TypeScript strict checking (`any` types) are currently ignored during the build step in `next.config.ts` to allow rapid prototyping and deployment.
