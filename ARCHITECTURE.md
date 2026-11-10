
# ProFlex - Architecture and Requirements

## 1. Account Types
- Independent healthcare professionals
- Clinics with multiple employees
- Clinics with multiple branches
- Hybrid professionals working independently and in clinics

## 2. Organisations and Branches
- One organisation may manage multiple branches.
- Each branch may have different staff and schedules.
- Clinics may include multiple healthcare professions.
- Professionals may work in multiple organisations.
- Organisation and branch data must remain isolated.

## 3. Users and Permissions
- Every user has an individual account.
- Roles include administrators, healthcare professionals and receptionists.
- Permissions depend on organisation, branch and assigned responsibilities.
- Administrative staff cannot automatically access clinical records.
- Authorised clinicians may access patient history across branches.
- Clinical access must follow applicable confidentiality requirements.

## 4. Shared Computers
- Quick operator switching is available for clinics.
- Each operator must authenticate individually.
- Passwords or passkeys may be used.
- Inactive sessions must lock automatically.
- Sensitive actions may require additional authentication.
- Operator switching must not expose another user's data.

## 5. Personal Dashboard
- Individual profile and activity history
- Appointments scheduled, changed and completed
- Working hours, breaks and attendance
- Personal productivity indicators
- Private earnings and payment tracking
- Consultation fees and optional examination commissions

## 6. Patient Records
- Administrative and clinical information must be separated.
- Patient records must support continuity of care.
- External documents include medical reports, examinations,
  imaging, referrals and previous treatment records.
- Documents must preserve their original source and metadata.
- Clinical timelines and comprehensive reports are planned.
- Human and veterinary records require appropriate data models.

## 7. Security and Audit
- Firebase Authentication for user identity.
- Firestore for structured data.
- Protected file storage for medical documents.
- Server-enforced authorisation and audit records.
- Activity records must identify the actual operator.
- Backups, recovery and secure data migration are required.

## 8. Current Status
- Registration integration with Firebase is prepared.
- Temporary restrictive Firestore rules have been published.
- Existing patient data remains in localStorage.
- A manual localStorage backup has been created.
- Production permissions and Firestore migration are pending.

## 9. Next Development Steps
1. Finalise the multi-tenant data model.
2. Implement organisation, branch and membership structures.
3. Implement production security rules.
4. Integrate registration, login and permissions.
5. Migrate existing data safely.
6. Test access isolation and audit logging.
