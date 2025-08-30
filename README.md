# 📘 ProFlex System

---

## 🇬🇧 English (UK)

**ProFlex** is a modern, responsive scheduling system to help professionals manage appointments, clients/patients, and reminders — with a clean, mobile-first UI.

Built with **React (Vite)** and **Bootstrap**. Uses **Context API** for state, **localStorage** for session, and **browser notifications** for reminders.

---

### 🔧 Tech Stack
- React (Vite)
- React Router DOM
- Bootstrap (custom styles)
- Context API (global state)
- Browser Notifications (reminders)
- Vitest + Testing Library (unit tests)

---

### 🚀 Features
- **Login with session** (localStorage) and **protected routes**.
- **Daily agenda** with time slots and status (confirmed, completed, canceled).
- **“Next 4 hours”** panel (today only; ignores canceled) with simple **swipe**:
  - Swipe right → mark **completed**.
  - Swipe left → mark **canceled**.
- **Pull-to-refresh** (mobile) on the Agenda screen.
- **Quick reminders**: browser notification + alert, with WhatsApp shortcut (opens `wa.me`).
- Main pages: **Home, Login, Agenda, Clients, Personal Tasks (Compromissos), Marketing**.
- **Developer Access** (via footer) for internal tests.

> Note: automatic WhatsApp sending requires a backend + **WhatsApp Cloud API**.  
> Currently, the app **opens WhatsApp** with a pre-filled message.

---

### 🛠️ How to Run Locally
```bash
git clone https://github.com/FernandoFogaca/proflex.git
cd proflex
npm install
npm run dev
