# Zetrix Avatar — Demo & Product Guide

This document describes **what each area of the app is for**, **how the screens behave**, and **how to demo** them to stakeholders. It reflects the current **mock prototype** in this repository.

---

## 1. What this build is

| Aspect | Detail |
|--------|--------|
| **Purpose** | Combined experience: **social AI avatar** (content, persona, posting) plus **Digital Identity (ZID)** for **enterprise agents** (credentials, delegations, policies, audit). |
| **Data** | **Mock only.** Lists, credentials, delegations, and policies are static or **in-memory** (e.g. credentialing updates the table until refresh). |
| **Banner** | A top **“Demo Mode”** strip reminds viewers that no real integrations run. |
| **Routing** | Uses `BrowserRouter` with `basename` from Vite (`import.meta.env.BASE_URL`), e.g. for GitHub Pages. |

**Entry flow:** `/` (`Index`) redirects to **`/studio/avatars/create`** if **`onboardingComplete`** is false, else **`/dashboard`**. **`Persona`** still redirects to **`/onboarding`** until creator onboarding is finished. **`Dashboard`** is available even before creator onboarding (e.g. enterprise users).

---

## 2. Information architecture (sidebar)

| Section | Nav items | Role in the product story |
|---------|-----------|---------------------------|
| **Home** | Dashboard, Agent Marketplace | Day-one overview and **discovery / chat** with avatars. |
| **Avatar Studio** | My Avatars, Create Avatar, DPO Tuning | **Build and manage** avatars/agents (individual vs enterprise). |
| **Digital Identity (ZID)** | Overview, My Identity, Agent Credentials, Delegations, Policies & Audit | **Trust layer**: who the org is, what agents may do, approvals, governance. |
| **Social Media Avatar** | Content Studio, Content Calendar, Queue & Posting | **Content pipeline** for the personal/social use case. |
| **Account** | Settings | Connections, tokens, consent. |

---

## 3. Module: Core shell & global state

### Layout (`Layout`)

- Renders **sidebar navigation**, **header** (user, notifications), and **page content**.
- Wraps most authenticated-style routes.

### App context (`AppContext`)

- Holds **persona**, **onboarding** flag, **Instagram** mock connection, **calendar** entries, **queue**, **assets**, **notifications**, etc.
- **`onboardingComplete`** means **creator onboarding** (photos, voice, consent) is done; it gates **`Persona`** and is required before the **Individual** path on **Create Avatar** continues into the studio wizard (see §4, §7.2).
- **Content Studio**, **Calendar**, and **Queue** read/write this context for the social workflow.

---

## 4. Module: Onboarding

**Route:** `/onboarding`

**Purpose:** **Creator onboarding** for **individual** avatars: photos, persona basics, questionnaire, voice consent, legal consent, review. **Enterprise** agents do not use this flow.

**How it works:**

- Multi-step wizard (Welcome → Photos → Avatar → Questionnaire → Voice → Consent → Review).
- **Typical path:** User opens the app → **Create Avatar** → chooses **Individual** → is sent here (with router state `resumeCreateIndividual`) before the studio steps.
- Finishing sets **`onboardingComplete`**, updates **persona** / **consent**, generates a mock **content plan**, then:
  - **If** they came from Create as an individual → **`/studio/avatars/create`** with **`preselectIndividual`** so the **Persona / Knowledge / Appearance / Review** wizard opens next.
  - **Else** (e.g. legacy direct link to `/onboarding`) → **`/dashboard`**.
- After this, **Persona** and the rest of the social tools are available.

**Demo tip:** Complete once; for repeat demos, you may need to reset app state (e.g. local storage, if persisted) or use a fresh profile depending on implementation.

---

## 5. Module: Dashboard

**Route:** `/dashboard`

**Purpose:** **Home hub** — snapshot of social avatar health (Instagram, next post, queue, last generated asset) plus **shortcuts into ZID**.

**How it works:**

- **Status cards** from `useApp()` (avatar ready, IG, next post, queue count, last asset).
- **Digital Identity** row: buttons to **My Identity**, **Agent Credentials**, **Delegations** (copy shows illustrative counts).
- **Quick actions** → Content Studio, Persona, Calendar, Settings.
- **Upcoming** list from calendar entries.

**Demo tip:** Use this page to frame “two tracks”: **social** (cards + quick actions) vs **enterprise trust** (ZID row).

---

## 6. Module: Agent Marketplace

**Route:** `/marketplace`

**Purpose:** **Discover and chat** with avatars — separated into **Individual** vs **Enterprise** personas. Includes a **job-agent** style flow (resume, preferences, structured cards) mixed with general chat.

**How it works:**

- **Tabs:** Individual / Enterprise — different mock avatar lists and welcome messages.
- **Conversations:** Pick a thread; send messages (mock assistant replies).
- **Job agent:** Special avatar with **file-type selector**, **structured UI cards** (profile, jobs, application steps) driven by mock data under `src/features/job-agent/`.
- **Sheets / panels** for picking avatars and continuing chats.

**Demo tip:** Show **Enterprise** tab to tie to “operations under policy”; show **Individual** for creator/companion positioning. Mention that **listing entitlements** would be enforced by backend in production.

---

## 7. Module: Avatar Studio

### 7.1 My Avatars

**Route:** `/studio/avatars`

**Purpose:** **Inventory** of all studio entities: **individual avatars** and **enterprise agents**.

**How it works:**

- Data loaded via **React Query** from **`mockStudioEntities`** (simulated delay).
- **Tabs:** All / Individual Avatars / Enterprise Agents.
- **Search** and **sort** (newest, oldest, name, status).
- **`AvatarCard`** links to detail and shows type / ZID hints.
- **Banner:** If navigation **`state.showNoZidBanner`** is set (e.g. after creating an enterprise agent without identity), a **“no digital identity yet”** callout appears with link to **Agent Credentials**.

### 7.2 Create Avatar

**Route:** `/studio/avatars/create`

**Purpose:** **Entry point** for new users (see §1). Guided **creation** of either an **individual** avatar (studio steps: persona / knowledge / appearance / review) or an **enterprise** agent (profile / capabilities / identity & scopes / review).

**How it works:**

- **Step 1:** Choose type via **`TypeSelector`**.
- **Individual:** If **`onboardingComplete`** is false, the app **navigates to `/onboarding`** first (creator setup); after onboarding, user returns here with **Individual** pre-selected for the studio steps. If onboarding was already completed, the **individual** studio wizard opens immediately.
- **Individual (studio):** 5 steps with **react-hook-form** + **Zod** per step: Persona, Knowledge, **Documents (RAG)**, Appearance, Review (`individualStep1Schema`, `individualStep2Schema`, `individualStep3RagSchema`, `individualStep4Schema`).
- **Enterprise:** 4 steps with **Zod** (`enterpriseStep1Schema` … `enterpriseStep3Schema` + review); identity step includes **scope selection** and validity dates.
- **Next** validates current step only; **Finish** runs final validation.
- **Enterprise + “set up identity now”:** May show **bootstrap token modal**; optional path without ZID can navigate to My Avatars **with banner** (`showNoZidBanner`).

**Demo tip:** Walk one path end-to-end; intentionally fail validation once to show guardrails.

### 7.3 Avatar Detail

**Route:** `/studio/avatars/:id`

**Purpose:** **Single-entity hub** — high-level status and tabs differ by **individual** vs **enterprise**.

**How it works:**

- Loads entity from same mock list (React Query).
- **Individual tabs:** Profile, Knowledge, Marketplace, Analytics (placeholder copy).
- **Enterprise tabs:** Profile, Capabilities, **Identity**, Activity, Analytics.
- **Identity tab:** If **`zid_credentialed`**, shows agent **DID**, **scope badges**, link to **Digital Identity** credential page; if not, CTA to **`/identity/agents/credential/:id`**.

### 7.4 DPO Tuning

**Route:** `/studio/dpo`

**Purpose:** Placeholder for **Direct Policy Optimization** at the **studio** level (response behavior tuning), distinct from **delegation / payment policies** in ZID.

**How it works:** Static explanatory card only in the current build.

**Demo tip:** Contrast with **Policies & Audit** (“this is model/voice preference; that is legal/ops delegation policy”).

### 7.5 Content Studio (legacy nav label area)

**Route:** `/studio` → **Content Studio** page (`Studio.tsx`)

**Purpose:** **Generate** images/videos from prompts (mock **Kling AI** branding), themes, moods; gallery and download UX (toast-only in demo).

**How it works:**

- **`generateAsset`** in context adds assets; optional **add to queue**.
- Three-column layout: controls, gallery, inspector.

---

## 8. Module: Digital Identity (ZID)

### 8.1 Overview

**Route:** `/identity`

**Purpose:** **Executive summary** of identity health: verification, credentialed agents, pending delegations, volume-style metrics.

**How it works:**

- React Query bundles **`mockEnterpriseIdentity`**, **`mockIdentityActivity`**, **`mockAgentCredentials`**, **`mockDelegations`**.
- **Cards** + **enterprise DID** (`DIDDisplay`) + **`ActivityFeed`**.

### 8.2 My Identity

**Route:** `/identity/me`

**Purpose:** **Human/org identity** — legal name, verification, **DID**, and **ZIDIdentity** verifiable credential viewer.

**How it works:**

- Loads **`mockEnterpriseIdentity`**; shows **`CredentialViewer`** with **`mockZidIdentityCredential`**.
- Placeholder branch exists for “no identity” wizard (not fully built).

### 8.3 Agent Credentials

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

### 8.4 Agent Credential Detail

**Route:** `/identity/agents/:agentId`

**Purpose:** **Read-only drill-down** for one agent: description, credential status, **agent DID**, **scopes**, validity, usage, link back to **Avatar Studio**.

**How it works:** Resolves **`mockStudioEntities`** + **`mockAgentCredentials`** by `agentId`.

### 8.5 Delegations

**Route:** `/identity/delegations`

**Purpose:** **Inbox** for actions agents propose under delegation — **pending / approved / rejected / expired**.

**How it works:**

- Tabs by status; **pending** sorted by **urgency** (critical / high / normal).
- **Approve / Reject** opens **`DelegationApprovalDialog`**; updates **local state** so list reflects decision without full reload.
- Row navigates to **Delegation Detail**.

**Demo tip:** Open a **critical** pending item to show visual urgency.

### 8.6 Delegation Detail

**Route:** `/identity/delegations/:id`

**Purpose:** **Audit-friendly** single delegation view: summary, **approval chain**, **signature / hash**, **trust chain** (`TrustChainDiagram`), on-chain-style block, **JSON receipt VC**.

**How it works:** Reads **`mockDelegations`** + **`mockEnterpriseIdentity`**; copy actions use **sonner** toasts.

### 8.7 Policies & Audit

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

## 9. Module: Social — Calendar & Queue

### Content Calendar

**Route:** `/calendar`

**Purpose:** **Plan and view** scheduled/generated content on month/week grids.

**How it works:** Reads **`calendarEntries`** from context; filters by status and type; can generate plans / interact with entries (toasts).

### Queue & Posting

**Route:** `/queue`

**Purpose:** **Outbound posting** pipeline — queued items vs history, mock “post now,” method selector.

**How it works:** **`queue`** and **`history`** from context; **`postNow`**, cancel, notifications.

---

## 10. Module: Persona (Edit Avatar)

**Route:** `/persona`

**Purpose:** Edit **user’s primary persona** (bio, tone, style) and run an embedded **DPO-style Q&A** to refine behavior (mock flow).

**How it works:** Requires **onboarding complete**; updates **`useApp().persona`**; includes delete persona path.

**Demo tip:** Differentiate from **Avatar Studio** “My Avatars” — Persona is the **default social identity** in this app model; Studio holds **multiple** entities including enterprise agents.

---

## 11. Module: Settings

**Route:** `/settings`

**Purpose:** **Connections and security** — Instagram (mock connect/disconnect, token display), email integrations (Gmail/Outlook mocks), consent / export references.

**How it works:** Reads/writes **`useApp()`**; toasts for actions.

---

## 12. Cross-module story (for demos)

1. **Create** an enterprise agent (**Create Avatar**) → optional **credential** path.
2. **Credential** it (**Agent Credentials** wizard) → scopes/bounds/review → bootstrap token.
3. **Configure** per-scope policy (**Policies & Audit**) for that agent.
4. **See** delegation requests (**Delegations**) → **approve/reject** → **Delegation Detail** for receipt/trust chain.
5. **Discover** agents (**Agent Marketplace**) under Individual vs Enterprise.
6. **Parallel track:** **Content Studio** → **Calendar** → **Queue** for social publishing.

---

## 13. Key files (for technical readers)

| Area | Location |
|------|----------|
| Routes | `src/App.tsx` |
| Nav | `src/components/Layout.tsx` |
| Studio mocks / types | `src/data/studio/mock-avatars.ts`, `src/types/studio.ts` |
| Identity mocks / types | `src/data/identity/*.ts`, `src/types/identity.ts` |
| Create avatar Zod | `src/lib/studio/create-avatar-schemas.ts` |
| Credentialing UI | `src/components/identity/CredentialingWizard.tsx` |
| Policy UI | `src/components/identity/PolicyEditor.tsx` |
| Marketplace / job agent | `src/pages/Marketplace.tsx`, `src/features/job-agent/` |

---

## 14. Limitations (set expectations)

- No real blockchain, identity provider, or payment calls.
- Policy saves and CSV export are **simulated**.
- Many **detail tabs** (analytics, activity bodies) are **placeholders**.
- **DPO Tuning** page under Studio is **not** wired to the full Persona DPO flow.

---

*Last updated to match the repository structure and behavior as of this document’s authoring.*
