# TradeByBater 🇳🇬
### Exchange value directly, not currency.
**A modern barter marketplace built for Nigeria, designed to scale across Africa and the world.**

---

"TradeByBater digitises direct value exchange so communities can swap goods, skills, and services without currency."


---

## Overview

TradeByBater is an AI-enabled barter platform that allows users to exchange goods and services directly. It is purpose-built for Nigeria’s unique market dynamics and designed to support a secure, scalable, and mobile-first trading experience.

The platform is focused on:
- peer-to-peer barter across all 36 Nigerian states and the FCT
- zero transaction fees for baseline trades
- AI-assisted recommendations, support, and fraud prevention
- trust-first trading with verification, ratings and escrow for high-value deals

---

## What Makes TradeByBater Different

- **Currency-free trading:** swap value directly without relying on naira, dollars, or bank accounts.
- **Local-first design:** built with Nigerian trade culture, informal markets, and mobile users in mind.
- **Trusted marketplace:** phone verification, reputation scoring, and optional BVN-backed trust badges.
- **AI-powered support:** a 24/7 trade assistant that helps listing creation, matching, and conflict resolution.
- **Growth-ready model:** free listings plus premium features for sustainable monetization.

---

## Core Workflow

1. **List what you have**: create a listing for goods, skills, services, or time.
2. **Discover what you need**: browse by category, location, or keywords.
3. **Propose a trade**: negotiate with secure in-app messaging.
4. **Complete the exchange**: deliver or hand off the agreed items or services.
5. **Review your partner**: build community trust through ratings and feedback.

---

## Platform Highlights

- AI-powered trade matching and listing guidance
- In-app messaging and negotiation workflow
- Location-based discovery across all 36 states
- Optional escrow protection for valuable trades
- Reputation system with public reviews
- Zero fees for standard trades
- Mobile-ready experience with iOS and Android support
- Cross-border expansion roadmap

---

## Supported Trade Categories

- Tech & Gadgets
- Skills & Services
- Fashion
- Home & Furniture
- Food & Agriculture
- Education
- Transport & Autos
- Creative Arts

Examples from the marketplace:
- laptops for tailoring services
- solar panels for building materials
- photography for web development
- equipment for farm produce
- legal advice for digital services

---

## Market Opportunity

Nigeria is the launch market because it offers:
- 220 million people
- 84M+ internet users
- a 65% informal economy
- deep barter traditions through Ajo, Esusu, and market trading
- strong diaspora demand and cross-border opportunities

This combination makes Nigeria the ideal incubator for a digital barter platform.

---

## Revenue Strategy

TradeByBater emphasizes adoption first, with revenue generated through premium services:

- listing boosts for enhanced visibility
- verified trader subscriptions
- escrow fees for optional high-value trades
- business accounts for SMEs and collectives
- paid API access for partners and developers
- future AI premium services and barter credit tokens

---

## Roadmap

**Phase 1 — Nigeria**
- launch across all 36 states + FCT
- live listings, messaging, trust systems
- AI assistant, verification, and mobile support

**Phase 2 — West Africa**
- regional expansion
- business accounts and multilingual support
- ECOWAS trade corridor integration

**Phase 3 — Pan-Africa**
- continent-wide rollout
- diaspora trade bridges
- enterprise API and partner integrations

**Phase 4 — Global**
- worldwide barter network
- tokenized trade incentives
- advanced AI matching and market analytics

---

## Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/dinalegw/TradeByBater.git
cd TradeByBater
npm install
```

Run the server:

```bash
npm start
```

Open the landing page at:

- `http://localhost:3000/` for the marketing landing page
- `http://localhost:3000/app.html` for the live barter app

---

## Project Structure

- `TradeByBater_Landing.html` — marketing landing page for the product
- `server.js` — Express backend and API router
- `data/db.json` — persistent storage for users, listings, and trades
- `public/app.html` — frontend application shell for the barter marketplace
- `public/js/app.js` — client-side logic for authentication, listings, and trade requests
- `public/css/app.css` — app styling and responsive layout

---

## API Overview

The server provides a minimal REST API:

- `POST /api/auth/register` — create a new user account
- `POST /api/auth/login` — authenticate and receive a bearer token
- `GET /api/auth/me` — fetch the current user profile
- `GET /api/categories` — retrieve trade categories
- `GET /api/listings` — list active barter offers
- `POST /api/listings` — create a new listing (authenticated)
- `GET /api/trades` — view trade requests for the current user
- `POST /api/trades` — send a trade request for a listing (authenticated)
- `GET /api/admin/stats` — retrieve user, listing, and trade counts (admin only)
- `GET /api/admin/users` — retrieve registered users (admin only)
- `GET /api/admin/listings` — retrieve all listings with owner details (admin only)

---

## Admin Access

The project includes a basic admin dashboard at `http://localhost:3000/admin.html`.

To use it:

1. Start the server with `npm start`.
2. Open `http://localhost:3000/app.html` and sign in with the admin account.
3. Navigate to `http://localhost:3000/admin.html`.

The default admin credentials in `data/db.json` are:

- username: `admin`
- password: `password`

The admin dashboard shows:

- total users
- total listings
- total trades
- recent listings and uploader details
- registered user list

---

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a branch for your feature or fix.
3. Open a pull request with a clear description.

---

## License

TradeByBater is released under the MIT License. See `LICENSE` for full terms.

---

## Contact

- GitHub: https://github.com/dinalegw/TradeByBater
- Project: TradeByBater 🇳🇬
- Tagline: Exchange value directly, not currency.
