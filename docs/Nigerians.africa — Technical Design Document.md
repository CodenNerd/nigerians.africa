# Nigerians.africa
## Technical Design Document

**Version:** 1.0  
**Status:** Technical Architecture  
**Product:** Nigerians.africa  
**Purpose:** Public information, evidence, accountability and civic-memory infrastructure for Nigeria

---

# 1. Technical Vision

Nigerians.africa is a **public knowledge and civic-record system** representing Nigeria as a connected network of:

- People
- Government institutions
- Offices
- Responsibilities
- Problems
- Projects
- Money
- Places
- Organizations
- Events
- Claims
- Evidence
- Responses
- Outcomes
- Historical records

The technical architecture should make these relationships first-class.

The system should therefore not be designed as a collection of independent CRUD applications.

Its fundamental architecture is:

```text
                    NIGERIANS.AFRICA
                           │
                    PUBLIC RECORD
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       ENTITIES        RELATIONSHIPS      EVIDENCE
          │                │                │
          └────────────────┼────────────────┘
                           │
                    POLITICAL MEMORY
                           │
                     CIVIC ACTION
                           │
                           AI
```

The technical system should preserve the underlying record while allowing multiple interfaces to emerge from it.

---

# 2. Core Architectural Principles

## 2.1 Public by Default

Public information should be readable without authentication.

Authentication is required primarily for:

- Reporting
- Evidence submission
- Following records
- Organizational participation
- Moderation
- Government responses
- Administrative functions

---

## 2.2 Structured Data First

Important information should exist as structured records rather than only as generated text.

For example:

```text
Project
├── Problem
├── Government Office
├── Person
├── Location
├── Budget
├── Contractor
├── Evidence
├── Reports
├── Responses
├── Status History
└── Outcome
```

AI can generate explanations from these records, but should not become the system of record.

---

## 2.3 Evidence Is First-Class

Evidence is not merely an attachment.

It is an entity with:

- Source
- Provenance
- Date
- Author/submitter
- Location
- Related claim
- Related entity
- Verification status
- Verification history
- Challenges
- Corrections

---

## 2.4 Immutable History

Important public records should not simply be overwritten.

Changes should produce an audit/history event.

```text
Record
   ↓
Version 1
   ↓
Version 2
   ↓
Correction
   ↓
Version 3
```

The system should preserve what was previously published and why it changed.

---

## 2.5 AI Is Not the Source of Truth

AI may:

- Extract
- Classify
- Summarize
- Translate
- Connect
- Search
- Explain
- Detect possible inconsistencies

AI must not silently:

- Convert allegations into facts
- Invent sources
- Alter official records
- Determine guilt
- Determine political truth
- Replace evidence

Every AI-generated factual answer should be traceable to underlying records.

---

# 3. Recommended Technology Architecture

## 3.1 Primary Stack

### Frontend / Web Application

**Next.js + React + TypeScript**

Use the Next.js App Router for:

- Public pages
- Server-rendered records
- Search
- Entity pages
- Dynamic routes
- AI interfaces
- Authenticated contribution workflows

Next.js is designed for full-stack React applications and supports server/client components and file-system routing.

---

### Database

**PostgreSQL**

PostgreSQL is the primary system of record.

It stores:

- Entities
- Relationships
- Users
- Permissions
- Claims
- Evidence metadata
- Sources
- Verification
- Financial records
- Geographic references
- History
- AI metadata

---

### Geographic Database

**PostGIS**

PostGIS extends PostgreSQL with spatial storage, spatial queries and spatial indexing.

Use it for:

- States
- LGAs
- Wards
- Communities
- Polling units
- Projects
- Citizen reports
- Problems
- Government facilities
- Map boundaries
- Geographic relationships

This allows geographic intelligence without maintaining a separate GIS database.

---

### Object Storage

Use S3-compatible object storage for:

- Images
- PDFs
- Audio
- Video
- Scanned documents
- Evidence files

Store the actual object separately from its structured metadata.

```text
Evidence
   │
   ├── metadata → PostgreSQL
   │
   └── file → Object Storage
```

If Supabase is used as the backend platform, its Storage system provides object storage with Postgres-backed access policies.

---

### Authentication

Use an authentication provider compatible with PostgreSQL authorization.

For the initial implementation:

**Supabase Auth** is suitable.

The system should support:

- Anonymous/public access
- Citizen accounts
- Contributor accounts
- Organization accounts
- Government accounts
- Verifier accounts
- Administrator accounts

Database authorization should be enforced server-side with PostgreSQL Row Level Security rather than relying only on frontend checks. Supabase documents RLS as the database-level mechanism for granular authorization.

---

### AI / Retrieval

Use an LLM provider behind an application-level AI service.

Architecture:

```text
USER
 ↓
AI SERVICE
 ↓
ENTITY / INTENT EXTRACTION
 ↓
STRUCTURED DATABASE SEARCH
 ↓
SEMANTIC SEARCH
 ↓
SOURCE RETRIEVAL
 ↓
LLM
 ↓
ANSWER + CITATIONS
```

Use PostgreSQL `pgvector` for embeddings and semantic retrieval where useful. pgvector supports vector similarity search and storing embeddings inside PostgreSQL.

---

# 4. High-Level System Architecture

```text
                         ┌───────────────────────┐
                         │       USERS           │
                         │ Citizens / Researchers│
                         │ Journalists / NGOs    │
                         │ Government / Verifiers│
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │      NEXT.JS WEB      │
                         │                       │
                         │ Public Experience     │
                         │ Search                │
                         │ Maps                  │
                         │ Records               │
                         │ Reporting             │
                         │ AI                    │
                         └───────────┬───────────┘
                                     │
                              Application API
                                     │
             ┌───────────────────────┼───────────────────────┐
             │                       │                       │
             ▼                       ▼                       ▼
      ┌─────────────┐        ┌──────────────┐       ┌──────────────┐
      │ PostgreSQL  │        │ Object       │       │ AI Service   │
      │ + PostGIS   │        │ Storage      │       │              │
      │ + pgvector  │        │              │       │ LLM + RAG   │
      └──────┬──────┘        └──────────────┘       └──────┬───────┘
             │                                             │
             └─────────────────────┬───────────────────────┘
                                   │
                                   ▼
                         ┌───────────────────────┐
                         │ Background Processing │
                         │                       │
                         │ Ingestion             │
                         │ OCR                   │
                         │ Extraction            │
                         │ Embeddings            │
                         │ Classification        │
                         │ Data validation       │
                         └───────────────────────┘
```

---

# 5. Application Architecture

The initial application should be a **modular monolith**, not microservices.

```text
apps/
  web/

packages/
  ui/
  database/
  domain/
  ai/
  search/
  maps/
  ingestion/
  verification/
  permissions/
```

The modular architecture should allow services to be separated later without prematurely introducing distributed-system complexity.

---

# 6. Domain Modules

The backend should be organized around domain modules.

```text
Government
People
Problems
Projects
Money
Places
Organizations
Events
Evidence
Claims
Verification
Reports
Responses
Political Memory
Civic Guidance
Civic Action
Search
AI
Users
Permissions
```

---

# 7. Core Data Model

## 7.1 Person

```text
Person
---------
id
full_name
aliases
date_of_birth
biographical_summary
photo
created_at
updated_at
```

A Person is a real-world individual.

---

# 8. Public Personality

```text
PublicPersonality
-----------------
id
person_id
classification
description
public_profile
created_at
updated_at
```

This allows the system to distinguish an ordinary person record from a person whose public role makes them relevant to the public record.

---

# 9. Government Institution

```text
GovernmentInstitution
---------------------
id
name
type
level
parent_id
description
mandate
official_website
location_id
created_at
updated_at
```

Examples:

- Federal ministry
- State ministry
- Agency
- Commission
- Legislature
- Judiciary
- Local government institution

---

# 10. Government Office

```text
GovernmentOffice
----------------
id
institution_id
name
title
description
mandate
responsibilities
level
created_at
updated_at
```

---

# 11. Office Holder

Use a relationship rather than embedding a person directly into the office.

```text
OfficeTenure
------------
id
person_id
office_id
start_date
end_date
appointment_type
source_id
created_at
```

This preserves historical office holders.

---

# 12. Responsibility

```text
Responsibility
--------------
id
name
description
institution_id
office_id
source_id
```

This allows the platform to answer:

> Who is responsible for this?

without relying solely on manually written explanations.

---

# 13. Problem

```text
Problem
-------
id
title
description
category
severity
urgency
location_id
status
first_reported_at
created_at
updated_at
```

Relationships:

```text
Problem
 ├── responsible offices
 ├── responsible institutions
 ├── projects
 ├── reports
 ├── evidence
 ├── organizations
 ├── policies
 └── timeline events
```

---

# 14. Project

```text
Project
-------
id
name
description
problem_id
location_id
responsible_office_id
contractor_id
funding_source
approved_amount
released_amount
reported_spend
start_date
expected_end_date
actual_end_date
status
created_at
updated_at
```

Project status should be represented historically.

```text
ProjectStatusHistory
--------------------
id
project_id
status
effective_at
source_id
reason
created_at
```

---

# 15. Financial Model

Financial information should not be reduced to a single project budget.

```text
Budget
Allocation
Release
Transaction
Contract
Payment
Funding
```

Relationships:

```text
Budget
  ↓
Allocation
  ↓
Release
  ↓
Contract
  ↓
Payment
  ↓
Project
  ↓
Outcome
```

Core entities:

```text
Budget
------
id
government_level
institution_id
fiscal_year
amount
document_id
```

```text
Allocation
----------
id
budget_id
program
amount
recipient
project_id
source_id
```

```text
Transaction
-----------
id
payer
recipient
amount
date
purpose
project_id
source_id
```

---

# 16. Location Model

```text
Country
State
LGA
Ward
Community
PollingUnit
Locality
```

All geographic entities should optionally have:

```text
geometry
latitude
longitude
parent_location_id
```

PostGIS spatial indexes should be used for geographic queries.

---

# 17. Organization

NGO should be a type of Organization.

```text
Organization
------------
id
name
type
description
registration_number
website
contact_information
location_id
created_at
updated_at
```

Types:

```text
NGO
Foundation
Community Organization
Development Organization
Legal Organization
Social Enterprise
Research Organization
Other
```

---

# 18. Evidence

Evidence is a core entity.

```text
Evidence
--------
id
type
title
description
source_id
submitted_by
captured_at
published_at
location_id
file_id
hash
verification_status
created_at
updated_at
```

Types:

```text
Document
Photo
Video
Audio
Dataset
Financial Record
Official Statement
Citizen Submission
Third-Party Report
Government Record
```

---

# 19. Source

```text
Source
------
id
type
title
publisher
url
publication_date
accessed_at
author
description
reliability_metadata
created_at
```

Source types:

```text
Government
Court
Legislature
Official Dataset
Organization
Media
Research
Citizen
Other
```

A source should never be silently substituted after publication.

---

# 20. Claim

Claims should be separate from facts.

```text
Claim
-----
id
statement
claimant
date
context
status
created_at
updated_at
```

A claim can reference:

```text
Evidence
Sources
Responses
People
Organizations
Projects
Problems
Events
```

---

# 21. Verification

```text
Verification
------------
id
target_type
target_id
status
reviewer_id
method
notes
created_at
```

Statuses:

```text
Unverified
Under Review
Verified
Disputed
Corrected
Withdrawn
Insufficient Evidence
```

The system should preserve the history of verification decisions.

---

# 22. Challenge

Users should be able to challenge information.

```text
Challenge
---------
id
target_type
target_id
submitted_by
reason
evidence_id
status
created_at
resolved_at
```

This creates an explicit mechanism for correcting the public record.

---

# 23. Citizen Report

A report is an observation, not automatically a fact.

```text
CitizenReport
-------------
id
submitted_by
description
location_id
captured_at
submitted_at
privacy_level
status
problem_id
project_id
office_id
person_id
created_at
```

Initial status:

```text
Submitted
```

Possible lifecycle:

```text
Submitted
   ↓
Screened
   ↓
Under Review
   ↓
Published
   ↓
Connected
   ↓
Responded
   ↓
Resolved / Archived
```

---

# 24. Official Response

```text
OfficialResponse
----------------
id
responding_institution_id
responding_person_id
target_type
target_id
statement
source_id
published_at
created_at
```

A response should be linked to the claim, problem, project or report it addresses.

---

# 25. Political Memory

Political Memory is not merely a table.

It is a historical layer across the entire system.

```text
MemoryEvent
-----------
id
event_type
entity_type
entity_id
date
description
source_id
created_at
```

Examples:

```text
Appointment
Promise
Statement
Decision
Budget
Project Start
Project Update
Citizen Report
Official Response
Outcome
Correction
```

Political Memory can therefore reconstruct the history of:

- A person
- An office
- A project
- A problem
- A place
- An institution
- A policy
- An event

---

# 26. Relationship Model

Relationships should be explicit.

```text
EntityRelationship
------------------
id
from_entity_type
from_entity_id
relationship_type
to_entity_type
to_entity_id
source_id
confidence
created_at
```

Examples:

```text
Person
  └── held_office → GovernmentOffice

Person
  └── made → Promise

GovernmentOffice
  └── responsible_for → Problem

Problem
  └── addressed_by → Project

Project
  └── funded_by → Allocation

Project
  └── supported_by → Evidence

CitizenReport
  └── concerns → Project

OfficialResponse
  └── responds_to → CitizenReport
```

This relationship layer enables the **Follow the Thread** experience.

---

# 27. Entity Graph

Conceptually:

```text
                       PERSON
                      /      \
                 holds        made
                   /           \
               OFFICE        PROMISE
                 │               │
            responsible_for      │
                 │               │
               PROBLEM ──────────┘
                 │
            addressed_by
                 │
              PROJECT
             /       \
        funded_by   located_in
           /           \
       MONEY           PLACE
         │
         │
      EVIDENCE
         │
    ┌────┴────┐
    │         │
 REPORT    RESPONSE
    │         │
    └────┬────┘
         │
       OUTCOME
         │
    POLITICAL MEMORY
```

---

# 28. Search Architecture

Search should combine three methods.

## 28.1 Exact Search

For:

- Names
- Offices
- Projects
- Locations
- IDs
- Contractors

Use PostgreSQL indexes and full-text search.

---

## 28.2 Semantic Search

For natural-language questions:

> "Road projects around Ikeja that are unfinished."

Use embeddings and vector search.

---

## 28.3 Relationship Search

For:

> "Who is responsible for this project?"

Traverse structured relationships.

The AI search layer should combine all three.

---

# 29. AI Retrieval Architecture

The AI layer should use **retrieval-augmented generation**.

```text
USER QUESTION
      │
      ▼
QUESTION ANALYSIS
      │
      ├── Entities
      ├── Location
      ├── Time
      ├── Intent
      └── Relationships
      │
      ▼
RETRIEVAL
      │
      ├── PostgreSQL
      ├── Full-text search
      ├── Vector search
      └── Relationship graph
      │
      ▼
SOURCE FILTERING
      │
      ▼
CONTEXT ASSEMBLY
      │
      ▼
LLM
      │
      ▼
ANSWER
      │
      ├── Sources
      ├── Evidence
      ├── Status labels
      └── Related records
```

---

# 30. AI Provenance Requirement

Every factual statement generated from platform information should have an internal provenance mapping.

Conceptually:

```text
AI statement
     ↓
retrieved record
     ↓
source
     ↓
evidence
```

The UI should allow:

> **Why am I seeing this?**

and reveal the underlying records.

AI-generated summaries should be explicitly labelled.

---

# 31. Document Ingestion Pipeline

The platform will ingest:

- PDFs
- Budgets
- Government reports
- Procurement documents
- Speeches
- Statements
- NGO reports
- Datasets
- Public announcements

Pipeline:

```text
DOCUMENT
   ↓
UPLOAD / FETCH
   ↓
HASH
   ↓
STORE ORIGINAL
   ↓
OCR / TEXT EXTRACTION
   ↓
DOCUMENT CHUNKING
   ↓
ENTITY EXTRACTION
   ↓
CLASSIFICATION
   ↓
SOURCE LINKING
   ↓
EMBEDDINGS
   ↓
HUMAN REVIEW WHERE REQUIRED
   ↓
PUBLIC RECORD
```

The original document must remain preserved.

---

# 32. AI Extraction

AI may propose:

```text
Person
Organization
Project
Amount
Date
Location
Office
Contractor
Claim
Event
```

But extracted information should have a provenance link to the document region from which it was extracted.

AI extraction should produce:

```text
Extracted Fact
      │
      ├── Source Document
      ├── Page / location
      ├── Extraction method
      ├── Confidence
      └── Review status
```

---

# 33. Data Ingestion

External datasets should enter through controlled pipelines.

```text
External Source
      ↓
Raw Dataset
      ↓
Validation
      ↓
Normalization
      ↓
Entity Resolution
      ↓
Deduplication
      ↓
Provenance Assignment
      ↓
Canonical Database
```

Never write raw external data directly into canonical public records.

---

# 34. Entity Resolution

The system must detect that:

```text
"Federal Ministry of Works"
"Ministry of Works"
"FMW"
```

may refer to the same institution.

Likewise:

```text
"John A. Doe"
"John Doe"
"Hon. John Doe"
```

may refer to the same person.

Entity resolution should use:

- Exact identifiers
- Names
- Dates
- Geography
- Official references
- Relationships
- Human review

AI may suggest matches.

It should not silently merge ambiguous identities.

---

# 35. Data Quality

Every canonical record should have:

```text
created_at
updated_at
source_count
last_verified_at
verification_status
provenance
```

Important records should also expose:

```text
Last updated
Sources
Verification status
History
Corrections
```

---

# 36. Audit Log

Administrative changes must produce immutable audit events.

```text
AuditLog
--------
id
actor_id
action
entity_type
entity_id
before
after
timestamp
reason
```

Examples:

```text
Created
Updated
Published
Unpublished
Verified
Disputed
Corrected
Merged
Deleted
```

For public records, deletion should generally mean **withdrawn/archived**, not silently erased.

---

# 37. Permissions

Use role-based access control.

```text
PUBLIC
CITIZEN
VERIFIED_CONTRIBUTOR
ORGANIZATION
GOVERNMENT
VERIFIER
MODERATOR
ADMIN
```

But roles should not determine who controls public truth.

They determine who may:

- Submit
- Edit
- Review
- Respond
- Publish
- Moderate

---

# 38. Security Architecture

Security requirements:

- HTTPS everywhere
- Secure authentication
- Password hashing through auth provider
- Server-side authorization
- Database RLS
- Input validation
- Rate limiting
- Upload validation
- Malware scanning for uploaded files
- Secret management
- Audit logging
- Backup strategy
- Abuse detection
- Bot protection

Supabase's current security documentation specifically recommends combining grants and RLS and keeping privileged service credentials server-side.

---

# 39. Privacy Architecture

Citizen reporting creates privacy risks.

The system should separate:

```text
PUBLIC REPORT
       │
       ├── Public description
       ├── Public evidence
       └── Public location
       
PRIVATE SUBMISSION METADATA
       │
       ├── Submitter identity
       ├── Contact information
       ├── Moderation notes
       └── Sensitive metadata
```

Sensitive information should never become public simply because it was included in an uploaded file.

Strip or control:

- EXIF metadata
- Exact personal addresses
- Phone numbers
- Private email addresses
- Faces where necessary
- Sensitive identifying information

---

# 40. Location Privacy

Not every report should expose exact coordinates.

Location precision should support:

```text
Exact
Street
Community
Ward
LGA
State
Hidden
```

The appropriate level depends on the report's safety and privacy requirements.

---

# 41. API Architecture

Expose domain APIs rather than database tables directly.

Examples:

```text
GET /api/problems/:id
GET /api/projects/:id
GET /api/people/:id
GET /api/offices/:id
GET /api/places/:id
GET /api/organizations/:id
GET /api/evidence/:id
GET /api/timeline/:entity
GET /api/search
POST /api/reports
POST /api/evidence
POST /api/challenges
POST /api/ai/query
```

The API should return related records where appropriate.

Example:

```json
{
  "project": {},
  "problem": {},
  "responsible_office": {},
  "location": {},
  "funding": [],
  "evidence": [],
  "reports": [],
  "responses": [],
  "timeline": []
}
```

---

# 42. Frontend Route Architecture

```text
/
├── government/
│   ├── institutions/
│   ├── offices/
│   └── ...
│
├── people/
│   └── [slug]/
│
├── problems/
│   └── [slug]/
│
├── projects/
│   └── [slug]/
│
├── money/
│   └── [id]/
│
├── places/
│   ├── states/
│   ├── lgas/
│   ├── wards/
│   └── communities/
│
├── organizations/
│   └── [slug]/
│
├── events/
│   └── [slug]/
│
├── evidence/
│   └── [id]/
│
├── search/
│
├── action/
│
├── report/
│
└── ask/
```

---

# 43. Public Page Architecture

Every major entity page should expose:

```text
IDENTITY
   ↓
SUMMARY
   ↓
CURRENT STATE
   ↓
RELATIONSHIPS
   ↓
EVIDENCE
   ↓
HISTORY
   ↓
RESPONSES
   ↓
SOURCES
   ↓
WHAT CAN I DO?
```

This should become the common page architecture across the product.

---

# 44. Follow-the-Thread API

The frontend should be able to request:

```text
GET /api/thread/:entityType/:entityId
```

Response:

```text
{
  entity,
  relationships,
  related_entities,
  evidence,
  timeline,
  sources,
  actions
}
```

Example:

```text
Problem
  ↓
Responsible Office
  ↓
Office Holder
  ↓
Projects
  ↓
Money
  ↓
Evidence
  ↓
Reports
  ↓
Responses
  ↓
Outcome
```

This is one of the most important APIs in the system.

---

# 45. Timeline API

Any entity with history should support:

```text
GET /api/timeline/:entityType/:entityId
```

Example:

```text
2024
 └── Project announced

2025
 ├── Funding allocated
 ├── Contractor appointed
 └── Construction reportedly started

2026
 ├── Citizen report
 ├── Government response
 └── Status disputed
```

---

# 46. Map Architecture

Map data should be loaded progressively.

Do not send the entire national dataset to the browser.

Use:

```text
Viewport
   ↓
Bounding Box Query
   ↓
PostGIS
   ↓
Relevant Features
   ↓
Map
```

For national-scale maps:

- Cluster points
- Simplify geometries
- Use vector tiles where appropriate
- Load detail only when zooming
- Cache common geographic queries

---

# 47. Low-Bandwidth Architecture

The platform should assume unreliable connections.

Priorities:

- Server-rendered pages
- Small HTML payloads
- Optimized images
- Lazy-loaded maps
- Progressive enhancement
- Minimal JavaScript for reading
- Compressed assets
- Pagination
- Cached public records
- Offline-friendly report drafting where practical

The user should be able to read important information without downloading a large application bundle.

---

# 48. Accessibility

Target:

**WCAG 2.2 AA**

Requirements:

- Keyboard navigation
- Semantic HTML
- Screen-reader compatibility
- High contrast
- Visible focus states
- Alternative text
- Captions/transcripts
- Accessible maps
- Accessible tables
- Reduced-motion support
- Voice-friendly interaction

Maps must never be the only way to access geographic information.

---

# 49. Internationalization

The architecture should support multilingual content from the beginning.

```text
English
Pidgin
Yoruba
Hausa
Igbo
```

Additional languages can be added later.

Store translations separately rather than overwriting canonical content.

```text
Content
 ├── English
 ├── Hausa
 ├── Yoruba
 ├── Igbo
 └── Pidgin
```

AI may assist translation, but translated public records should retain their source language and translation provenance.

---

# 50. Caching

Cache public information aggressively.

Suitable cache targets:

- Government institution pages
- People profiles
- Problem pages
- Project pages
- Place pages
- Search results
- Public timelines

Do not cache:

- Private reports
- Sensitive user information
- Authorization decisions
- Moderation actions

---

# 51. Background Jobs

Use asynchronous processing for expensive operations.

```text
Upload Document
      ↓
Queue
      ↓
OCR
      ↓
Extraction
      ↓
Embedding
      ↓
Entity Matching
      ↓
Review
```

Other background jobs:

- Search indexing
- AI summarization
- Image processing
- Video metadata extraction
- Duplicate detection
- Data imports
- Geographic processing
- Notifications

---

# 52. Observability

Track:

### Application

- Request latency
- Error rates
- Server failures
- API usage

### Database

- Slow queries
- Connection usage
- Index performance
- Storage growth

### AI

- Token usage
- Latency
- Retrieval quality
- Failed retrievals
- Hallucination reports
- Citation coverage

### Data

- Failed imports
- Duplicate records
- Verification backlog
- Source freshness
- Broken links

---

# 53. Testing Strategy

## Unit Tests

Test:

- Domain logic
- Permissions
- Status transitions
- Entity matching
- Financial calculations
- Geographic logic

## Integration Tests

Test:

- Database
- Authentication
- API
- Storage
- AI retrieval

## End-to-End Tests

Critical journeys:

```text
Search → Person → Political Memory

Problem → Office → Project → Money

Report → Evidence → Verification

Project → Evidence → Response → Outcome

Question → AI → Sources
```

---

# 54. Data Integrity Tests

The system must prevent:

```text
Project with nonexistent office
Payment with nonexistent recipient
Report linked to nonexistent location
Evidence without provenance
Claim without source/submitter
Office holder without office
```

Use database foreign keys and constraints wherever possible.

---

# 55. Trust Tests

AI answers should be tested for:

- Unsupported claims
- Missing citations
- Incorrect entity matching
- Source confusion
- Outdated information
- Contradictory sources
- Hallucinated facts

A useful internal metric:

> **Citation coverage = factual answer claims traceable to retrieved source material / total factual claims**

---

# 56. MVP Architecture

The hackathon should **not attempt to implement the entire Nigerians.africa platform**.

The MVP should prove the central architecture.

## MVP vertical slice

```text
PROBLEM
   ↓
RESPONSIBLE OFFICE
   ↓
PROJECT
   ↓
MONEY
   ↓
EVIDENCE
   ↓
CITIZEN REPORT
   ↓
OFFICIAL RESPONSE
   ↓
OUTCOME / MEMORY
```

The user should be able to enter through any major record and follow the thread.

---

# 57. MVP Data Scope

Build a deliberately small but realistic dataset.

For example:

```text
5–10 Problems
10–20 Projects
Several Government Offices
Several People
Relevant Locations
Budget / funding records
Evidence documents
Citizen reports
Official responses
Timeline events
```

The goal is not quantity.

The goal is demonstrating the **relationship architecture**.

---

# 58. MVP AI

The MVP AI should demonstrate four capabilities:

### 1. Ask

> "What happened to this project?"

### 2. Explain

Produce a plain-language summary.

### 3. Connect

Identify related:

- Problem
- Office
- Person
- Money
- Evidence
- Reports

### 4. Cite

Every important answer points back to source records.

---

# 59. MVP Signature Demo

The strongest demo should be:

```text
USER
"What happened to this abandoned road project?"

        ↓

NIGERIANS.AFRICA

PROJECT
        ↓
PROBLEM
        ↓
RESPONSIBLE OFFICE
        ↓
OFFICIAL
        ↓
₦ FUNDING
        ↓
CONTRACTOR
        ↓
EVIDENCE
        ↓
3 CITIZEN REPORTS
        ↓
OFFICIAL RESPONSE
        ↓
CURRENT STATUS
        ↓
POLITICAL MEMORY
```

Then:

> **Ask Nigerians.africa**

AI explains the entire thread and links to the evidence.

---

# 60. Deployment Architecture

Initial deployment:

```text
GitHub
   ↓
CI/CD
   ↓
Next.js Application
   ↓
Managed PostgreSQL
   ↓
Object Storage
   ↓
AI Provider
```

Recommended initial hosting architecture:

- Next.js deployment platform
- Managed PostgreSQL/PostGIS
- Managed object storage
- Managed authentication
- Server-side AI API
- Background worker environment

Supabase can consolidate PostgreSQL, PostGIS, pgvector, Auth and Storage for the MVP, reducing infrastructure overhead. Its database platform supports PostGIS and pgvector extensions alongside PostgreSQL.

---

# 61. Repository Architecture

```text
nigerians-africa/
│
├── apps/
│   └── web/
│
├── packages/
│   ├── ui/
│   ├── database/
│   ├── domain/
│   ├── ai/
│   ├── search/
│   ├── maps/
│   └── ingestion/
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed/
│
├── scripts/
│   ├── import/
│   ├── validate/
│   └── seed/
│
├── docs/
│   ├── architecture/
│   ├── data-model/
│   ├── trust/
│   └── api/
│
└── README.md
```

---

# 62. Environment Architecture

```text
Development
     ↓
Preview
     ↓
Staging
     ↓
Production
```

Database migrations must be version controlled.

No manual production schema changes.

---

# 63. Environment Variables

Secrets should include:

```text
DATABASE_URL
AUTH_SECRET
STORAGE credentials
AI_API_KEY
MAP provider key
```

Never expose server secrets to browser code.

---

# 64. Data Governance

The technical system should distinguish:

```text
RAW DATA
   ↓
PROCESSED DATA
   ↓
CANONICAL RECORD
   ↓
PUBLIC RECORD
```

Every transformation should be traceable.

The system should know:

> Where did this information come from?

> When was it imported?

> What changed?

> Who reviewed it?

---

# 65. Trust Architecture

The complete trust chain should be:

```text
SOURCE
   ↓
EVIDENCE
   ↓
CLAIM / RECORD
   ↓
VERIFICATION
   ↓
PUBLICATION
   ↓
RESPONSE / CHALLENGE
   ↓
CORRECTION
   ↓
HISTORY
```

Nothing should jump directly from:

```text
AI → Truth
```

AI sits above the evidence layer.

---

# 66. Technical Definition of the Product

At the system level:

> **Nigerians.africa is a provenance-aware, geographically indexed, historically persistent public knowledge graph backed by structured civic records and an AI retrieval/explanation layer.**

In simpler terms:

> **A database of Nigeria's public life, connected by relationships, preserved through time, and made understandable through AI.**

---

# 67. Architecture North Star

The system should ultimately support this operation:

```text
                    ANY PUBLIC QUESTION
                            │
                            ▼
                     FIND THE RECORD
                            │
                            ▼
                    FOLLOW RELATIONSHIPS
                            │
                            ▼
                     INSPECT EVIDENCE
                            │
                            ▼
                    UNDERSTAND THE HISTORY
                            │
                            ▼
                       TAKE ACTION
                            │
                            ▼
                    RECORD THE OUTCOME
                            │
                            ▼
                    PRESERVE THE MEMORY
```

The technology exists to make that loop reliable.

**The database preserves reality.**

**The relationship layer connects it.**

**Evidence establishes provenance.**

**History preserves it.**

**AI makes it understandable.**

**The citizen decides what to do.**