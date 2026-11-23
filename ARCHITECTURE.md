# ProFlex — System Architecture and Requirements

## 1. Project Overview

ProFlex is a web-based practice management system designed primarily for physiotherapists and physiotherapy clinics.

The platform brings together appointment scheduling, patient management, clinical assessments, consultation records and reporting tools.

The project aims to provide an organised working environment for healthcare professionals whilst supporting the future development of multi-user practices, subscription management and centralised platform administration.

ProFlex is being developed using React, JavaScript, Vite and Firebase.

The application remains under active development. This document distinguishes between existing functionality, features undergoing testing and requirements planned for future implementation.

## 2. Account Types

The platform is designed to support three customer account types:

### Independent Professionals (`autonomo`)

Healthcare professionals working independently and managing their own patients, appointments and clinical records.

### Clinics (`clinica`)

Healthcare establishments that may employ multiple professionals and administrative staff.

Support for multiple employees, branches and organisational permissions is part of the planned architecture and has not yet been fully implemented.

### Hybrid Professionals (`hibrido`)

Professionals who may work independently whilst also providing services within a clinic or other healthcare organisation.

The hybrid registration profile is available. More advanced organisational relationships and shared working arrangements require further development.

### Platform Owner

The platform owner is responsible for managing ProFlex as a software product rather than using it as a customer.

This account must be independent of the three public registration profiles.

The intended responsibilities include:

- Managing registered professionals and organisations
- Reviewing account status and subscription information
- Administering platform-level settings
- Monitoring authorised administrative activity
- Managing commercial services and subscription plans

Platform ownership must not automatically grant access to patients' confidential clinical records.

A dedicated owner account and its administrative permissions remain to be configured and tested.

## 3. Organisations and Branches

The intended architecture supports organisations operating across multiple locations.

The following requirements form part of the longer-term design:

- An organisation may manage multiple branches.
- Each branch may maintain its own schedules and staff assignments.
- Healthcare professionals may work across different branches.
- Professionals may be associated with more than one organisation.
- Organisational membership must determine the scope of each user's access.
- Patient and administrative information must be accessible only to authorised users.
- Data belonging to separate organisations must remain appropriately isolated.

The current application uses user-specific Firestore paths for patient and appointment records.

A complete multi-organisation and multi-branch data model has not yet been implemented.

## 4. Authentication and User Permissions

### Current Implementation

ProFlex uses Firebase Authentication for user identity management.

The application includes:

- User registration and login
- Email verification checks
- Authentication-based route protection
- Separate route protection for platform administration
- Firestore security rules for user-specific records

The `ProtectedRoute.jsx` component checks whether a user is authenticated and has verified their email address.

The `OwnerRoute.jsx` component performs additional checks against the user's Firestore profile and a corresponding permission document.

The administrative permission model includes the role:

`owner`

The owner authorisation mechanism exists in the codebase, but a complete, verified owner account has not yet been established.

### Planned Permission Structure

The intended access model distinguishes between:

- Platform owner
- Organisation administrator
- Healthcare professional
- Receptionist
- Other authorised staff members

Permissions must be based on authenticated identity, organisational membership and assigned responsibilities.

Administrative access must not automatically include permission to view clinical records.

Client-side navigation restrictions are not sufficient on their own. Access to protected data must also be enforced through Firebase security rules or other trusted server-side mechanisms.

## 5. Shared Computers and Staff Access

The system is intended to support healthcare practices where several employees use the same workstation.

Planned requirements include:

- Individual authentication for each operator
- Controlled switching between authorised staff accounts
- Appropriate use of passwords, PINs or other authentication methods
- Automatic session locking after inactivity
- Additional verification for sensitive operations
- Accurate identification of the operator responsible for an action
- Prevention of unauthorised access when another employee uses the workstation

The current application includes session-related information stored in the browser.

A complete staff authentication and operator-switching system has not yet been verified or released.

These features require further security design and testing before operational use.

## 6. Appointment and Scheduling Management

The scheduling functionality forms part of the existing application.

Current features include:

- Appointment creation and management
- Date and time selection
- Consultation duration settings
- Assignment of responsible professionals
- Appointment status information
- Checks for overlapping appointments
- Personal commitments and reminders
- Navigation between scheduling and patient records

Patient appointments are stored using Firebase Firestore within user-specific collections.

Further development may extend the scheduling model to support multiple branches, shared organisational calendars and more detailed staff availability.

## 7. Patient Records and Clinical Assessments

ProFlex provides patient profiles and structured clinical records.

### Patient Information

The application supports the recording of:

- Patient identification and contact details
- Date of birth
- Weight and height
- Relevant medical history
- Comorbidities
- Musculoskeletal conditions
- Neurological conditions
- Medication information
- Additional diagnoses
- Clinical observations

### Initial Assessment

The initial assessment follows a five-stage workflow:

1. Personal information
2. Clinical information
3. Assessment
4. Treatment and clinical observations
5. Review and finalisation

The form requires an explicit saving action before completing the workflow.

The initial assessment is stored as part of the patient's record and is presented in the consultation history as **Consultation 01**.

### Subsequent Consultations

Follow-up consultations are intended to use sequential numbering:

- Consultation 02
- Consultation 03
- Consultation 04
- Subsequent consultations in numerical order

Consultation records may include:

- Main complaint
- Clinical assessment
- Procedures performed
- Patient progress
- Treatment plan and recommendations
- Consultation date and time
- Associated clinical photographs

The initial assessment and subsequent consultations currently use different structures within the patient record.

This distinction must be taken into account when generating reports, calculating dashboard statistics and presenting consultation history.

The numbering and reporting workflows have undergone recent corrections and require continued regression testing.

## 8. Clinical Documents and Reporting

ProFlex uses jsPDF to generate documents directly from information recorded in the application.

Existing interfaces include:

- Patient record summaries
- Individual consultation reports
- Clinical reports
- Initial assessment information
- Prescription drafts
- Medical certificate drafts

Recent work has focused on including the initial assessment in patient record PDFs and ensuring consultations are displayed in numerical order.

Reporting functionality is still being reviewed for completeness and consistency.

### Additional Document Requirements

Future development may include:

- Uploading external medical reports
- Diagnostic examination records
- Imaging documents
- Referrals
- Previous treatment records
- Document source and metadata preservation
- Controlled access to clinical attachments
- More comprehensive clinical timelines

These requirements must be implemented with appropriate data protection and access controls.

## 9. Dashboard and Productivity

The current application includes dashboard information and clinical activity indicators.

The patient record summary includes:

- Number of registered consultations
- Number of assessments and appointments
- Number of records containing clinical progress notes
- Number of clinical photographs

The initial assessment is included in consultation totals when it has been completed and recorded.

Clinical progress indicators count only records containing the corresponding information.

Other productivity features include reminders, birthday notifications, WhatsApp shortcuts and appointment-related information.

### Planned Professional Dashboard

Future requirements include:

- Individual staff activity history
- Working hours and attendance
- Break management
- Personal productivity indicators
- Private earnings and payment tracking
- Consultation fees
- Optional examination commissions

These features are planned requirements rather than completed functionality.

## 10. Data Storage and Persistence

### Firebase Authentication

Firebase Authentication is used to manage user identity and authentication sessions.

### Cloud Firestore

Cloud Firestore is used to store and retrieve structured application information.

The current application uses paths including:

- `usuarios/{uid}`
- `usuarios/{uid}/pacientes/{pacienteId}`
- `usuarios/{uid}/agendamentos/{agendamentoId}`
- `permissoes/{uid}`

Patient and appointment records are accessed through the application context using Firebase operations.

The application uses Firestore listeners to receive updates to patient and appointment collections.

### Firebase Storage

Firebase Storage is configured for file and image handling, including patient profile photographs.

Further checks are required for file access permissions, storage policies and the handling of clinical attachments.

### Browser Local Storage

Browser local storage remains in use for selected application preferences and session-related information.

It is not intended to replace secure authentication or server-enforced access permissions.

The transition away from earlier browser-based persistence has progressed, although the remaining uses of local storage still require review.

## 11. Security and Data Protection

ProFlex handles information that may include confidential health records.

Security and privacy requirements must therefore be considered throughout development.

### Current Security Structure

The codebase includes:

- Firebase Authentication
- Email verification checks
- Protected application routes
- User-specific Firestore data paths
- Firestore security rules restricting access to authenticated users
- A separate permission-document structure for administrative roles

The current Firestore rules restrict access to patient and appointment collections according to the authenticated user's UID.

Ordinary users cannot grant themselves platform owner permissions through the public registration process.

### Outstanding Security Requirements

The following areas require further verification or implementation:

- Complete role-based authorisation
- Platform owner account provisioning
- Organisational access and isolation
- Staff and shared-workstation permissions
- Secure management of administrative privileges
- Audit logging of sensitive operations
- Secure handling of clinical documents
- Backup and recovery procedures
- Data retention and deletion policies
- Security testing of relevant Firebase services

The existence of security rules does not, by itself, establish that the application is ready for unrestricted production use.

Access controls, persistence, recovery procedures and privacy requirements must be tested together.

## 12. Platform Administration

ProFlex includes an administrative interface and route protection intended for platform management.

The intended architecture separates platform ownership from ordinary customer accounts.

### Current Status

The application contains:

- `OwnerRoute.jsx`
- `AdminPremium.jsx`
- `Team.jsx`
- Firestore permission documents
- Administrative route definitions

The owner route checks for a matching user profile and a permission record with the `owner` role.

The administrative interface and team management features still require integration and validation against the intended data sources.

The current Team interface includes demonstration data and must not be treated as a verified directory of registered customers.

### Planned Implementation

The next administrative development phase will involve:

1. Reviewing the existing owner authorisation process.
2. Establishing a dedicated platform owner account.
3. Verifying the Firestore permission structure.
4. Connecting authorised administrative views to registered customer accounts.
5. Separating platform administration from clinical data access.
6. Testing access with both ordinary and privileged accounts.

Commercial subscription management will be developed separately from the essential account and security functions.

## 13. Testing and Quality Assurance

The project includes Vitest and React Testing Library as part of its development environment.

Testing covers both technical behaviour and practical user workflows.

Areas requiring continued testing include:

- Registration and authentication
- Route protection
- Appointment creation and management
- Patient registration and record retrieval
- Initial assessment completion
- Consultation numbering
- Consultation persistence
- Clinical report generation
- Dashboard calculations
- Administrative authorisation
- Data isolation between user accounts

Recent manual testing has confirmed improvements to form focus behaviour and final-stage submission.

Further testing is required to verify the complete interaction between the application interface, Firestore and generated clinical documents.

## 14. Development Priorities

The immediate objective is to consolidate the existing functionality before introducing major architectural changes.

### Priority 1 — Clinical Workflow and Reporting

- Complete consultation and PDF reporting checks
- Finalise date formatting
- Verify consultation history and numbering
- Confirm correct dashboard calculations
- Test saving and retrieving existing records

### Priority 2 — Platform Ownership and Administration

- Verify the current owner route
- Establish the platform owner account
- Review administrative permissions
- Integrate registered user information into authorised administrative views
- Confirm separation between customer and platform access

### Priority 3 — Security and Reliability

- Validate authentication and Firestore rules
- Review remaining browser-based storage
- Verify data isolation
- Assess backup and recovery requirements
- Complete essential access and persistence tests

### Priority 4 — Academic Delivery

- Complete the technical documentation
- Record and explain the architecture
- Collect implementation and testing evidence
- Prepare the final report
- Organise verified development hours
- Prepare the application demonstration

The academic submission deadline is **11 December 2026**.

## 15. Longer-Term Development

Following completion of the essential clinical and administrative functionality, the platform may be extended to support:

- Full multi-organisation management
- Multiple clinic branches
- Advanced staff membership and permissions
- Shared-workstation operator management
- Subscription and billing services
- Extended clinical document management
- More detailed audit records
- Advanced analytics and reporting
- Additional workflow automation
- Improved recovery and continuity procedures

These features are architectural objectives and should not be represented as implemented until development and testing have been completed.

## 16. Conclusion

ProFlex has progressed from an initial practice management interface into a React and Firebase application with patient registration, scheduling, clinical assessments, consultation records and reporting capabilities.

The current architecture provides a foundation for further development, particularly in authentication, structured data storage and the organisation of clinical workflows.

The immediate focus is to complete and verify the existing features, establish appropriate administrative access and improve system reliability.

Future development will build on this foundation whilst maintaining a clear separation between clinical records, organisational administration and platform ownership.

---

**Project:** ProFlex  
**Developer:** Fernando Fogaça  
**Technology:** React, JavaScript, Vite and Firebase  
**Document:** System Architecture and Requirements  
**Last updated:** 23 November 2026  
**Status:** Active development