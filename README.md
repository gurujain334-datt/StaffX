# StaffX 🚀

### AI-Powered Event Workforce Management Platform

> **Plan. Match. Verify. Hire. Manage. Pay. Analyze.**

StaffX is an **AI-powered digital event staffing platform** that connects event organizers with verified on-demand professionals through secure hiring, intelligent workforce matching, attendance management, and transparent payment tracking.

From weddings and conferences to concerts, exhibitions, festivals, and corporate events, StaffX helps organizers build and manage the right workforce for every event.

---

## 📌 Problem Statement

India's event management industry relies heavily on temporary and on-demand professionals such as:

* Security guards
* Waiters
* Cleaners
* Technicians
* Event coordinators
* Hospitality staff
* Other event professionals

The existing staffing process often depends on **informal networks, staffing agencies, phone calls, WhatsApp groups, and manual coordination**.

This creates challenges such as:

* Difficulty finding skilled and trustworthy workers
* Manual verification of professional experience
* Last-minute staffing requirements
* Difficulty coordinating large teams
* Lack of real-time attendance tracking
* Unclear payment processes
* Limited professional reputation and work history
* Time-consuming hiring and workforce management

### 💡 Our Solution

**StaffX digitizes the complete event staffing lifecycle into a single platform.**

---

# 🎯 What is StaffX?

StaffX works as a digital workforce operating platform for events.

### For Event Organizers

Organizers can:

1. Create an event
2. Define staffing requirements
3. Use AI to generate staffing requirements
4. Discover suitable professionals
5. Review AI-powered match recommendations
6. Hire professionals
7. Assign shifts and responsibilities
8. Track attendance
9. Track payments
10. Review workforce performance
11. Analyze event staffing

### For Professionals

Professionals can:

1. Create a professional profile
2. Add skills and experience
3. Discover nearby jobs
4. Receive recommended opportunities
5. Apply for jobs
6. Track application status
7. View hired events
8. Check in and check out
9. Track earnings
10. Build a verified professional reputation

---

# ✨ Key Features

## 🤖 AI Staffing Copilot

Organizers can describe their requirement in natural language.

Example:

> "I need 10 waiters, 4 security guards and 2 cleaners for a wedding on 25 October from 5 PM to 11 PM."

StaffX AI converts the request into a structured staffing plan that the organizer can review and edit before publishing.

### Flow

```text
Natural Language Requirement
          ↓
       Gemini AI
          ↓
Structured Staffing Plan
          ↓
Organizer Review
          ↓
Approve & Publish
```

**Human-in-the-loop:** AI assists the organizer but does not autonomously hire professionals.

---

# 🧠 AI-Powered Staff Matching

StaffX can recommend suitable professionals based on relevant factors such as:

* Skills
* Experience
* Location
* Availability
* Ratings
* Expected pay
* Previous performance

Example:

```text
Wedding Waiter Requirement
          ↓
     StaffX AI Matching
          ↓
 ┌─────────────────────┐
 │ Rahul       96%     │
 │ Amit        92%     │
 │ Priya       89%     │
 └─────────────────────┘
```

The system can also provide an explanation such as:

> **Why this match?**

* Required skills matched
* Available during event time
* Suitable experience
* Located nearby
* Strong professional rating

---

# 👥 Verified Professional Profiles

Professionals can build structured profiles containing:

* Name
* Skills
* Experience
* Location
* Availability
* Certifications
* Work history
* Ratings
* Completed jobs
* Professional reputation

This helps organizers make more informed hiring decisions.

---

# 🔎 Smart Job Discovery

Professionals can browse available event jobs and filter them based on:

* Job role
* Skills
* Location
* Date
* Pay
* Event type
* Experience requirements

AI-powered recommendations can highlight opportunities that are relevant to the professional.

---

# 🤝 Secure Hiring Workflow

Organizers can:

```text
Create Requirement
       ↓
Receive Applications
       ↓
Review Professionals
       ↓
AI Match Insights
       ↓
Accept / Reject
       ↓
Hire Professional
       ↓
Assign Shift
```

The system validates important conditions such as:

* User authorization
* Application status
* Position availability
* Duplicate hiring
* Staffing capacity

---

# 📍 QR-Based Attendance

StaffX can provide event-specific attendance using QR codes.

### Check-In

```text
Professional
     ↓
Scan Event QR
     ↓
Authentication
     ↓
Event & Shift Validation
     ↓
Check-In Recorded
```

The organizer can see:

* Required staff
* Hired staff
* Checked-in staff
* Checked-out staff
* No-show staff

---

# 💳 Transparent Payment Tracking

StaffX provides a transparent payment tracking workflow.

Example:

```text
Agreed Amount
      ↓
Payment Pending
      ↓
Payment Processing
      ↓
Payment Completed
```

Professionals can track their earnings while organizers can track payment status.

> Payment gateway integration can be added as the platform moves toward production.

---

# ⭐ Ratings & Reputation

After a completed event, organizers and professionals can participate in the platform's feedback system.

Professionals can build reputation through:

* Completed events
* Ratings
* Reviews
* Work history
* Skills
* Performance records

This creates a more trustworthy staffing ecosystem.

---

# 📊 Workforce Analytics

Organizers can monitor:

* Staffing progress
* Applications
* Hiring status
* Attendance
* Payments
* Workforce performance
* Event completion

Example:

```text
Required Staff     16
Hired Staff        14
Checked In         13
No Shows            1
Payments            14
```

---

# 🔔 Notifications

StaffX can notify users about important workflow events such as:

* New application
* Application accepted/rejected
* Hiring confirmation
* Shift assignment
* Event reminders
* Attendance updates
* Payment updates
* Review requests

---

# 🔄 Complete StaffX Lifecycle

```text
PLAN
  ↓
MATCH
  ↓
VERIFY
  ↓
HIRE
  ↓
ASSIGN
  ↓
CHECK-IN
  ↓
WORK
  ↓
PAY
  ↓
REVIEW
  ↓
ANALYZE
```

StaffX brings the entire event workforce lifecycle into one platform.

---

# 🏗️ System Architecture

```text
                 ┌─────────────────────┐
                 │      StaffX UI      │
                 │ React / TypeScript  │
                 └──────────┬──────────┘
                            │
                            ↓
                 ┌─────────────────────┐
                 │ Service / API Layer │
                 └──────────┬──────────┘
                            │
              ┌─────────────┴─────────────┐
              ↓                           ↓
   ┌──────────────────┐         ┌──────────────────┐
   │     Supabase     │         │    Gemini AI     │
   │                  │         │                  │
   │ Auth             │         │ AI Matching      │
   │ PostgreSQL        │         │ Staffing Copilot │
   │ Storage           │         │ Recommendations  │
   │ Row Level Security│         └──────────────────┘
   └──────────────────┘
              │
              ↓
       ┌──────────────┐
       │    Vercel    │
       │   Deployment │
       └──────────────┘
```

---

# 🛠️ Technology Stack

| Technology       | Purpose                 |
| ---------------- | ----------------------- |
| React            | Frontend UI             |
| TypeScript       | Type-safe development   |
| Tailwind CSS     | Styling                 |
| Supabase         | Backend platform        |
| PostgreSQL       | Database                |
| Supabase Auth    | Authentication          |
| Supabase Storage | File/storage management |
| Gemini API       | AI capabilities         |
| Vercel           | Deployment              |
| Git              | Version control         |
| GitHub           | Source code management  |

---

# 🗂️ Core Platform Modules

```text
StaffX
│
├── Authentication
│
├── Organizer
│   ├── Dashboard
│   ├── Events
│   ├── Staffing Requirements
│   ├── Applications
│   ├── Workforce
│   ├── Attendance
│   ├── Payments
│   └── Analytics
│
├── Professional
│   ├── Dashboard
│   ├── Job Marketplace
│   ├── Applications
│   ├── My Work
│   ├── Attendance
│   ├── Earnings
│   └── Profile
│
├── AI Intelligence
│   ├── Staffing Copilot
│   ├── AI Matching
│   ├── Recommendations
│   └── Staffing Insights
│
└── Platform Services
    ├── Authentication
    ├── Database
    ├── Notifications
    ├── Storage
    └── Security
```

---

# 🔐 Security

StaffX is designed with security as a core requirement.

Key security considerations include:

* Authentication
* Role-based access control
* Supabase Row Level Security (RLS)
* Protected routes
* Server-side AI API key handling
* Input validation
* Authorization checks
* Secure file handling
* Duplicate action prevention
* Controlled database access

### Important

Sensitive API keys such as the **Gemini API key should never be exposed in frontend code**.

---

# 💰 Business Model

StaffX can use multiple revenue streams.

### 1. Hiring Service Fee

Charge a small service fee on successful staffing transactions.

### 2. Organizer Subscription

```text
Free
  ↓
Pro
  ↓
Business / Enterprise
```

Premium features can include advanced analytics, AI staffing intelligence, larger hiring limits, and multi-event management.

### 3. Featured Jobs

Professionals or staffing partners can pay to promote eligible job listings.

### 4. Professional Premium

Optional premium features for professionals such as enhanced profile visibility and advanced job recommendations.

### 5. Enterprise Plans

Customized plans for:

* Event management companies
* Large organizers
* Exhibition organizers
* Corporate event teams
* Staffing agencies

---

# 🌟 Innovation / USP

StaffX is designed to go beyond being a simple job marketplace.

### Core USP

> **AI-Powered Event Workforce Operating Platform**

The platform combines:

```text
AI Intelligence
      +
Verified Professionals
      +
Smart Matching
      +
Secure Hiring
      +
Workforce Management
      +
Attendance
      +
Transparent Payments
      +
Reputation
      =
StaffX
```

### Standout Concept

**AI Event Staffing Copilot**

An organizer can describe an entire staffing requirement using normal language, and StaffX converts it into an editable staffing plan.

This reduces manual requirement creation while keeping the organizer in control.

---

# 🎯 Example Use Case

### Scenario

A wedding organizer is conducting a wedding reception with 500 guests.

They need:

* 10 Waiters
* 4 Security Guards
* 2 Cleaners

Working time:

**5:00 PM – 11:00 PM**

### StaffX Flow

```text
Organizer Creates Event
          ↓
AI Staffing Copilot
          ↓
10 Waiters
4 Security Guards
2 Cleaners
          ↓
Requirements Published
          ↓
Professionals Apply
          ↓
AI Match Recommendations
          ↓
Organizer Selects Staff
          ↓
Staff Hired
          ↓
Shift Assignment
          ↓
QR Check-In
          ↓
Event Work
          ↓
Check-Out
          ↓
Payment Tracking
          ↓
Ratings & Reviews
          ↓
Event Analytics
```

---

# 📈 Future Scope

Future versions of StaffX can include:

* Advanced workforce forecasting
* AI-based staffing demand prediction
* No-show risk detection
* Smart replacement recommendations
* Advanced professional verification
* Skills and certification verification
* Availability calendars
* Multi-shift management
* Automated notifications
* Payment gateway integration
* Dispute management
* Advanced reputation engine
* Organizer talent pools
* Multi-event management
* Admin and operations dashboard
* Advanced analytics
* Mobile application
* Multilingual support

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

* Node.js
* npm
* Git

You will also need:

* A Supabase project
* A Gemini API configuration
* A Vercel account for deployment

---

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/staffx.git
```

Navigate to the project:

```bash
cd staffx
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env.local` file in the project root.

Example:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

If your project uses a server-side Gemini integration, configure the Gemini API key **only on the server-side environment**.

Do not commit secrets to GitHub.

---

## Run Locally

Start the development server:

```bash
npm run dev
```

Then open the local development URL shown by Vite/your framework in the terminal.

---

# 🧪 Testing

Before deployment, verify:

* User registration
* Login/logout
* Organizer role
* Professional role
* Event creation
* Staffing requirement creation
* Job discovery
* Applications
* Hiring
* Staffing progress
* Attendance
* Payment status
* Reviews
* AI features
* Authorization
* Mobile responsiveness

---

# 🚀 Deployment

StaffX can be deployed using **Vercel**.

General deployment flow:

```text
GitHub Repository
       ↓
     Vercel
       ↓
Environment Variables
       ↓
Production Build
       ↓
StaffX Production Website
```

Make sure all required production environment variables are configured in the deployment platform.

---

# 🤝 Contribution

Contributions, suggestions, and improvements are welcome.

### Basic workflow

```bash
git checkout -b feature/your-feature
```

Make your changes and commit:

```bash
git add .
git commit -m "Add your feature"
```

Push the branch:

```bash
git push origin feature/your-feature
```

Then create a Pull Request.

---

# 📄 Project Documentation

The project can be developed using the following documents as the source of truth:

* Product Requirements Document (PRD)
* Software Requirements Specification (SRS)
* System Architecture Document
* UI/UX Design Document
* Development Plan
* Hackathon Presentation

These documents define the product requirements, technical architecture, user workflows, interface design, and development roadmap.

---

# 🏆 Hackathon Project

StaffX is developed as a **hackathon/SIH-style solution** for the problem of digitizing event staffing and workforce management.

### Problem Statement

> Develop a digital event staffing platform that connects event organizers with verified on-demand professionals through secure hiring, workforce management, and transparent payment mechanisms.

---

# 👨‍💻 Team

**StaffX Development Team**

Built with ❤️ for innovation, hackathons, and the future of event workforce management.

---

# 📜 License

This project is currently intended for educational, hackathon, and prototype purposes.

Add an appropriate open-source license before distributing the project publicly as an open-source product.

---

## ⭐ StaffX

**Plan smarter. Hire faster. Manage better.**

### The futuristic operating system for event workforce management.
>>>>>>> 665bdc1950f6660ba114d481fc7161e973af9ed9
