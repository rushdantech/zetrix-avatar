# Zetrix Avatar — Demo & Product Guide

This document describes **what each area of the app is for**, **how the screens behave**, and **how to demo** them to stakeholders. It reflects the current **mock prototype** in this repository.

---

## 1. What this build is

| Aspect | Detail |
|--------|--------|
| **Purpose** | Combined experience: **social AI avatar** (content, persona, posting) plus **Digital Identity (ZID)** for **AI agents** (credentials, delegations, policies, audit). |
| **Data** | **Mock only.** Lists, credentials, delegations, and policies are static or **in-memory** (e.g. credentialing updates the table until refresh). |
| **Banner** | A top **“Demo Mode”** strip reminds viewers that no real integrations run. |
| **Routing** | Uses `BrowserRouter` with `basename` from Vite (`import.meta.env.BASE_URL`), e.g. for GitHub Pages. |

**Entry flow:** `/` (`Index`) redirects to **`/studio/avatars/create`** if **`onboardingComplete`** is false, else **`/dashboard`**. New users choose **Avatar** and run the **personal avatar wizard** (photos, questionnaire, RAG, voice, consent) on that same page. Legacy URL **`/onboarding`** redirects to **`/studio/avatars/create`**. **`Persona`** redirects to **Create Avatar** until setup is complete. **`onboardingComplete`** in context still marks “personal avatar created.”

---

## 2. Information architecture (sidebar)

| Section | Nav items | Role in the product story |
|---------|-----------|---------------------------|
| **Home** | Dashboard, Marketplace | Day-one overview and **discovery / chat** with listings. |
| **Avatar Studio** | My Avatars, Create Avatar | **Creator-style avatars** (photos, persona, RAG, voice). **DPO** lives on each avatar detail tab. |
| **Agent Studio** | My Agents, Create Agent | **AI agents** for enterprise or personal automation (profile, capabilities, identity, ZID). |
| **Digital Identity (ZID)** | Overview, My Identity, Agent Credentials, Delegations, Policies & Audit | **Trust layer**: who the org is, what agents may do, approvals, governance. |
| **Social Media Avatar** | Content Studio, Content Calendar, Queue & Posting | **Content pipeline** for the personal/social use case. |
| **Account** | Settings | Connections, tokens, consent. |

---

## 3. Module: Core shell & global state

### Layout (`Layout`)

- Renders **sidebar navigation**, **header** (user, notifications), and **page content**.
- Wraps most authenticated-style routes.

### App context (`AppContext`)

- Holds **persona**, **`onboardingComplete`**, **`ragDocuments`** (RAG metadata from the personal wizard), **Instagram** mock connection, **calendar** entries, **queue**, **assets**, **notifications**, etc.
- **`onboardingComplete`** means the **personal avatar** wizard on **Create Avatar** was finished; it gates **`Persona`** (see §6.2).
- **Content Studio**, **Calendar**, and **Queue** read/write this context for the social workflow.

---

## 4. Module: Dashboard

**Route:** `/dashboard`

**Purpose:** **Home hub** — snapshot of social avatar health (Instagram, next post, queue, last generated asset) plus **shortcuts into ZID**.

**How it works:**

- **Status cards** from `useApp()` (avatar ready, IG, next post, queue count, last asset).
- **Digital Identity** row: buttons to **My Identity**, **Agent Credentials**, **Delegations** (copy shows illustrative counts).
- **Quick actions** → Content Studio, Persona, Calendar, Settings.
- **Upcoming** list from calendar entries.

**Demo tip:** Use this page to frame “two tracks”: **social** (cards + quick actions) vs **enterprise trust** (ZID row).

---

## 5. Module: Marketplace

**Route:** `/marketplace`

**Purpose:** **Discover and chat** with listings — separated into **Avatars** vs **AI Agents**. Includes a **job-agent** style flow (resume, preferences, structured cards) mixed with general chat.

**How it works:**

- **Tabs:** Avatars / AI Agents — different mock lists and welcome messages.
- **Conversations:** Pick a thread; send messages (mock assistant replies).
- **Job agent:** Special avatar with **file-type selector**, **structured UI cards** (profile, jobs, application steps) driven by mock data under `src/features/job-agent/`.
- **Sheets / panels** for picking avatars and continuing chats.

**Demo tip:** Show **AI Agents** for operations under policy or personal task agents; show **Avatars** for creator/companion positioning. Mention that **listing entitlements** would be enforced by backend in production.

---

## 6. Module: Avatar Studio & Agent Studio

### 6.1 My Avatars

**Route:** `/studio/avatars`

**Purpose:** **Inventory** of **creator-style avatars** only (`type: individual`).

**How it works:**

- Data loaded via **React Query** from **`mockStudioEntities`** (simulated delay), merged with **`userStudioEntities`**.
- **Search** and **sort** (newest, oldest, name, status).
- **`AvatarCard`** links to **`/studio/avatars/:id`**.

### 6.2 Create Avatar

**Route:** `/studio/avatars/create` (legacy **`/onboarding`** redirects here)

> **There is no separate “Onboarding” product.** The guided wizard runs as **Create Avatar** (`IndividualOnboardingFlow`).

**Purpose:** **Avatar** onboarding only — Welcome → Photos → profile → Questionnaire (SFT) → RAG → Voice → Consent → Review.

**How it works:**

- Saves **`ragDocuments`**, **`persona`**, **`consent`**, sets **`onboardingComplete`**, then **`/dashboard`**. Header / welcome links can jump to **Create Agent** (`/studio/agents/create`).
- When **`onboardingComplete`**, a short note explains another avatar updates **Persona** and **My Avatars**.

### 6.3 My Agents

**Route:** `/studio/agents`

**Purpose:** **Inventory** of **AI agents** only (`type: enterprise`).

**How it works:**

- Same data source as My Avatars; list filtered to enterprise entities.
- **`AvatarCard`** links to **`/studio/agents/:id`**.
- **Banner:** If **`state.showNoZidBanner`** (e.g. after creating an agent without identity), **“no digital identity yet”** with link to **Agent Credentials**.

### 6.4 Create Agent

**Route:** `/studio/agents/create`

**Purpose:** **AI agent** wizard only — Profile → Capabilities → Identity → Review; **BootstrapTokenModal** when issuing identity.

**How it works:**

- **react-hook-form** + **Zod** (`enterpriseStep1Schema` … `enterpriseStep3Schema` + review).
- Without ZID: save entity and navigate to **My Agents** with optional **`showNoZidBanner`**.

**Demo tip:** Run **Create Avatar** once, then **Create Agent** once; try validation errors on identity step.

### 6.5 Entity detail (avatar vs agent)

**Routes:** **`/studio/avatars/:id`** (individual), **`/studio/agents/:id`** (enterprise). Same **`AvatarDetail`** component; mismatched URL **type** redirects to the correct base path.

**How it works:**

- **Avatar (individual) tabs:** Welcome, Photos, Avatar, Questionnaire (SFT), DPO, Personal Knowledge Model, Voice, Marketplace, Analytics.
- **AI agent tabs:** Profile, Capabilities, **Identity**, Activity, Analytics.
- **Identity tab:** If **`zid_credentialed`**, shows agent **DID**, **scope badges**, link to **Digital Identity**; if not, CTA to **`/identity/agents/credential/:id`**.

### 6.6 DPO (Direct Policy Optimization)

**Where:** **My Avatars** → open an **avatar** (`/studio/avatars/:id`, creator-style entity) → **DPO** tab (not a separate sidebar module).

**Purpose:** Demo **preference questionnaire** for response-behavior tuning **per avatar**, distinct from **delegation / payment policies** in ZID (**Policies & Audit**).

**How it works:** Generate mock questions, answer one-by-one; answers are stored on the avatar when you **Save changes**. Legacy URL `/studio/dpo` redirects to **My Avatars**.

### 6.7 Content Studio (legacy nav label area)

**Route:** `/studio` → **Content Studio** page (`Studio.tsx`)

**Purpose:** **Generate** images/videos from prompts (mock **Kling AI** branding), themes, moods; gallery and download UX (toast-only in demo).

**How it works:**

- **`generateAsset`** in context adds assets; optional **add to queue**.
- Three-column layout: controls, gallery, inspector.

---

## 7. Module: Digital Identity (ZID)

### 7.1 Overview

**Route:** `/identity`

**Purpose:** **Executive summary** of identity health: verification, credentialed agents, pending delegations, volume-style metrics.

**How it works:**

- React Query bundles **`mockEnterpriseIdentity`**, **`mockIdentityActivity`**, **`mockAgentCredentials`**, **`mockDelegations`**.
- **Cards** + **enterprise DID** (`DIDDisplay`) + **`ActivityFeed`**.

### 7.2 My Identity

**Route:** `/identity/me`

**Purpose:** **Human/org identity** — legal name, verification, **DID**, and **ZIDIdentity** verifiable credential viewer.

**How it works:**

- Loads **`mockEnterpriseIdentity`**; shows **`CredentialViewer`** with **`mockZidIdentityCredential`**.
- Placeholder branch exists for “no identity” wizard (not fully built).

### 7.3 Agent Credentials

**Route:** `/identity/agents`  
**Also:** `/identity/agents/credential/:agentId` (same page; opens wizard and replaces URL to `/identity/agents`)

**Purpose:** **Issue, inspect, revoke** (mock) **credentials** for **enterprise** studio entities.

**How it works:**

- Table merges **enterprise entities** with **`mockAgentCredentials`** + **local state** for newly issued rows.
- **Filters:** all / credentialed / not credentialed / suspended / revoked; **search**.
- **CredentialingWizard** (sheet): **Scopes → Bounds → Review**; on submit, updates local list and can open **BootstrapTokenModal**.
- **Deep link / query:** `?preselect=<agentId>` or path **`credential/:agentId`** pre-opens wizard for that agent.
- **Revoke** uses confirmation dialog; **re-issue** flows through wizard.

**Demo tip:** Emphasize **scopes and bounds** as the contract between org and agent.

### 7.4 Agent Credential Detail

**Route:** `/identity/agents/:agentId`

**Purpose:** **Read-only drill-down** for one agent: description, credential status, **agent DID**, **scopes**, validity, usage, link back to **Avatar Studio**.

**How it works:** Resolves **`mockStudioEntities`** + **`mockAgentCredentials`** by `agentId`.

### 7.5 Delegations

**Route:** `/identity/delegations`

**Purpose:** **Inbox** for actions agents propose under delegation — **pending / approved / rejected / expired**.

**How it works:**

- Tabs by status; **pending** sorted by **urgency** (critical / high / normal).
- **Approve / Reject** opens **`DelegationApprovalDialog`**; updates **local state** so list reflects decision without full reload.
- Row navigates to **Delegation Detail**.

**Demo tip:** Open a **critical** pending item to show visual urgency.

### 7.6 Delegation Detail

**Route:** `/identity/delegations/:id`

**Purpose:** **Audit-friendly** single delegation view: summary, **approval chain**, **signature / hash**, **trust chain** (`TrustChainDiagram`), on-chain-style block, **JSON receipt VC**.

**How it works:** Reads **`mockDelegations`** + **`mockEnterpriseIdentity`**; copy actions use **sonner** toasts.

### 7.7 Policies & Audit

**Route:** `/identity/policies`

**Purpose:** **Governance** — default posture, per-agent **per-scope** rules (auto-approve vs manual, payment caps, counterparty allowlists), **kill switch**; **audit trail** of delegations.

**Policies tab — how it works:**

- **Global controls:** default policy for new agents (radio), **notification** toggles (mock save toast).
- **Per agent:** Only **enterprise** entities with **`zid_credentialed`** get a **`PolicyEditor`**. Initial rows come from **`zid_scopes`** (or full catalog if empty) with **demo defaults** (e.g. auto-approve on one scope type). **`onSave` is a no-op** in the page — persistence is not implemented; UI still toasts on save.
- **Kill switch:** Type **`REVOKE ALL`** to enable mock “revoke all credentials” action.

**Audit tab — how it works:**

- **Date range** filters **`mockDelegations`**.
- **Export CSV** shows a **mock success toast** with count.
- Table: date, agent, action, status, receipt id, **Zetrix TX** (copy), link **View** → delegation detail.

**Demo tip:** Clearly state that **policy enforcement** would run on a **backend/policy engine** in production; this screen is **control-plane UX**.

---

## 8. Module: Social — Calendar & Queue

### Content Calendar

**Route:** `/calendar`

**Purpose:** **Plan and view** scheduled/generated content on month/week grids.

**How it works:** Reads **`calendarEntries`** from context; filters by status and type; can generate plans / interact with entries (toasts).

### Queue & Posting

**Route:** `/queue`

**Purpose:** **Outbound posting** pipeline — queued items vs history, mock “post now,” method selector.

**How it works:** **`queue`** and **`history`** from context; **`postNow`**, cancel, notifications.

---

## 9. Module: Persona (Edit Avatar)

**Route:** `/persona`

**Purpose:** Edit **user’s primary persona** (bio, tone, style), questionnaire, RAG, and voice settings aligned with **Create Avatar → Avatar**.

**How it works:** Requires **onboarding complete**; updates **`useApp().persona`**; includes delete persona path. **DPO** is configured per listing under **My Avatars** → avatar → **DPO** tab.

**Demo tip:** Differentiate from **Avatar Studio** “My Avatars” — Persona is the **default social identity** in this app model; Studio holds **multiple** entities including **AI agents**.

---

## 10. Module: Settings

**Route:** `/settings`

**Purpose:** **Connections and security** — Instagram (mock connect/disconnect, token display), email integrations (Gmail/Outlook mocks), consent / export references.

**How it works:** Reads/writes **`useApp()`**; toasts for actions.

---

## 11. Cross-module story (for demos)

1. **Avatar track:** **`/`** → **Create Avatar → Avatar** (full wizard including **RAG**) → **Dashboard**.
2. **AI agent track:** **Create Avatar → AI Agent** (from sidebar or switch link on the welcome step) → optional **credential** path.
3. **Credential** (**Agent Credentials** wizard) → scopes/bounds/review → bootstrap token.
4. **Configure** per-scope policy (**Policies & Audit**) for that agent.
5. **Delegations** → **approve/reject** → **Delegation Detail** for receipt/trust chain.
6. **Marketplace** (Avatars vs AI Agents).
7. **Parallel:** **Content Studio** → **Calendar** → **Queue** for social publishing.

---

## 12. Key files (for technical readers)

| Area | Location |
|------|----------|
| Routes | `src/App.tsx` (includes `/studio/agents`, `/studio/agents/create`, `/studio/agents/:id`) |
| Nav | `src/components/Layout.tsx` |
| Studio paths helper | `src/lib/studio/studio-paths.ts` |
| Studio mocks / types | `src/data/studio/mock-avatars.ts`, `src/types/studio.ts` |
| Identity mocks / types | `src/data/identity/*.ts`, `src/types/identity.ts` |
| Enterprise create Zod | `src/lib/studio/create-avatar-schemas.ts` |
| Individual flow (onboarding UI) | `src/components/studio/IndividualOnboardingFlow.tsx` |
| Credentialing UI | `src/components/identity/CredentialingWizard.tsx` |
| Policy UI | `src/components/identity/PolicyEditor.tsx` |
| Marketplace / job agent | `src/pages/Marketplace.tsx`, `src/features/job-agent/` |
| RAG upload UI (shared) | `src/components/studio/RagDocumentsUploadZone.tsx` |

---

## 13. Limitations (set expectations)

- No real blockchain, identity provider, or payment calls.
- Policy saves and CSV export are **simulated**.
- Many **detail tabs** (analytics, activity bodies) are **placeholders**.
- **DPO** is a **per-avatar** tab on creator-style avatar detail (`/studio/avatars/:id`), not a standalone studio page.

---

*Last updated to match the repository structure and behavior as of this document’s authoring.*
