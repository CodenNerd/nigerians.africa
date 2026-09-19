# Nigerians.africa

## Product Design Document

---

# 1. Product Identity & Design Direction

**Nigerians.africa is a public digital civic institution for Nigeria.**

It is a public information and memory infrastructure that makes Nigeria's government, people, problems, money, projects, evidence and history visible and connected.

The product should feel like entering a public space where the country can be explored, understood, investigated and remembered.

It should **not feel like a SaaS dashboard**.

It should **not feel like a social network**.

It should **not feel like a conventional news website**.

It should feel closer to:

* A national public archive
* A civic observatory
* An investigative information platform
* A digital map of public life
* A modern public institution
* A living record of Nigeria

The desired feeling is:

> **“I am looking at Nigeria.”**

rather than:

> **“I am logged into an application.”**

## Brand

**Nigerians.africa**

The domain itself should remain visually prominent as the product identity.

Possible supporting description:

> **A public record of Nigeria.**

The brand should communicate that the system belongs to the public without claiming to represent or be the government.

The product's core loop is:

> **Discover → Understand → Verify → Act → Track → Remember**

---

# 2. Product Philosophy

Nigerians.africa is built around a simple principle:

> **The platform remembers. Citizens decide.**

The system should preserve:

* Facts
* Evidence
* Sources
* Claims
* Responses
* Disagreements
* Decisions
* Projects
* Money
* Outcomes
* History

AI helps people understand and navigate this record, but does not secretly determine what is true, who is guilty, or what citizens should believe.

The underlying philosophy is:

> **Information → Understanding → Evidence → Accountability → Action → Outcome → Memory**

---

# 3. Design Principles

## 3.1 Public by Default

Most information should be accessible without authentication.

Users should be able to:

* Search
* Browse
* Read
* Explore maps
* Investigate public records
* View evidence
* Understand government
* Use AI assistance

without creating an account.

Authentication is primarily for **participation**, not consumption.

---

## 3.2 The Record Is the Interface

The product should emphasize information and relationships rather than dashboards and widgets.

Instead of:

> 14 cards showing statistics

prefer:

> A public record showing what happened, when, who was involved, what evidence exists, what was said in response, and what happened afterward.

---

## 3.3 Evidence First

Important claims should communicate provenance.

Users should easily understand:

* What is being claimed?
* Who said it?
* When?
* What evidence supports it?
* Has it been verified?
* Has it been disputed?
* Has it been corrected?

---

## 3.4 History Should Be Visible

The platform should make time understandable through:

* Timelines
* Historical office holders
* Previous statements
* Previous projects
* Previous budgets
* Reports
* Responses
* Outcomes

The system should feel like it **remembers**.

---

## 3.5 Action Without Pressure

The product should provide practical next steps without becoming politically persuasive.

Examples:

* Report
* Ask
* Verify
* Contact
* Learn
* Support
* Follow
* Submit evidence

---

## 3.6 Relationships Over Silos

The defining interaction should be the ability to move from one piece of public information to another.

A user should be able to follow:

**Problem → Office → Person → Promise → Money → Project → Evidence → Response → Outcome → Memory**

The platform should feel like one connected public record rather than a collection of separate databases.

---

# 4. Visual Personality

## Overall Aesthetic

**Modern civic institution + investigative publication + geographic intelligence.**

### Avoid

* Generic admin dashboards
* Excessive rounded cards
* Gamification
* Social-media feeds
* Political-party aesthetics
* Sensational news styling
* Excessive gradients
* Generic "AI startup" aesthetics
* Dense analytics dashboards

### Prefer

* Strong typography
* Generous whitespace
* Editorial layouts
* Maps
* Timelines
* Evidence panels
* Source references
* Restrained status colors
* Geographic visualizations
* Tables where useful
* Clear hierarchy

---

# 5. Global Navigation

Navigation should feel like a public website rather than an application sidebar.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ NIGERIANS.AFRICA                              Search       About      │
│                                                                      │
│ Government   Problems   Money   Projects   Places   People   Action │
└──────────────────────────────────────────────────────────────────────┘
```

There should be no permanent authenticated sidebar.

The brand should remain visible but understated.

---

# 6. Core User Journey Architecture

The product should be designed around **user goals**, not around database entities or application menus.

Almost every meaningful experience should fall into one or more of these journeys.

---

## 6.1 Discovery Journey

### "I want to understand what is happening."

```text
LAND ON SITE
    ↓
SEARCH / BROWSE
    ↓
FIND TOPIC
    ↓
PLAIN-LANGUAGE OVERVIEW
    ↓
EXPLORE RELATED:
People / Offices / Places / Projects / Money
    ↓
INSPECT SOURCES
    ↓
UNDERSTAND CONTEXT
```

Example:

> "Why is there no electricity in my area?"

The system should identify relevant:

* Places
* Problems
* Government institutions
* Projects
* Funding
* Reports
* Official statements
* Historical records

### End State

**The user understands the situation and knows where the information came from.**

---

# 7. Responsibility Journey

### "Who is responsible?"

This should be a fundamental journey available throughout the product.

```text
PROBLEM
   ↓
RESPONSIBILITY
   ↓
GOVERNMENT OFFICE
   ↓
MANDATE
   ↓
OFFICE HOLDER
   ↓
CURRENT ACTIONS
   ↓
HISTORICAL RECORD
```

The system should not simply return a person's name.

It should explain:

> **Which tier of government → which institution → which office → which official → what responsibility they have.**

### End State

**The citizen knows who is responsible and why.**

---

# 8. Investigation Journey

### "I want to investigate a public problem."

Primary users:

* Citizens
* Journalists
* Researchers
* NGOs
* Civil society organizations

```text
PROBLEM
   ↓
DEFINE / UNDERSTAND
   ↓
WHERE IS IT HAPPENING?
   ↓
WHO IS RESPONSIBLE?
   ↓
WHAT HAS GOVERNMENT DONE?
   ↓
WHAT MONEY HAS BEEN ALLOCATED?
   ↓
WHAT PROJECTS EXIST?
   ↓
WHAT EVIDENCE EXISTS?
   ↓
WHAT HAVE CITIZENS REPORTED?
   ↓
WHAT HAS GOVERNMENT SAID?
   ↓
COMPARE
   ↓
FORM A PICTURE
```

### End State

The user has an **evidence trail**, rather than a collection of disconnected articles.

---

# 9. Public Personality Journey

The **Public Personality Profile (PPP)** is a first-class product experience.

### "I want to understand this person."

```text
SEARCH PERSON
     ↓
PUBLIC PERSONALITY PROFILE
     ↓
CURRENT / HISTORICAL ROLES
     ↓
POLITICAL MEMORY
     ↓
PROMISES / STATEMENTS
     ↓
DECISIONS
     ↓
PROJECTS
     ↓
PUBLIC RECORDS
     ↓
CLAIMS ABOUT PERSON
     ↓
EVIDENCE
     ↓
PERSON'S RESPONSES
     ↓
SOURCES
```

The central design principle is:

> **Separate the person's public record from claims made about the person.**

Information should be categorized visually as:

```text
OFFICIAL RECORD
    └── Verified / sourced

PUBLIC STATEMENT
    └── Source attached

CLAIM
    └── Verification status

ALLEGATION
    └── Evidence / response / status

RUMOUR
    └── Clearly identified as unsubstantiated
```

The profile should feel like a **public research record**, not a social-media profile.

---

# 10. Reporting Journey

### "I want to report something."

This is one of the most important product journeys.

```text
SEE SOMETHING
    ↓
REPORT
    ↓
PHOTO / VIDEO / AUDIO / TEXT
    ↓
LOCATION
    ↓
WHAT HAPPENED?
    ↓
SUBMIT
    ↓
AI ORGANIZES REPORT
    ↓
USER CONFIRMS
    ↓
REPORT CREATED
    ↓
VERIFICATION
    ↓
CONNECTED TO:
    ├── Problem
    ├── Place
    ├── Project
    ├── Office
    └── Person
    ↓
OFFICIAL RESPONSE / ORGANIZATIONAL ACTION
    ↓
OUTCOME
```

The citizen should not need to understand the platform's taxonomy.

They can simply say:

> "This road has been abandoned for two years."

The system helps classify and connect the submission.

### End State

**A citizen observation becomes part of the public record.**

---

# 11. Verification Journey

### "I want to verify something."

```text
CLAIM
  ↓
WHERE DID IT COME FROM?
  ↓
SOURCE
  ↓
PRIMARY EVIDENCE
  ↓
OTHER EVIDENCE
  ↓
OFFICIAL RESPONSE
  ↓
CONFLICTING INFORMATION?
  ↓
VERIFICATION STATUS
  ↓
HISTORY / CORRECTIONS
```

The system should not force every claim into:

> TRUE / FALSE

Sometimes the correct state is:

> **There isn't enough evidence to establish this.**

### End State

The user understands:

* What is known
* What is claimed
* What is disputed
* What is unverified
* What remains unknown

---

# 12. Follow-the-Money Journey

### "I want to understand where public money went."

```text
BUDGET
   ↓
ALLOCATION
   ↓
RELEASE
   ↓
RECIPIENT
   ↓
CONTRACT
   ↓
PROJECT
   ↓
LOCATION
   ↓
PROGRESS
   ↓
EVIDENCE
   ↓
OUTCOME
```

The user can begin anywhere.

Examples:

> "What was this ₦5bn allocation for?"

> "How much money was spent on this road?"

> "What projects are happening in my LGA?"

### End State

**The user can follow public money to a real-world activity — or see where the public record stops.**

Missing information should itself be visible.

---

# 13. Locality Journey

### "I want to understand my locality."

```text
NIGERIA
  ↓
STATE
  ↓
LGA
  ↓
WARD
  ↓
COMMUNITY
  ↓
LOCALITY PAGE
```

The locality page should answer:

```text
WHERE AM I?
    ↓
WHAT PROBLEMS EXIST?
    ↓
WHAT PROJECTS ARE HERE?
    ↓
WHAT MONEY IS BEING SPENT?
    ↓
WHO REPRESENTS / SERVES US?
    ↓
WHAT GOVERNMENT OFFICES OPERATE HERE?
    ↓
WHAT HAVE CITIZENS REPORTED?
    ↓
WHAT ORGANIZATIONS WORK HERE?
    ↓
WHAT IS CHANGING?
```

### End State

**The citizen can see the state of their immediate environment.**

---

# 14. Civic Guidance Journey

### "Something happened to me. What do I do?"

```text
SITUATION
   ↓
UNDERSTAND
   ↓
WHAT ARE MY RIGHTS / OPTIONS?
   ↓
WHAT EVIDENCE SHOULD I KEEP?
   ↓
WHO IS RESPONSIBLE?
   ↓
WHERE SHOULD I REPORT?
   ↓
WHICH ORGANIZATIONS CAN HELP?
   ↓
TAKE ACTION
   ↓
TRACK RESPONSE
```

The user should not need to know the name of a law, agency or process.

They can simply describe the situation.

### End State

**The person moves from confusion to a practical next step.**

---

# 15. NGO / Organization Action Journey

### "I want an organization to act."

```text
REPORT / PROBLEM
      ↓
EVIDENCE
      ↓
PUBLIC RECORD
      ↓
ORGANIZATIONS WORKING ON THIS ISSUE
      ↓
VIEW ORGANIZATION
      ↓
ASSESS:
  • Mission
  • Track Record
  • Funding
  • Spending
  • Projects
  • Outcomes
      ↓
REFER / SUPPORT / CONTACT
      ↓
ORGANIZATION TAKES ACTION
      ↓
CASE / PROJECT RECORD
      ↓
OUTCOME
```

Organizations become **actors in the civic system**, not simply directory entries.

---

# 16. NGO / Project Support Journey

### "I want to support a project."

```text
PROBLEM
   ↓
ORGANIZATION
   ↓
PROJECT
   ↓
WHAT IS NEEDED?
   ↓
FUNDING TARGET
   ↓
FUND / VOLUNTEER / SUPPORT
   ↓
PROJECT PROGRESS
   ↓
SPENDING
   ↓
OUTCOME
```

The same accountability philosophy applies to the organization.

---

# 17. Election Journey

### "I want to understand what happened at an election."

```text
ELECTION
   ↓
CONSTITUENCY
   ↓
POLLING UNIT
   ↓
OFFICIAL RESULT
   ↓
CITIZEN OBSERVATIONS
   ↓
UPLOADED EVIDENCE
   ↓
COMPARE RECORDS
   ↓
IDENTIFY DISCREPANCIES
   ↓
PRESERVE EVIDENCE
   ↓
INVESTIGATION / RESPONSE
   ↓
FINAL RECORD
```

The system should **surface discrepancies and preserve evidence**, rather than independently declaring wrongdoing.

---

# 18. AI Journey

AI should be integrated throughout the product rather than existing only as a chatbot.

```text
USER QUESTION
      ↓
AI IDENTIFIES ENTITIES
      ↓
SEARCHES STRUCTURED RECORD
      ↓
RETRIEVES SOURCES
      ↓
CONNECTS RELATED INFORMATION
      ↓
GENERATES SUMMARY
      ↓
SHOWS SOURCES / EVIDENCE
      ↓
USER EXPLORES
```

Example:

> "What happened to the road project in my community?"

The AI could return:

```text
SUMMARY

The project was approved in 2024.

₦X was allocated.

Construction reportedly began in 2025.

The government's last published update says...

Three citizen reports since then indicate...

EVIDENCE

[Government document]
[Budget]
[Citizen photographs]
[Project record]

Would you like to:

[See timeline]
[Follow the money]
[See evidence]
[Report an update]
```

AI should act as a **guide through the information architecture**.

It should organize, summarize, connect and explain — while keeping the underlying evidence visible.

---

# 19. Political Memory Journey

### "I want to contribute to the public memory."

```text
PUBLIC EVENT
     ↓
RECORD CREATED
     ↓
EVIDENCE
     ↓
VERIFICATION
     ↓
PUBLIC RESPONSE
     ↓
OUTCOME
     ↓
POLITICAL MEMORY
     ↓
FUTURE USERS
```

A report made today should potentially remain useful years later.

This is one of the defining characteristics of the product.

---

# 20. The Five Core Product Loops

All major journeys can ultimately be reduced to five interconnected loops.

## Discovery

**Find → Understand → Explore**

## Verification

**Claim → Evidence → Sources → Verification → History**

## Pool Accountability

**Observe → Report → Verify → Respond → Resolve**

## Public Resource Tracking

**Money → Project → Evidence → Outcome**

## Political Memory

**Event → Record → Response → Outcome → History**

AI operates across all five.

```text
                         NIGERIANS.AFRICA
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
         DISCOVERY           VERIFICATION        ACCOUNTABILITY
             │                    │                    │
             └────────────────────┼────────────────────┘
                                  │
                           PUBLIC RECORD
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
               MONEY           ACTION          MEMORY
                 │                │                │
                 └────────────────┼────────────────┘
                                  │
                                AI
                                  │
                         ORGANIZE • EXPLAIN
                         CONNECT • SUMMARIZE
```

---

# 21. Homepage

The homepage is the public entrance to the entire system.

It should answer:

> **What is happening in Nigeria?**

```text
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                         NIGERIANS.AFRICA                             │
│                                                                      │
│                  A PUBLIC RECORD OF NIGERIA                          │
│                                                                      │
│      Explore the people, institutions, problems, money,              │
│                  projects and events shaping the country.            │
│                                                                      │
│                [ Search anything about Nigeria... ]                  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

# 22. Homepage Sections

## The Country

Large geographic entry point.

```text
┌──────────────────────────────────────────────────────────────────────┐
│                         THE COUNTRY                                  │
│                                                                      │
│                         [ LARGE MAP ]                                │
│                                                                      │
│             Explore Nigeria by state, LGA and community              │
└──────────────────────────────────────────────────────────────────────┘
```

## What People Are Facing

```text
ELECTRICITY       ROADS       FLOODING       HEALTHCARE
──────────        ─────       ───────       ──────────
Reports           Reports     Reports       Reports
Locations         Locations   Locations     Locations

Explore →         Explore →   Explore →     Explore →
```

## Political Memory

Show significant:

* Promises
* Decisions
* Projects
* Historical events
* Public records

## Follow the Money

```text
₦X allocated
      ↓
Ministry
      ↓
Contract
      ↓
Project
      ↓
Current status
```

## Public Record

A stream of meaningful public records, not a social-media feed.

Possible records:

* Government announcements
* Project updates
* Citizen reports
* Official responses
* Evidence
* Budget events
* Public events

## Civic Action

```text
WHAT CAN YOU DO?

[ REPORT SOMETHING ]

[ FIND OUT WHO IS RESPONSIBLE ]

[ LEARN YOUR RIGHTS ]

[ SUBMIT EVIDENCE ]

[ SUPPORT AN ORGANIZATION ]
```

---

# 23. Government Explorer

Government should be represented as a navigable system.

```text
GOVERNMENT

Federal Government
│
├── Executive
│   ├── Ministries
│   └── Agencies
│
├── Legislature
│
├── Judiciary
│
└── Other institutions

State Governments

Local Governments
```

Users can move:

**Institution → Office → Office Holder → Responsibility → Records**

---

# 24. Government Office Page

The office page should be a **public institutional record**.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ GOVERNMENT                                                          │
│                                                                      │
│ Ministry of Works                                                   │
│ Federal Government of Nigeria                                      │
│                                                                      │
│ What this office does                                               │
│ ─────────────────────                                               │
│ Plain-language explanation of mandate.                              │
│                                                                      │
│ RESPONSIBILITIES                                                    │
│ Roads • Infrastructure • Housing • ...                              │
│                                                                      │
│ CURRENT OFFICE HOLDER                                               │
│ [ Person ]                                                           │
│                                                                      │
│ ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│ PUBLIC RECORD                                                       │
│                                                                      │
│ Sep 2026    Government announcement...                              │
│ Aug 2026    Project update...                                       │
│ Jul 2026    Citizen report...                                      │
│ Jun 2026    Budget record...                                       │
│                                                                      │
│ PROJECTS       MONEY       PROBLEMS       PEOPLE       FOI           │
└──────────────────────────────────────────────────────────────────────┘
```

---

# 25. Public Personality Profile

The Public Personality Profile should be one of the signature experiences.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ PEOPLE                                                               │
│                                                                      │
│ [PHOTO]   PERSON NAME                                                │
│           Current / Former Public Role                               │
│                                                                      │
│           Public Personality                                         │
│           Profile updated: DATE                                      │
│                                                                      │
│           [ View sources ] [ Follow ] [ Report an issue ]             │
└──────────────────────────────────────────────────────────────────────┘
```

## Profile Sections

### Overview

* Current role
* Previous roles
* Relevant organizations
* Relevant locations
* Public positions

### Political Memory

Chronological timeline:

```text
2026 ─── Current office
          │
          ├── Statement
          ├── Decision
          └── Project

2025 ─── Campaign / appointment
          │
          └── Promise

2024 ─── Previous role
          │
          └── Decision
```

### Promises & Statements

```text
PUBLIC STATEMENT

"I will..."

Date
Context
Source

Related issue
Current status

[View source]
```

### Claims & Evidence

```text
CLAIMS ABOUT THIS PERSON

┌───────────────────────────────────────────────────────────────┐
│ Claim                                                         │
│                                                               │
│ Status: UNVERIFIED                                           │
│                                                               │
│ Evidence: 2 sources                                          │
│ Response: Person has responded                               │
│                                                               │
│ [View evidence] [View response]                              │
└───────────────────────────────────────────────────────────────┘
```

### Offices Held

Chronological history.

### Projects

Projects associated with the person's public responsibilities.

### Public Money

Relevant budgets and financial records.

### Responses

Responses from the person or their office.

### Sources

Complete source list and provenance.

The profile should communicate:

> **This is a structured public record, not a judgment about the person.**

---

# 26. Problem Page

The problem page should answer:

> **What is happening?**

```text
┌──────────────────────────────────────────────────────────────────────┐
│ PROBLEM                                                              │
│                                                                      │
│ ELECTRICITY ACCESS                                                   │
│                                                                      │
│ What is happening                                                   │
│ [plain-language summary]                                            │
│                                                                      │
│ WHERE                                                                 │
│ [map]                                                                │
│                                                                      │
│ WHO IS RESPONSIBLE                                                   │
│ Government offices / agencies                                        │
│                                                                      │
│ WHAT IS BEING DONE                                                   │
│ Projects / interventions                                             │
│                                                                      │
│ MONEY                                                                 │
│ Funding / allocations                                                │
│                                                                      │
│ EVIDENCE                                                              │
│ Reports / documents / observations                                   │
│                                                                      │
│ HISTORY                                                               │
│ Timeline                                                              │
│                                                                      │
│ WHAT CAN YOU DO?                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

# 27. Project Page

```text
PROJECT

Project name
Location
Responsible office
Contractor

────────────────────────────────────────────

PROJECT STATUS

Planned → Funded → Started → In Progress → Completed

────────────────────────────────────────────

MONEY

Approved       ₦X
Released       ₦X
Reported spend ₦X

────────────────────────────────────────────

WHAT HAS HAPPENED?

Timeline

────────────────────────────────────────────

EVIDENCE

Official documents
Citizen photographs
Reports
Government updates

────────────────────────────────────────────

PUBLIC QUESTIONS

Questions submitted
Official responses

────────────────────────────────────────────

WHAT CAN YOU DO?
```

---

# 28. Follow the Money

The primary interaction should be following relationships.

```text
PUBLIC BUDGET
      │
      ▼
MINISTRY
      │
      ▼
PROGRAM
      │
      ▼
CONTRACT
      │
      ▼
PROJECT
      │
      ▼
OUTCOME
```

Use visual flows, tables and geographic exploration rather than conventional dashboard cards.

---

# 29. Places / God's Eye View

The map is one of the signature experiences.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ PLACES                                                               │
│                                                                      │
│                       [ FULL MAP ]                                   │
│                                                                      │
│ Government offices                                                   │
│ Projects                                                             │
│ Problems                                                             │
│ Citizen reports                                                      │
│ Organizations                                                        │
│ Events                                                               │
│                                                                      │
│ Nigeria → State → LGA → Ward → Community                             │
└──────────────────────────────────────────────────────────────────────┘
```

The map should feel like an **exploration interface**, not GIS software.

---

# 30. Citizen Report Interface

Reporting should be extremely simple.

```text
┌─────────────────────────────────────────────┐
│                                             │
│             SEE SOMETHING?                  │
│                                             │
│       [ TAKE PHOTO / VIDEO ]                │
│                                             │
│       [ RECORD YOUR REPORT ]                │
│                                             │
│       [ WRITE WHAT HAPPENED ]               │
│                                             │
│       Location: Automatically detected      │
│                                             │
│                 [ SUBMIT ]                  │
└─────────────────────────────────────────────┘
```

AI can subsequently organize the submission.

---

# 31. Civic Guidance

```text
WHAT HAPPENED?

[ Police issue ]
[ Electricity issue ]
[ Housing issue ]
[ Government service ]
[ Bribery / corruption ]
[ Consumer issue ]
[ Environmental issue ]
[ Something else ]
```

Then:

```text
WHAT SHOULD I DO?

1. Understand your rights
2. Preserve this evidence
3. Contact the responsible institution
4. Report the issue
5. Organizations that may help
```

---

# 32. Organizations / NGOs

Organization pages use the same public-record philosophy.

```text
ORGANIZATION

Name
Type
Mission
Registration / identity information

WORKING ON

Problems
Projects
Locations

FUNDING

Received
Spent
Projects funded

TRANSPARENCY

Reports
Financial records
Outcomes

CASES / ACTION

Cases
Campaigns
Results
```

---

# 33. Events & Elections

For elections:

```text
ELECTION
│
├── Constituencies
│
├── Polling Units
│
├── Official Results
│
├── Citizen Observations
│
├── Evidence
│
└── Discrepancies
```

Polling-unit pages can show official results alongside independently submitted observations and evidence.

---

# 34. AI Interface

AI should be available throughout the product.

```text
┌───────────────────────────────────────────────┐
│ Ask about this page                           │
│                                               │
│ "Why is this project delayed?"                │
│                                               │
│ [ Ask ]                                       │
└───────────────────────────────────────────────┘
```

AI should be able to:

* Explain
* Summarize
* Connect
* Compare
* Search
* Extract
* Organize
* Translate
* Surface relevant records

It should always provide pathways back to the underlying information.

---

# 35. Search

Search is a core interaction.

Search across:

* People
* Public personalities
* Government offices
* Problems
* Projects
* Places
* Organizations
* Money
* Events
* Evidence

Natural-language search should be supported.

Example:

> "Road projects in Lagos that received funding but are incomplete."

---

# 36. Information Status Language

The product should establish a consistent visual vocabulary.

### Verified

Supported by the platform's defined verification process.

### Official Record

Information originating from an authoritative institution.

### Reported

Submitted by a citizen, organization, journalist or other source but not independently verified.

### Unverified

Insufficient evidence to establish the claim.

### Disputed

There is a substantive challenge to the information.

### Corrected

The platform has identified an error and preserved the correction history.

### AI Generated

A summary or interpretation generated by AI from underlying records.

These states should be visible, not hidden behind tooltips.

---

# 37. Authentication

Authentication should remain visually secondary.

The public experience should not begin with:

> Log in / Sign up

Instead:

```text
PUBLIC INFORMATION
       ↓
EXPLORE
       ↓
UNDERSTAND
       ↓
PARTICIPATE
       ↓
[Sign in when needed]
```

Accounts are primarily required when someone wants to:

* Submit reports
* Upload evidence
* Follow issues
* Participate in organizations
* Manage projects
* Take accountable actions

---

# 38. Responsive Design

## Mobile

Prioritize:

* Search
* Map
* Public records
* Reporting
* Civic guidance
* AI assistance
* Simple navigation

## Desktop

Take advantage of:

* Large maps
* Timelines
* Evidence comparison
* Money flows
* Data tables
* Side-by-side source comparison
* Research workflows

The experience should remain public and editorial at every breakpoint.

---

# 39. Design System

## Typography

Strong editorial hierarchy.

Large page titles.

Readable body text.

Clear metadata and source typography.

## Color

A restrained civic palette.

Color communicates **status and meaning**, not political affiliation.

## Core Components

* Public navigation
* Search
* Maps
* Timelines
* Evidence panels
* Source references
* Status labels
* Data tables
* Money-flow diagrams
* Project progress
* Report submission
* AI explanation panels
* Public-record sections
* Relationship navigation

Avoid excessive card-based layouts.

---

# 40. Signature Interaction: Follow the Thread

The defining interaction of the product should be:

> **Follow the thread.**

A user should be able to move naturally between connected entities.

```text
PROBLEM
   ↓
WHO IS RESPONSIBLE?
   ↓
OFFICE
   ↓
WHO RUNS IT?
   ↓
PERSON
   ↓
WHAT HAVE THEY DONE?
   ↓
PROJECT
   ↓
WHERE DID THE MONEY GO?
   ↓
EVIDENCE
   ↓
WHAT DID CITIZENS REPORT?
   ↓
WHAT DID GOVERNMENT SAY?
   ↓
WHAT CAN I DO?
```

Every major entity should provide pathways into related entities.

---

# 41. Overall Experience Architecture

The product should feel like a **public knowledge system for a country**.

The user may enter through:

* A person
* A problem
* A place
* A project
* A government office
* A budget
* An event
* A question
* A citizen report

They should then be able to follow the relationships until they understand the larger picture.

The experience continuously moves through:

**Information → Understanding → Evidence → Accountability → Action → Outcome → Memory**

---

# 42. Core Product Loop

```text
                         NIGERIANS.AFRICA
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
         DISCOVERY           VERIFICATION        ACCOUNTABILITY
             │                    │                    │
             └────────────────────┼────────────────────┘
                                  │
                           PUBLIC RECORD
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
               MONEY           ACTION          MEMORY
                 │                │                │
                 └────────────────┼────────────────┘
                                  │
                                AI
                                  │
                         ORGANIZE • EXPLAIN
                         CONNECT • SUMMARIZE
```

---

# 43. Core Design Statement

> **Nigerians.africa is not a dashboard of government. It is a public window into the country.**

The interface should make Nigeria's public life:

**Visible.**

**Navigable.**

**Understandable.**

**Verifiable.**

**Actionable.**

**Remembered.**

The system should feel like something that belongs to the public.

**Not an app people log into.**

**A public record people enter.**

---

# 44. Product North Star

Every significant interaction should help answer one or more of these questions:

> **What is happening?**

> **Who is responsible?**

> **What evidence exists?**

> **What has been done?**

> **Where did the money go?**

> **What can I do?**

> **What happened afterward?**

If the product can reliably take a citizen from a question to those answers — and preserve what is learned for the future — it is fulfilling its purpose.

---

# 45. Brand North Star

The name **Nigerians.africa** should not mean that the platform is a social network for Nigerians or a diaspora organization.

It represents a broader idea:

> **Nigeria should be understandable to the people who live in it, participate in it, study it, report on it and care about it.**

The `.africa` identity situates the product within the continent while keeping the system's primary public record focused on Nigeria.

The brand should therefore remain:

**National in scope.**

**African in identity.**

**Public in ownership.**

**Evidence-based in operation.**

**Independent in presentation.**

And the central promise remains:

> **See Nigeria. Understand the record. Follow the thread.**
