# ProFlex — Physiotherapy Practice Management

**ProFlex** is a web-based management system developed to support physiotherapists and clinics with their daily administrative and clinical work.

The application brings together appointment scheduling, patient records, clinical assessments and reporting in a single platform. Its aim is to make day-to-day practice management more straightforward, reduce repetitive administrative tasks and help professionals keep their records organised.

ProFlex is being developed as part of a Software Development degree project, with practical requirements drawn from a working physiotherapy practice.

**Live application:** https://proflex-gamma.vercel.app/

## Features

### Appointment Scheduling

- Daily appointment calendar with date navigation
- Appointment booking and management
- Configurable consultation durations
- Appointment status tracking
- Scheduling for registered professionals
- Checks for overlapping appointments
- Personal commitments and reminders

### Patient Management

- Patient registration and profile management
- Contact details and relevant personal information
- Medical history, diagnoses and medication records
- Musculoskeletal and neurological condition tracking
- Patient search and record retrieval
- Clinical documentation linked to individual patient profiles

### Clinical Assessments and Consultations

- Structured initial assessment covering patient history, symptoms and clinical findings
- Five-stage assessment process with a final review before saving
- Initial assessments displayed as Consultation 01
- Sequential numbering for subsequent consultations
- Consultation records covering assessment, treatment, progress and clinical recommendations
- Consultation history available from the patient's clinical record
- Progress tracking across recorded appointments

### Clinical Documents and Reports

- PDF generation using jsPDF
- Individual consultation records
- Patient record summaries
- Clinical reports based on recorded information
- Prescription and medical certificate draft interfaces
- Document previews before printing

Some reporting functions are still being refined to ensure consistency between initial assessments and subsequent consultations.

### Dashboard and Productivity

- Dashboard with practice activity information
- Consultation and clinical progress counters
- Birthday notifications
- Task and appointment reminders
- WhatsApp shortcuts
- Clock, weather and location-related information

### Interface and Navigation

- Responsive layouts for desktop and mobile devices
- Light and dark themes
- Consistent navigation across the application
- Patient search within the clinical record interface
- Registration and login pages
- Protected routes for authenticated users
- Dedicated pages for account and subscription information

## Technology Stack

| Technology | Role |
|---|---|
| React | User interface development |
| JavaScript (JSX) | Application logic and components |
| Vite | Development environment and production builds |
| React Router | Navigation and route management |
| Firebase Authentication | User authentication |
| Cloud Firestore | Storage and retrieval of application records |
| Firebase Storage | File and image storage |
| React Context API | Shared application state |
| Bootstrap | Responsive layout and interface components |
| CSS | Custom styling, themes and layouts |
| Lucide React | Interface icons |
| Recharts | Charts and data visualisation |
| jsPDF | PDF document generation |
| Vitest | Automated testing |
| React Testing Library | Component testing |

Browser local storage is also used for selected interface preferences and session-related information.

## Project Structure

```text
proflex/
├── src/
│   ├── authentication/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── docs/
├── firestore.rules
├── package.json
└── README.md
```

The codebase is organised around reusable React components, application pages, shared state and Firebase services.

The authentication directory contains route protection logic, whilst the context layer manages patient records, appointments and consultation-related operations.

## Getting Started

### Requirements

- Node.js and npm
- A Firebase project configured for the application's required services

### Installation

Clone the repository:

```bash
git clone https://github.com/FernandoFogaca/proflex.git
cd proflex
```

Install the dependencies:

```bash
npm install
```

### Firebase Configuration

Create a `.env.local` file in the project root and configure the Firebase environment variables:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Use the configuration values from your own Firebase project.

Do not commit local environment files or private credentials to the repository. Firebase access must be controlled through appropriate authentication and security rules.

### Development

Start the local development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run the automated tests:

```bash
npm run test:run
```

Check the code with ESLint:

```bash
npm run lint
```

## Authentication and Data Management

ProFlex uses Firebase Authentication and Cloud Firestore for user authentication and application data management.

Patient records and appointments are stored under user-specific Firestore paths. The project also includes Firestore security rules intended to restrict access according to authenticated user identities.

Additional work is under way to review access permissions, session management and the separation between ordinary user accounts and platform administration.

Administrative interfaces are present in the codebase, although parts of their functionality still require integration and validation.

## Development Status

**ProFlex is under active development.**

The main scheduling, patient management and clinical record interfaces have been implemented and are undergoing further testing.

Recent development has focused on improving the initial assessment workflow, preventing unintended form submissions, maintaining consultation numbering and bringing clinical reports and dashboard statistics into line with the recorded information.

The current priorities include:

- Completing PDF reporting and date formatting
- Verifying consultation history and record consistency
- Reviewing authentication and Firestore access permissions
- Establishing a dedicated platform owner account
- Connecting administrative views to registered user information
- Completing functional and security testing

The application has not yet completed the validation required for unrestricted production use involving sensitive clinical information.

## Planned Improvements

Future development will focus on the requirements identified during testing and feedback from professional users.

Areas being considered include:

- Platform administration and account management
- Subscription plans and billing integration
- Improved staff permissions and account access
- Data backup and recovery procedures
- More comprehensive reporting
- Additional workflow automation
- Further security, accessibility and performance improvements

Features will be introduced progressively, with priority given to reliability, data protection and practical usability.

## Project Background

ProFlex began as an independent software development project and was subsequently developed further within the supervised project component of a degree in Systems Analysis and Development.

The system is being designed around the needs of physiotherapy professionals, with an emphasis on practical workflows and maintainable software.

## Developer

Fernando Fogaça

Software Development | Systems Analysis and Development

Technologies used in ProFlex: React, JavaScript, Vite and Firebase.

GitHub: https://github.com/FernandoFogaca

*ProFlex — Management · Scheduling · Care*
