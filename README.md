# 📘 ProFlex System

---

## 🇬🇧 English (UK)

**ProFlex** is a modern, mobile-first scheduling system for professionals to manage appointments, clients, reminders, and medical notes — with PDF output and WhatsApp shortcuts.

Built with **React (Vite)** + **Bootstrap**, it features a fast SPA, protected routes, and a clean UI designed for day-to-day use.

---

### 🔧 Tech Stack
- React (Vite)
- React Router DOM
- Bootstrap + custom CSS
- jsPDF (PDF generation)
- Firebase (Auth/Storage) – optional
- LocalStorage (persistence)

---

### 🚀 Features
- Multilingual welcome screen and responsive layout
- Persistent navigation header
- Login & protected pages (patients, agenda)
- Patients registry with **profile photo capture** (webcam/upload)
- Appointments agenda with statuses (confirmed / next / due / cancelled / done)
- Quick Reminder block + **WhatsApp** shortcut
- Medical notes per visit; **Report / Prescription / Medical excuse** to **PDF**
- Birthday panel (WhatsApp greeting shortcut)
- Local timezone/date handling (DD/MM/YYYY)

---

### 🔒 Developer Access
A developer-only section is available via footer (“Dev Access”), protected by password.

---

### 📂 Folder Structure
src
├─ components
│ ├─ Header.jsx
│ ├─ FotoCapture.jsx
│ ├─ AniversariosHoje.jsx
│ ├─ NovoAgendamento.jsx
├─ pages
│ ├─ Home.jsx
│ ├─ Login.jsx
│ ├─ Agenda.jsx
│ ├─ Clientes.jsx
│ ├─ Compromissos.jsx
├─ context
│ └─ AppContext.jsx
├─ services
│ └─ firebase.js
├─ App.jsx
├─ main.jsx
└─ index.css

yaml
Copier le code

---

### 🛠️ How to Run Locally
```bash
git clone https://github.com/FernandoFogaca/proflex.git
cd proflex
npm install
npm run dev
Build:

bash
Copier le code
npm run build
⚙️ Environment (optional Firebase)
Create a .env file in the project root:

ini
Copier le code
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# delete password used when removing patients/records (default 1234)
VITE_DELETE_PASS=1234
If you skip Firebase, local features still work (LocalStorage). Photo capture falls back to data URLs.

🇧🇷 Português (BR)
ProFlex é um sistema moderno e responsivo para profissionais organizarem agenda, clientes, lembretes e prontuário, com geração de PDF e atalho para WhatsApp.

Desenvolvido com React (Vite) e Bootstrap, possui rotas protegidas, layout mobile-first e operação rápida como SPA.

🔧 Tecnologias
React (Vite)

React Router DOM

Bootstrap + CSS próprio

jsPDF (PDFs)

Firebase (Auth/Storage) – opcional

LocalStorage (persistência)

🚀 Funcionalidades
Tela inicial multilíngue e layout responsivo

Cabeçalho fixo de navegação

Login e rotas protegidas (Agenda, Pacientes, etc.)

Cadastro de Pacientes com foto de perfil (câmera/upload)

Agenda com status coloridos (confirmado / próximo / na hora / cancelado / concluído)

Lembrete rápido com atalho de WhatsApp

Notas por consulta; Relatório / Receita / Atestado em PDF

Aniversários do dia (atalho de parabéns no WhatsApp)

Datas no padrão DD/MM/AAAA e fuso local

🔒 Área do Desenvolvedor
Acesso pelo rodapé (“Dev Access”), com senha.

📂 Estrutura de Pastas
css
Copier le code
src
├─ components
│  ├─ Header.jsx
│  ├─ FotoCapture.jsx
│  ├─ AniversariosHoje.jsx
│  ├─ NovoAgendamento.jsx
├─ pages
│  ├─ Home.jsx
│  ├─ Login.jsx
│  ├─ Agenda.jsx
│  ├─ Clientes.jsx
│  ├─ Compromissos.jsx
├─ context
│  └─ AppContext.jsx
├─ services
│  └─ firebase.js
├─ App.jsx
├─ main.jsx
└─ index.css
🛠️ Como Rodar
bash
Copier le code
git clone https://github.com/FernandoFogaca/proflex.git
cd proflex
npm install
npm run dev
Build:


npm run build
⚙️ Ambiente (.env – opcional Firebase)

VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# senha de exclusão (padrão 1234)
VITE_DELETE_PASS=1234
Sem Firebase, funciona com LocalStorage. A foto usa data URL/local.

👨‍💻 Designed & built by Fernando Fogaça

