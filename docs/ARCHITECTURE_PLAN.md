# UseOmni.io — Frontend & Backend Integration Architecture Plan

> **Last updated**: 2026-03-19
> **Status**: Planning
> **Author**: Scarlett + Claude

---

## Table of Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [Architecture Overview](#2-architecture-overview)
3. [Goal 1: Email Tracking + Login-Required Handling (MVP)](#3-goal-1-email-tracking--login-required-handling-mvp)
4. [Goal 2: External Carrier API Integration (Scalability)](#4-goal-2-external-carrier-api-integration-scalability)
5. [Goal 3: Latency Handling on Refresh](#5-goal-3-latency-handling-on-refresh)
6. [Database Schema](#6-database-schema)
7. [Backend Service & API Structure](#7-backend-service--api-structure)
8. [Implementation Phases & Timeline](#8-implementation-phases--timeline)
9. [Critical Security Fixes](#9-critical-security-fixes)
10. [Open Questions & Decisions](#10-open-questions--decisions)

---

## 1. Current State Assessment

### Tech Stack (as-is)

| Layer | Technology |
|---|---|
| Frontend Framework | React 19.2.4 + TypeScript 5.8.2 |
| Build Tool | Vite 6.2.0 |
| Styling | Tailwind CSS (CDN) |
| Icons | Lucide React 0.563.0 |
| Charts | Recharts 3.7.0 (imported, unused) |
| AI/ML | Google Gemini AI (@google/genai 1.38.0) |
| State Management | React hooks (useState in App.tsx) |
| Database | None — in-memory mock data |
| Backend | None — frontend-only |
| Auth | None |

### What's Implemented

- **UI shell**: Home dashboard, package cards, status filters, direction toggle
- **Package management**: Manual entry + Gemini-powered email text parsing
- **Create shipment workflow**: Multi-step form with camera scanning, address book, courier selection
- **Profile view**: User info, connected accounts (mock), saved addresses CRUD
- **Mobile-first design**: 480px max-width, bottom nav, animations

### What's Mock / Missing

| Feature | Status |
|---|---|
| AI email parsing | Gemini connected but text-only input (no OAuth email integration) |
| Payment processing | UI-only, 2s mock delay |
| Sync inbox | UI-only, adds mock FedEx package after 2.5s |
| Camera scanning | UI functional, Gemini ready but untested |
| Backend API | Not implemented |
| Database / persistence | Not implemented |
| Authentication | Not implemented |
| Real-time carrier tracking | Not implemented |
| Email OAuth (Gmail/Outlook) | Not implemented |
| Notifications | UI elements present, no functionality |

### Key Files

```
App.tsx                          → Root component, all state management
types.ts                         → TypeScript enums & interfaces
constants.tsx                    → Mock data & UI constants
services/geminiService.ts        → Gemini AI email parsing (client-side)
components/AddPackageModal.tsx   → Manual + AI import modal
components/PackageCard.tsx       → Package display with timeline
components/PackageList.tsx       → Package list view
components/StatusFilter.tsx      → Filter pills
components/ProfileView.tsx       → Account & address management
components/CreateShipmentView.tsx→ Multi-step shipment creation
components/BottomNav.tsx         → Navigation tabs
components/PromoBanner.tsx       → Brand carousel
```

---

## 2. Architecture Overview

### Recommended Stack Addition

| Layer | Technology | Rationale |
|---|---|---|
| Auth + DB | Supabase | Built-in OAuth (Google/Microsoft), PostgreSQL, real-time subscriptions |
| API Layer | Supabase Edge Functions or Vercel API Routes | Serverless, deploys alongside frontend |
| Carrier APIs | AfterShip Tracking API | Unified 900+ carrier support, avoids N separate integrations |
| Caching | Upstash Redis (serverless) | Low-latency cache for carrier responses |
| Data Fetching | TanStack Query (React Query) | SWR pattern, handles stale/loading/error states |
| State | Zustand | Replace fragile prop-drilling from App.tsx root |

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (React + TanStack Query + Zustand)                    │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Dashboard │  │ Add Pkg  │  │ Profile  │  │ Create   │       │
│  │ View     │  │ Modal    │  │ View     │  │ Shipment │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │              │              │              │             │
│       └──────────────┼──────────────┼──────────────┘             │
│                      │              │                            │
│              TanStack Query    Zustand Store                     │
│              (data fetching)   (UI state)                        │
└──────────────────────┼──────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  BACKEND (Supabase Edge Functions / Vercel API Routes)           │
│                                                                  │
│  /api/tracking/:number    → AfterShip API → Redis Cache          │
│  /api/emails/scan         → Gmail/Outlook API → Gemini (AI)      │
│  /api/packages            → Supabase PostgreSQL                  │
│  /api/webhooks/aftership  → Update DB → Push via Real-time       │
│  /api/auth/gmail          → OAuth callback handler               │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │ AfterShip  │  │ Gemini AI  │  │ Gmail/     │                │
│  │ (carriers) │  │ (parsing)  │  │ Outlook    │                │
│  └────────────┘  └────────────┘  └────────────┘                │
└──────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  DATA LAYER                                                      │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │ Supabase         │  │ Upstash Redis    │                     │
│  │ (PostgreSQL +    │  │ (carrier API     │                     │
│  │  Auth + Realtime)│  │  response cache) │                     │
│  └──────────────────┘  └──────────────────┘                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Goal 1: Email Tracking + Login-Required Handling (MVP)

### Email Scanning Flow

```
User signs in with Google OAuth (gmail.readonly scope)
        ↓
Backend: POST /api/emails/scan
        ↓
Fetch last N days of emails from Gmail API
        ↓
Filter for shipping-related emails (subject line heuristics)
        ↓
Gemini AI (server-side) extracts per email:
  → trackingNumber, carrier, name, estimatedDelivery
        ↓
Upsert into packages table (Supabase)
        ↓
For each new tracking number:
  → GET /api/tracking/:number (AfterShip lookup)
        ↓
Return extracted packages to frontend
```

### Login-Required Tracking Problem

Some carriers require user authentication to view tracking details (notably Amazon).

| Scenario | Solution |
|---|---|
| Amazon tracking | AfterShip supports Amazon — covers most cases. Fallback: "View on Amazon" deep link button |
| USPS "informed delivery" | USPS Web Tools API is free, no user login needed — just backend API key |
| Carrier portal login walls | Detect 401/403 from AfterShip → surface `LOGIN_REQUIRED` status badge with direct carrier URL |

### Type Changes Required

```typescript
// Add to Status enum in types.ts
LOGIN_REQUIRED = 'LOGIN_REQUIRED'

// Add to Package interface in types.ts
requiresExternalLogin: boolean
carrierTrackingUrl: string    // deep link to carrier website
```

### Frontend UX

- When `requiresExternalLogin === true`, show a **"Track on [Carrier]"** button instead of the refresh/timeline UI
- Badge: amber "Login Required" pill
- User taps → opens carrier website in new tab where they can sign in and view tracking

### MVP Test Criteria

- [ ] User connects Gmail via OAuth
- [ ] Backend scans inbox, finds real shipping emails
- [ ] Gemini extracts tracking numbers from email content
- [ ] Tracking numbers resolve via AfterShip with real carrier data
- [ ] Login-required packages show external link instead of broken data
- [ ] Gemini API key is NOT exposed to the browser

---

## 4. Goal 2: External Carrier API Integration (Scalability)

### Unified Carrier Abstraction via AfterShip

Rather than maintaining 5+ separate carrier API integrations:

```
Frontend request
        ↓
GET /api/tracking/:trackingNumber?carrier=ups
        ↓
Backend TrackingService
        ↓
Check Redis cache (key: tracking:{number})
  → HIT: return cached data (< 50ms)
  → MISS: call AfterShip API (~300-800ms)
        ↓
Normalize AfterShip response → internal TrackingEvent[] format
        ↓
Cache in Redis (TTL: 30 minutes)
        ↓
Upsert tracking_events in Supabase
        ↓
Return to frontend
```

### Carrier Coverage

| Carrier | API Source | Auth Type | Notes |
|---|---|---|---|
| UPS | AfterShip / UPS Developer Kit | OAuth 2.0 client credentials | |
| FedEx | AfterShip / FedEx Developer | API key | |
| DHL | AfterShip / DHL Tracking API | API key (free tier) | |
| USPS | AfterShip / USPS Web Tools | Free registration | |
| Amazon | AfterShip (partial coverage) | None needed | Gaps → "View on Amazon" fallback |

### Direct Carrier API Fallback

If AfterShip doesn't cover a carrier or for cost optimization at scale:

```typescript
// trackingService.ts routing logic
async function getTracking(trackingNumber: string, carrier: Carrier) {
  // 1. Try AfterShip first (unified)
  const result = await afterShipClient.getTracking(trackingNumber, carrier)

  // 2. If AfterShip fails or unsupported, try direct carrier API
  if (!result) {
    switch (carrier) {
      case Carrier.UPS:    return upsDirectClient.track(trackingNumber)
      case Carrier.FEDEX:  return fedexDirectClient.track(trackingNumber)
      case Carrier.DHL:    return dhlDirectClient.track(trackingNumber)
      case Carrier.USPS:   return uspsDirectClient.track(trackingNumber)
      default:             return { requiresExternalLogin: true }
    }
  }

  return normalizeToTrackingEvents(result)
}
```

### Response Normalization

All carrier responses are normalized to the existing `TrackingEvent` interface:

```typescript
interface TrackingEvent {
  timestamp: string      // ISO 8601
  location: string       // "City, State" or "Facility Name"
  description: string    // Human-readable event description
  status: Status         // Internal status enum
}
```

AfterShip status → internal Status mapping:

| AfterShip Status | Internal Status |
|---|---|
| InfoReceived | ORDER_PLACED |
| InTransit | IN_TRANSIT |
| OutForDelivery | OUT_FOR_DELIVERY |
| Delivered | DELIVERED |
| Exception / FailedAttempt | EXCEPTION |
| Pending | SHIPPED |

---

## 5. Goal 3: Latency Handling on Refresh

### Three-Layer Strategy

#### Layer 1 — Stale-While-Revalidate (Frontend)

Replace `useState` + `setTimeout` mocks with TanStack Query:

```typescript
const { data: packages, isLoading, isFetching } = useQuery({
  queryKey: ['packages', userId],
  queryFn: fetchPackages,
  staleTime: 5 * 60 * 1000,         // treat as fresh for 5 min
  refetchOnWindowFocus: true,        // auto-refresh on tab focus
  refetchInterval: 10 * 60 * 1000,  // background poll every 10 min
})

// isLoading  = first fetch, no data yet → show skeleton
// isFetching = already have data, refreshing in background → show subtle indicator
```

- Show cached data instantly on app open
- Subtle "Updating..." pulse indicator (not a blocking spinner)
- Swap in fresh data silently when ready

#### Layer 2 — Backend Cache (Redis)

```
Request: GET /api/tracking/:number
        ↓
Check Redis (key: tracking:{number})
  → HIT (< 50ms): return cached response immediately
  → MISS: call AfterShip API (~300-800ms)
    → Store in Redis with 30-minute TTL
    → Return fresh data
        ↓
Manual refresh button → sends Cache-Control: no-cache header
  → Backend bypasses Redis, fetches fresh from AfterShip
  → Updates Redis cache with new data
```

#### Layer 3 — Real-time Push (Supabase Realtime)

```
AfterShip webhook fires on status change
        ↓
POST /api/webhooks/aftership
        ↓
Update packages table in Supabase
        ↓
Supabase real-time subscription fires on client
        ↓
TanStack Query cache invalidated
        ↓
UI updates without user action
```

Status changes (e.g., "Out for Delivery") push to the user's device automatically rather than waiting for their next refresh.

### UX States

| State | Current (mock) | Target |
|---|---|---|
| App open | Shows mock data | Shows last cached data instantly |
| Background refresh | 2.5s fake spinner | Silent `isFetching` indicator (subtle dot/pulse) |
| Manual refresh tap | 2.5s delay | Instant cache return + background fetch |
| Status change | Never updates | Push via Supabase real-time |
| Carrier API down | Not handled | Cached stale data + "Last updated X ago" timestamp |
| First ever load | Instant mock data | Skeleton loading states |

### Per-Package Freshness Indicator

Add `lastSyncAt` timestamp to each package card:
- "Updated just now"
- "Updated 12 min ago"
- "Updated 2 hours ago" (amber warning)
- "Unable to refresh — last updated yesterday" (red warning)

This gives users confidence without blocking their interaction.

---

## 6. Database Schema

```sql
-- ============================================
-- Users (handled by Supabase Auth, extended)
-- ============================================
create table public.user_profiles (
  id uuid references auth.users primary key,
  display_name text,
  gmail_refresh_token text,          -- encrypted
  outlook_refresh_token text,        -- encrypted
  last_email_scan_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- Packages
-- ============================================
create table public.packages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  tracking_number text,
  carrier text not null,              -- enum: AMAZON, USPS, UPS, FEDEX, DHL, OTHER
  status text not null default 'ORDER_PLACED',
  estimated_delivery date,
  last_sync_at timestamptz,
  requires_external_login boolean default false,
  carrier_tracking_url text,
  direction text not null default 'INCOMING',  -- INCOMING | OUTGOING
  is_return boolean default false,
  product_description text,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_packages_user_id on public.packages(user_id);
create index idx_packages_tracking_number on public.packages(tracking_number);

-- ============================================
-- Tracking Events
-- ============================================
create table public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references public.packages on delete cascade not null,
  timestamp timestamptz not null,
  location text,
  description text not null,
  status text not null,
  created_at timestamptz default now()
);

create index idx_tracking_events_package_id on public.tracking_events(package_id);

-- ============================================
-- Addresses
-- ============================================
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  label text not null,
  street text not null,
  city text not null,
  state text not null,
  zip text not null,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_addresses_user_id on public.addresses(user_id);

-- ============================================
-- Email Scans (audit log)
-- ============================================
create table public.email_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  email_message_id text not null,
  scanned_at timestamptz default now(),
  tracking_numbers_found text[],
  source text not null default 'gmail'  -- gmail | outlook
);

create index idx_email_scans_user_id on public.email_scans(user_id);

-- ============================================
-- Row Level Security
-- ============================================
alter table public.packages enable row level security;
alter table public.tracking_events enable row level security;
alter table public.addresses enable row level security;
alter table public.email_scans enable row level security;
alter table public.user_profiles enable row level security;

-- Users can only access their own data
create policy "Users access own packages"
  on public.packages for all using (auth.uid() = user_id);

create policy "Users access own tracking events"
  on public.tracking_events for all
  using (package_id in (select id from public.packages where user_id = auth.uid()));

create policy "Users access own addresses"
  on public.addresses for all using (auth.uid() = user_id);

create policy "Users access own email scans"
  on public.email_scans for all using (auth.uid() = user_id);

create policy "Users access own profile"
  on public.user_profiles for all using (auth.uid() = id);
```

---

## 7. Backend Service & API Structure

### Directory Structure (to be created)

```
supabase/
  functions/
    tracking/index.ts         → GET /tracking/:number — fetch + cache tracking events
    packages/index.ts         → GET (list), POST (create) packages
    packages-id/index.ts      → PUT (update), DELETE (remove) package by ID
    emails-scan/index.ts      → POST — scan Gmail/Outlook inbox, extract tracking
    auth-gmail/index.ts       → OAuth callback for Gmail
    auth-outlook/index.ts     → OAuth callback for Outlook
    webhooks-aftership/index.ts → AfterShip status change webhook handler

  shared/
    trackingService.ts        → Unified carrier lookup (AfterShip + direct fallback)
    emailService.ts           → Gmail/Outlook API wrappers + token management
    cacheService.ts           → Redis get/set/invalidate wrappers
    geminiService.ts          → Server-side email parsing (moved from frontend)
    normalize.ts              → AfterShip response → TrackingEvent[] mapping
```

### API Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/tracking/:number` | Fetch tracking events for a tracking number |
| GET | `/api/packages` | List user's packages |
| POST | `/api/packages` | Create a package |
| PUT | `/api/packages/:id` | Update a package |
| DELETE | `/api/packages/:id` | Remove a package |
| POST | `/api/packages/:id/refresh` | Force refresh tracking (bypass cache) |
| POST | `/api/emails/scan` | Scan inbox for shipping emails |
| GET | `/api/auth/gmail/callback` | Gmail OAuth callback |
| GET | `/api/auth/outlook/callback` | Outlook OAuth callback |
| POST | `/api/webhooks/aftership` | AfterShip webhook receiver |

---

## 8. Implementation Phases & Timeline

### Phase 1 — MVP (Weeks 1-3)

**Goal**: Real email scanning + real carrier tracking + secure backend

- [ ] Set up Supabase project (auth, database, edge functions)
- [ ] Run database migration (schema from Section 6)
- [ ] Move `geminiService.ts` from frontend to backend (security fix)
- [ ] Implement Google OAuth with `gmail.readonly` scope
- [ ] Build `POST /api/emails/scan` — Gmail API → Gemini → upsert packages
- [ ] Integrate AfterShip API for basic carrier lookup
- [ ] Build `GET /api/tracking/:number` with AfterShip
- [ ] Add `LOGIN_REQUIRED` status + "Track on [Carrier]" UI
- [ ] Add TanStack Query to frontend, replace mock data fetching
- [ ] Write tests: email parsing accuracy, carrier lookup, auth flow

### Phase 2 — Scalability (Weeks 4-6)

**Goal**: Caching, webhooks, multi-carrier reliability

- [ ] Set up Upstash Redis, implement `cacheService.ts`
- [ ] Add Redis caching to `/api/tracking/:number` (30-min TTL)
- [ ] Register AfterShip webhooks for status change notifications
- [ ] Build `POST /api/webhooks/aftership` → update DB + trigger real-time
- [ ] Add Supabase real-time subscriptions on frontend
- [ ] Implement Outlook OAuth + email scanning
- [ ] Add direct carrier API fallbacks (UPS, FedEx, DHL, USPS)
- [ ] Add Zustand for global state management (replace prop-drilling)

### Phase 3 — Polish (Weeks 7-8)

**Goal**: Best-in-class perceived performance + reliability

- [ ] Background polling with `refetchInterval` in React Query
- [ ] Optimistic UI updates for package CRUD operations
- [ ] "Last updated X ago" freshness indicators per package
- [ ] Skeleton loading states for first load
- [ ] Service worker for offline cache
- [ ] Push notifications via Supabase + FCM
- [ ] Error boundaries + retry logic for failed carrier lookups
- [ ] Analytics dashboard using Recharts (leverage unused dependency)

---

## 9. Critical Security Fixes

### Pre-MVP (Must Do First)

| Issue | Current State | Fix |
|---|---|---|
| Gemini API key exposure | Passed to frontend via `vite.config.ts` `define` block | Move all Gemini calls to backend edge functions |
| No auth | Anyone can use the app | Supabase Auth with RLS policies |
| No input validation | Address/package fields unchecked | Zod schemas on backend API routes |
| No CORS | Not configured | Supabase handles CORS; Vercel needs explicit config |
| OAuth tokens | Not stored | Encrypt at rest in `user_profiles` table |

### Ongoing

- Never expose carrier API keys (AfterShip, UPS, FedEx) to the frontend
- All external API calls go through backend only
- Row Level Security (RLS) on every Supabase table
- Rate limiting on email scan endpoint (prevent abuse)

---

## 10. Open Questions & Decisions

| # | Question | Options | Decision |
|---|---|---|---|
| 1 | Backend hosting | Supabase Edge Functions vs. Vercel API Routes vs. standalone Express | TBD |
| 2 | Carrier API provider | AfterShip ($0.03/tracking) vs. ShipEngine vs. direct carrier APIs only | Leaning AfterShip |
| 3 | Email scan trigger | Manual "Sync" button vs. periodic background scan vs. Gmail push notifications | TBD |
| 4 | Amazon tracking | AfterShip partial support vs. "View on Amazon" only vs. Amazon SP-API | TBD |
| 5 | Offline support | Service worker + IndexedDB vs. React Query persistence plugin | TBD |
| 6 | Push notifications | Supabase + FCM vs. OneSignal vs. web push only | TBD |
| 7 | Deployment platform | Vercel vs. Netlify vs. Supabase hosting | TBD |
| 8 | Monitoring/observability | Sentry vs. LogRocket vs. Supabase logs only | TBD |

---

## Revision History

| Date | Author | Changes |
|---|---|---|
| 2026-03-19 | Scarlett + Claude | Initial architecture plan created |
