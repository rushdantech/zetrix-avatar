# Product Requirements Document (PRD)

## Zetrix Avatar — From Mock to Production

**Document purpose:** Translate the current interactive mock into requirements for building the production application.  
**Source baseline:** Mock app in this repository (React / Vite, client-side state + mock data).  
**Agent creation platform:** **OpenClaw** — used to provision and operate backend agents; this PRD specifies what the product must do and where OpenClaw fits.

**Version:** 1.0  
**Status:** Draft for engineering & product alignment  

---

## 1. Executive summary

**Zetrix Avatar** is a unified experience for:

1. **Personal & professional AI avatars** — create, tune, and (optionally) publish personas for social and work contexts.  
2. **Enterprise AI agents** — create task-oriented agents, bind digital identity (ZID-style), attach knowledge, and operate them with human-in-the-loop controls.  
3. **Marketplace** — discover, follow, and chat with published avatars/agents from others.  
4. **Digital assets & trust** — verifiable identity (DID / VC metaphor), scoped credentials, delegations, and audit.

The mock demonstrates UX, information architecture, and domain concepts. The production system must replace mocks with real services, persist data, enforce security, and **integrate OpenClaw** for **agent lifecycle and execution** while keeping Zetrix-specific UX (studios, marketplace, identity screens).

---

## 2. Goals & success metrics

| Goal | Description | Example metrics |
|------|-------------|-----------------|
| **G1** | Users can create and manage avatars end-to-end | Time to first published avatar; completion rate of create flow |
| **G2** | Users can create agents via product UI; backend agents exist in OpenClaw | Create success rate; OpenClaw agent ID linked to every studio agent |
| **G3** | Marketplace drives discovery and controlled chat | Follow rate; chat sessions post-follow |
| **G4** | Enterprise users trust identity & delegation flows | Credential attach rate; delegation approval latency |

---

## 3. Personas

| Persona | Needs |
|---------|--------|
| **Creator / consumer** | Simple avatar setup, marketplace discovery, safe chat. |
| **Professional user** | Work-appropriate avatar, clarity on data use. |
| **Business operator** | Enterprise agents, policies, delegations, audit exports. |
| **Admin / compliance** | Identity verification, scope enforcement, kill switches. |

---

## 4. Product scope (from mock)

### 4.1 Information architecture (sidebar)

| Area | Routes / areas (mock) | Production intent |
|------|------------------------|-------------------|
| **Dashboard** | `/dashboard` | Landing hub; quick links; optional metrics. |
| **Avatar Studio** | Marketplace, My Avatars, Create Avatar | Full parity; real catalog & storage. |
| **Agent Studio** | My Agents, Create Tasks (`/studio/agents/create`), Activity (`/studio/agents/activity`) | **Agent creation via OpenClaw**; activity from real telemetry. |
| **Digital Assets** | Overview, My Identity, Credentials, Delegations, Policies & Audit | Real DID/VC integrations as available. |

**Note:** Social-only modules (e.g. calendar, queue, persona depth) exist in the codebase; prioritize per release plan — not all need v1.

---

## 5. Functional requirements by module

### 5.1 Authentication & user model

- **FR-AUTH-1:** Users authenticate (SSO, email, or corporate IdP — TBD).  
- **FR-AUTH-2:** Tenant / org context for enterprise agents and delegations.  
- **FR-AUTH-3:** Session security and CSRF protection on all state-changing APIs.

*(Mock: single implicit user; production: full identity.)*

---

### 5.2 Avatar Studio

#### Marketplace (`/marketplace`, `/marketplace/chat`)

- **FR-MKT-1:** Browse published avatars/agents with categories (e.g. Influencers, Products & Services).  
- **FR-MKT-2:** **Follow** (subscribe) before chat for non-owned listings; persist subscription server-side.  
- **FR-MKT-3:** Chat sessions tied to listing ID; enforce follow rules server-side.  
- **FR-MKT-4:** “My Avatars” combines **user-created** avatars from studio + **followed** listings with stable categories.

#### My Avatars & Create Avatar (`/studio/avatars`, `/studio/avatars/create`)

- **FR-AV-1:** Create **individual** avatars via multi-step flow: photos, persona, questionnaire (SFT-style), RAG documents (metadata → real upload/indexing), voice (opt-in), consent.  
- **FR-AV-2:** Persist avatars in backend; merge with catalog rules as in mock (`useMergedStudioEntities` concept).  
- **FR-AV-3:** Publish / unpublish to marketplace with moderation policy (TBD).

---

### 5.3 Agent Studio

#### My Agents (`/studio/agents`)

- **FR-AG-1:** List **enterprise** agents owned by the user; search/sort.  
- **FR-AG-2:** **Chat with Agent** opens task configuration UI (task chat panel).  
- **FR-AG-3:** Optional: open chat after create via deep link / query (`?chat=` pattern in mock).  
- **FR-AG-4:** Delete agent removes studio record **and** triggers OpenClaw deprovision (or archive) per policy.

#### Create Agent / Create Task (`/studio/agents/create`)

- **FR-CR-1:** Multi-step wizard: profile (name, description), knowledge base, identity & scopes, review.  
- **FR-CR-2:** On submit, show provisioning progress; on completion navigate to My Agents and open task chat.  
- **FR-CR-3:** **OpenClaw integration (mandatory for production):**  
  - Map wizard output to OpenClaw **agent definition** (name, description, tools/scopes, knowledge attachments, environment).  
  - Receive **OpenClaw agent identifier**; store in Zetrix `StudioEntity` / agent record.  
  - Handle async provisioning failures with user-visible errors and retry.  
- **FR-CR-4:** Capabilities beyond profile/knowledge are refined in **task chat** (mock behavior) — production should sync locked briefs to OpenClaw or orchestration layer.

**OpenClaw responsibilities (conceptual):**

- Create/update/delete runnable agents.  
- Execute tasks, tool calls, and integrations according to policy.  
- Emit events/logs consumable by **Activity** (below).

**Zetrix responsibilities:**

- UX, tenancy, marketplace linkage, ZID binding, delegations, and audit presentation.

---

#### Agent detail (`/studio/agents/:id`)

- **FR-DET-1:** Enterprise profile shows **agent name** and **description** (mock simplified); optional expansion later.  
- **FR-DET-2:** Identity, knowledge base, and marketplace tabs as product requires — backed by real APIs.

#### Task chat (`AgentTaskChatPanel`)

- **FR-TCH-1:** Operator-style messaging; **Lock in** task briefs (mock).  
- **FR-TCH-2:** Persist briefs server-side; push to OpenClaw or workflow engine.  
- **FR-TCH-3:** Exit / navigation: URL state for chat mode; closing returns to list view.

#### Activity (`/studio/agents/activity`)

- **FR-ACT-1:** **Tab: Activity** — chronological operational log per selected agent (parse, validate, submit, etc.).  
- **FR-ACT-2:** **Tab: Delegation activity** — filter delegations by agent + status (pending, approved, rejected, expired, all).  
- **FR-ACT-3:** Data sourced from **real pipeline**: OpenClaw run logs + Zetrix delegation service — not static mock lines.  
- **FR-ACT-4:** Optional: `?tab=delegation` for deep links.

---

### 5.4 Digital Assets (identity & compliance)

#### Overview (`/identity`)

- **FR-ID-1:** Dashboard of identity health, credentials usage, delegation volume (real metrics).

#### My Identity (`/identity/me`)

- **FR-ID-2:** Personal and enterprise identity sections with DID, verification metadata, **Identity VC** viewer.  
- **FR-ID-3:** Links to external explorer (e.g. Zetrix Explorer) where applicable.

#### Credentials (`/identity/agents`)

- **FR-CRD-1:** List agent credentials, scopes, validity; bootstrap/wizard flows as needed.

#### Delegations (`/identity/delegations`, detail `/identity/delegations/:id`)

- **FR-DEL-1:** Queue of delegation requests with urgency; approve/reject with reason.  
- **FR-DEL-2:** Receipts, tx hashes, audit trail — backed by ledger or audit DB.  
- **FR-DEL-3:** Status filters aligned with Agent Studio **Delegation activity** tab.

#### Policies & Audit (`/identity/policies`)

- **FR-POL-1:** Global defaults (mock had simplified controls).  
- **FR-POL-2:** Per-agent policy editors if required by compliance — **or** central policy service fed by OpenClaw + Zetrix RBAC.  
- **FR-POL-3:** Audit export (CSV) with date range; emergency revoke flows with strong confirmation.

---

### 5.5 Settings & integrations

- **FR-SET-1:** Linked email (e.g. Gmail/Outlook) for job-application or outbound flows — real OAuth, token vault.  
- **FR-SET-2:** Notification preferences.

---

## 6. OpenClaw integration specification (for build)

> **Note:** Exact REST/GraphQL/event shapes come from OpenClaw’s official documentation. This section defines **product-level contracts** engineering must satisfy.

| ID | Requirement |
|----|-------------|
| **OC-1** | **Provision:** On successful agent creation in Zetrix, call OpenClaw to create an agent; store returned `openclaw_agent_id` (name TBD) on our agent entity. |
| **OC-2** | **Update:** Profile/knowledge/scope changes sync to OpenClaw (idempotent updates). |
| **OC-3** | **Delete:** User deletion or revoke triggers OpenClaw teardown or archival. |
| **OC-4** | **Task execution:** Task chat “Lock in” creates or updates OpenClaw jobs/workflows (or equivalent). |
| **OC-5** | **Observability:** Streams or webhooks from OpenClaw feed **Activity** log and error states. |
| **OC-6** | **Secrets:** API keys for third-party tools stored in vault; injected by OpenClaw or Zetrix broker — never logged in plain text. |
| **OC-7** | **Failure modes:** Timeouts, partial provision, drift between Zetrix DB and OpenClaw — reconciliation job + user-visible status on agent card. |

**Suggested engineering deliverables:**

- OpenClaw adapter module (server-side).  
- Mapping table: `EnterpriseAgentDraft` / DB entity ↔ OpenClaw config.  
- Webhook endpoint(s) for run status → Activity + notifications.

---

## 7. Data model (conceptual)

| Entity | Key fields (illustrative) | Notes |
|--------|---------------------------|--------|
| **User** | id, tenant_id, profile | |
| **StudioEntity (Individual)** | id, name, description, status, individualSetup, marketplace fields | Maps to avatar. |
| **StudioEntity (Enterprise)** | id, name, description, enterpriseSetup, **openclaw_agent_id**, zid fields | Agent row. |
| **MarketplaceSubscription** | user_id, avatar_id, category, … | Follow relationship. |
| **DelegationRequest** | agent_id, status, action, amounts, hashes, … | |
| **LockedAgentTaskBrief** | agent_id, title, summary, locked_at | From task chat. |
| **ActivityEvent** | agent_id, timestamp, type, outcome | From OpenClaw + internal services |

---

## 8. Non-functional requirements

| Area | Requirement |
|------|--------------|
| **Security** | OWASP ASVS-aligned; least privilege; audit sensitive actions. |
| **Privacy** | PDPA/GDPR-aligned consent for avatars; data retention policy. |
| **Performance** | Marketplace and lists < 2s P95 with pagination. |
| **Availability** | Target SLA TBD; graceful degradation if OpenClaw unavailable (read-only + clear messaging). |
| **i18n** | EN first; MS (Malay) for Malaysia market — TBD. |
| **Accessibility** | WCAG 2.1 AA for core flows. |

---

## 9. Out of scope / mock limitations (explicit)

- Mock uses **in-memory / sessionStorage** for many entities — production requires **authoritative backend**.  
- Mock **delegations, VCs, and activity lines** are illustrative — replace with real services.  
- **No real LLM or OpenClaw calls** in mock — production wires OpenClaw + approved models.  
- **GitHub Pages** static hosting is demo-only; production needs API routes, auth, and secrets management.

---

## 10. Phasing recommendation

| Phase | Scope |
|-------|--------|
| **MVP** | Auth, Avatar create + list, Agent create → **OpenClaw provision**, My Agents, task chat persistence, Marketplace browse/follow/chat (minimal backend). |
| **Phase 2** | Full Digital Assets (DID/VC integrations), delegations pipeline, Activity from OpenClaw telemetry. |
| **Phase 3** | Advanced policies, org RBAC, analytics, mobile. |

---

## 11. Open questions

1. Final **OpenClaw** API version and tenancy model (single vs multi-tenant agents).  
2. **ZID** production APIs vs continued mock parity for demos.  
3. Marketplace **moderation** and **revenue** model.  
4. Regions and data residency (Malaysia-first).  

---

## 12. Document control

| | |
|--|--|
| **Owner** | Product / Engineering (TBD) |
| **Related repos** | This UI repo; future API + OpenClaw adapter services |
| **Next step** | Attach OpenClaw API reference links and sequence diagrams for create → provision → run → log |

---

*End of PRD*
