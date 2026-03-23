# Insula Afferent — PRD

## One-Line Positioning
An external body-awareness system that automatically models physical status decay for people who can't feel their own body's signals.

## Core Problem
Neurodivergent individuals and people with chronic illness often experience interoception deficits — they struggle to perceive when they're hungry, exhausted, or how long it's been since basic self-care. Existing tools require active logging, but logging itself is a cognitive burden. One missed day leads to guilt and abandonment.

## Core Philosophy
**Estimation over Monitoring.** The system doesn't need to know what the user did — it only needs to estimate how they probably feel right now. All stats decay naturally over time (entropy). Users only interact when they've done something to "restore" a bar.

---

## Numerical Design Disclaimer

> All numerical values (decay rates, Buff coefficients, cascade thresholds, Mental Stats formula weights, inter-stat correlations) will be defined in a separate **Numerical Design Document**. Values shown in this PRD are illustrative placeholders. Final values require testing and user feedback iteration. The Numerical Design Document will be developed as a parallel task during Sprint 1.

**Academic Reference:** The concept of interoception deficit is grounded in the MAIA-2 (Multidimensional Assessment of Interoceptive Awareness) framework developed by the Mehling team at UCSF. MAIA-2 measures perceptual ability (can you feel body signals); this project models body state itself (are you hungry right now). Physical Stats categories are inspired by The Sims' Needs system and general homeostasis principles. Users can fully customize them.

---

## Data Model

The system is organized as **States** (what gets computed) and **Forces** (what changes them).

---

### States

#### Physical Stats
The foundational body signals. These are the core numbers the system tracks.

| Stat | Sims Equivalent | Decay Cycle (placeholder) | Description |
|------|----------------|--------------------------|-------------|
| Cleanliness | Hygiene | ~3 days to zero | Restored by showering, brushing teeth, etc. |
| Hunger | Hunger | ~6 hours to zero | Restored by eating |
| Hydration | (no direct equivalent) | ~3 hours to zero | Restored by drinking water |
| Stamina | Energy | ~16 hours to zero | Restored by sleeping |
| Bladder | Bladder | ~4 hours to zero | Restored by using restroom |
| Environment | Environment | ~7 days to zero | Restored by cleaning |

Users can create custom Physical Stats.

#### Mental Stats (Derived)
The top-level "overall sense of self." Not directly editable — automatically computed from Physical Stats. Analogous to The Sims' Emotion system (determined by Needs + Moodlets).

| Mental Stat | Description |
|-------------|-------------|
| Cognitive Capacity (SAN) | How complex a decision you can make right now |
| Energy (HP) | How much you can get done right now |

**Mental Stats Properties:**
- Users cannot modify directly; only improved by improving Physical Stats
- Default formula is a placeholder; specific weights and correlations defined in Numerical Design Document
- Formula is user-customizable (adjust weights)
- Future: personalized formula fitting via user calibration data

---

### Forces (What Changes States)

Four types of forces act on the states above:

#### 1. Time Decay (Passive, Automatic)
The core entropy mechanic. Every Physical Stat decreases over time at its own rate. This happens whether or not the user opens the app.

- Each stat has a base decay rate (configurable per stat)
- Effective decay rate = base rate × Buff coefficients
- Mental Stats are recomputed whenever Physical Stats change

#### 2. Events (Active, User-Triggered, Instantaneous)
One-time actions that immediately modify Physical Stat values. Users tap a button when they've done something.

| Event | Effect (placeholder) |
|-------|---------------------|
| Shower | Cleanliness +80 |
| Eat a meal | Hunger +60, Stamina +10 |
| Cook | Hunger +60, Stamina -15 |
| Clean the house | Environment +50, Stamina -20 |
| Do homework | Stamina -30 |
| Drink water | Hydration +40 |
| User-defined Event | Custom targets and values |

**Event Properties:**
- One-tap trigger, updates multiple stats simultaneously
- Can be pinned as "frequent events" on the home screen
- Fully customizable: name, icon, stat effects

#### 3. Buffs (Passive or Manual, Persistent, Modifies Decay Rate)
Ongoing conditions that apply multiplier coefficients to decay rates. They don't change stat values directly — they change how fast stats drain.

**Environmental Buffs (auto-fetched):**
| Buff | Data Source | Effect (placeholder) |
|------|-----------|---------------------|
| Rainy / overcast | Open-Meteo API | Stamina decay ×1.2 |
| Low daylight (<10h) | Sunrise-Sunset API | Stamina decay ×1.1 |
| Poor air quality (AQI>100) | OpenAQ API | Global decay ×1.1 |
| Extreme temperature | Open-Meteo API | Hydration decay ×1.3 |

**User Buffs (manual toggle):**
| Buff | Effect (placeholder) |
|------|---------------------|
| Sick | Global decay ×1.5, Stamina decay ×2.0 |
| Exam week (high-pressure mode) | Global decay ×1.3 |
| Menstrual period | Stamina decay ×1.3, Hunger decay ×1.2 |
| User-defined Buff | Custom targets and coefficients |

**Buff Properties:**
- Has start/end dates (e.g., exam week 3/15–3/22) or indefinite (e.g., chronic condition)
- Stackable — multiple Buffs multiply their coefficients
- Shareable via community

#### 4. Cascading Effects (Passive, Automatic, Inter-State)
States affect each other. When a Physical Stat crosses a threshold, it modifies other stats' decay rates or applies penalties to Mental Stats. Inspired by inter-Need dependencies in The Sims.

Directional rules (specific values in Numerical Design Document):
- Low Hydration → Stamina decay accelerates
- Low Stamina → all Events cost more Stamina
- Very low Hunger → Bladder decay pauses
- Low Cleanliness → Mental Stats penalty
- Hunger and Stamina have a positive correlation (mechanism TBD)
- When a Physical Stat drops below a threshold, Mental Stats take an additional penalty

---

## Community
Users can share and import content at four levels of granularity:

- **Individual Buff / Debuff** (e.g., "Pollen allergy season", "Night shift work")
- **Individual Event** (e.g., "30-min yoga" with its stat effects)
- **Mental Stats formula**
- **Profile Template (full configuration):** A template = Physical Stats list + decay rates + Buffs + Events + cascade rules + Mental Stats formula. Examples: "ASD template", "ADHD template", "Chronic fatigue template". New users can pick a community template during onboarding as a starting point, then customize.

All community content supports browsing, searching, and one-click import.

---

## Threshold Alerts
- Users can set a threshold for each Physical Stat and Mental Stat
- Notification fires when a stat drops below its threshold
- Notification tone: neutral factual statement ("Cleanliness is below 20%"), never action directives

## Historical Trends
- Daily status snapshots stored
- Visual trend charts (by day/week)
- Environmental Buff data overlay to help users discover patterns

## User System
- OAuth login (Google)
- Cloud data sync, cross-device access
- All configurations (Physical Stats, Events, Buffs, formulas, thresholds) persisted

---

## Tech Stack

### Frontend
- React + Tailwind CSS
- Status visualization (progress bars, color coding, trend charts)
- Responsive, mobile-first

### Backend
- Node.js + Express
- Decay engine: server-side cron job, supports linear and cascading decay
- Buff coefficient engine: aggregates environmental API data + user Buffs → computes current decay rates
- Mental Stats computation engine: real-time calculation from Physical Stats + user formula
- RESTful API

### Database
- MongoDB (flexible schema for user configs, status history, event definitions, Buff templates, community content)

### External APIs
- Open-Meteo (weather + temperature + daylight)
- Sunrise-Sunset API (precise daylight hours)
- OpenAQ / AirNow (air quality)

### DevOps (Course Requirements)
- CI/CD pipeline
- LLM-as-judge evaluation system
- Security audit
- Parallel agentic programming workflow

---

## User Personas

**Alex, 25, autistic adult**
Regularly fails to notice basic body needs until physical discomfort becomes severe. Hates apps that require daily check-ins. Wants to open the app and instantly see their status.

**Jordan, 32, chronic fatigue syndrome**
Limited daily energy (spoonie). Needs to understand how environmental factors affect their state to allocate energy wisely. Wants the system to explain "why today is particularly bad."

---

## Out of Scope
- Task management / todo lists
- Precise data logging (calories, steps, sleep duration)
- Action suggestions or coaching
- Wearable device integration

---

## Sprint Plan

### Sprint 1: Core Engine + Foundation

**Goal:** User can log in, see Physical Stats decaying in real time, restore them via Events, and see Mental Stats auto-computed.

**Backend:**
- OAuth login (Google)
- Database schema (users, Physical Stats config, Event definitions, status snapshots)
- Decay engine v1: cron job, linear decay, independent rate per stat
- Event execution API: receives Event ID, batch-updates associated Physical Stats
- Mental Stats computation API: weighted average from Physical Stats (placeholder formula)
- Preset Physical Stats + preset Events initialization
- CI/CD pipeline

**Frontend:**
- Login page
- Home screen: Physical Stats bar list (progress bar + percentage + color coding green→yellow→red)
- Mental Stats panel (SAN + HP, computed from Physical Stats, not user-editable)
- Event quick-action buttons (one-tap trigger)
- Manual calibration: slider to adjust any Physical Stat
- Responsive layout

**Sprint 1 Deliverable:** Logged-in app with 6 Physical Stats auto-decaying, preset Events for one-tap restore, Mental Stats auto-computed and displayed.

---

### Sprint 2: Buff System + Environmental Integration + Customization

**Goal:** Environmental data automatically affects decay rates. Users can create custom content.

**Backend:**
- Buff data model (name, target stats, coefficient, start/end date, type)
- Environmental Buff service:
  - Open-Meteo API integration (weather + temperature + daylight)
  - OpenAQ API integration (air quality)
  - Scheduled fetch + caching + fallback/degradation strategy
  - Raw data → Buff coefficient conversion engine
- Decay engine v2: base decay rate × stacked Buff coefficients
- Custom Physical Stats CRUD
- Custom Events CRUD
- Custom Buffs CRUD

**Frontend:**
- Environment panel: current weather, AQI, daylight + corresponding Buff coefficients visualized
- Active Buffs list (environmental auto + user manual)
- Buff create/edit/toggle UI
- Custom Physical Stats creation page
- Custom Events creation page
- Mental Stats formula customization (weight adjustment UI)

**Sprint 2 Deliverable:** Environmental data affects decay in real time. Users can create custom Physical Stats, Events, and Buffs, and customize Mental Stats formula.

---

### Sprint 3: Cascading Effects + Community + Trends + Polish

**Goal:** Non-linear decay, community sharing, historical analysis. Production-grade quality.

**Backend:**
- Decay engine v3: cascading effects rule engine (threshold-triggered modifiers)
- Threshold alert service (polling + push notifications)
- Status history snapshot API (daily recording + query + aggregation)
- Community API: publish/browse/import Buffs, Events, formulas, and Profile Templates
- LLM-as-judge evaluation system (course requirement)
- Security audit (course requirement)

**Frontend:**
- Historical trends page:
  - Physical Stats + Mental Stats line charts (by day/week)
  - Environmental Buff data overlay layer
  - High-pressure mode period annotations
- Community page: browse/search/import other users' Buffs, Events, formulas, and Profile Templates
- Onboarding flow: select a community Profile Template as starting point
- Notification system (browser push + in-page alerts)
- Cascade effect visualization (UI shows chain-reaction hints when a stat drops below threshold)
- Overall UI polish, animations, error handling, loading state optimization

**Sprint 3 Deliverable:** Complete production-grade application with cascading decay, community sharing, historical trends, threshold alerts, LLM evaluation, and security audit.