📘 ProFlex System
🇬🇧 English (UK)

ProFlex is a modern, responsive scheduling system built to assist professionals in managing appointments, client/patient data and reminders — with a clean, mobile-first UI.

Built with React (Vite) and Bootstrap, it includes protected routes, a “Next 4 hours” panel with mobile swipe, pull-to-refresh, and quick reminders with browser notifications.

🔧 Tech Stack

React (Vite)

React Router DOM

Bootstrap (custom styles)

Context API (global state)

LocalStorage (session & data persistence)

Browser Notifications (reminders)

Vitest + Testing Library (unit tests)

🚀 Features

Login with session (localStorage) and protected routes.

Daily agenda with time slots and status (confirmed, completed, cancelled).

“Next 4 hours” (today only; ignores cancelled) with simple swipe on mobile:

Swipe right → mark completed.

Swipe left → mark cancelled.

Pull-to-refresh (mobile) on the Agenda screen.

Quick reminders: browser notification + alert, with a WhatsApp shortcut (opens wa.me).

Main pages: Home, Login, Agenda, Clients, Personal Tasks (Compromissos), Marketing.

Developer Access via footer for internal tests.

Note: automatic WhatsApp sending requires a backend + WhatsApp Cloud API.
Currently, the app opens WhatsApp with a pre-filled message.

🔒 Developer Access

A developer-only section reachable from the footer (“Dev Access” button). Password-protected access to internal tools.

📂 Folder Structure
src/
  App.jsx
  main.jsx
  components/
    Header.jsx
    PersonalAppointmentModal.jsx
    AgendaProximos.jsx
    AgendaLembretes.jsx
    DevLogin.jsx
  pages/
    Home.jsx
    Login.jsx
    Agenda.jsx
    Clientes.jsx
    Compromissos.jsx
    AgendamentoPage.jsx
    Marketing.jsx
  authentication/
    ProtectedRoute.jsx
    session.jsx
  __tests__/
    Header.test.jsx
    RoutesProtected.test.jsx
  test/
    setupTests.js
public/
vite.config.js
package.json

🛠️ How to Run Locally
git clone https://github.com/FernandoFogaca/proflex.git
cd proflex
npm install
npm run dev

🔨 Build
npm run build
# output: dist/

✅ Tests
npm run test:run

🔑 Demo Credentials

Email: 

Password: 

🇧🇷 Português (BR)

ProFlex é um sistema moderno e responsivo para profissionais gerenciarem agenda, clientes/pacientes e lembretes — com interface limpa e foco em mobile.

Feito com React (Vite) e Bootstrap, traz rotas protegidas, painel de “Próximas 4 horas” com swipe (mobile), pull-to-refresh e lembretes rápidos com notificações do navegador.

🔧 Tecnologias usadas

React (Vite)

React Router DOM

Bootstrap (estilos)

Context API (estado global)

LocalStorage (sessão e persistência)

Notificações do navegador (lembretes)

Vitest + Testing Library (testes unitários)

🚀 Funcionalidades

Login com sessão (localStorage) e rotas protegidas.

Agenda do dia por horários, com status (confirmado, concluído, cancelado).

Painel “Próximas 4 horas” (somente hoje; ignora cancelados) com swipe simples no celular:

Arrastar para a direita → marcar concluído.

Arrastar para a esquerda → marcar cancelado.

Pull-to-refresh (mobile) na tela de Agenda.

Lembretes rápidos: notificação do navegador + alerta, com atalho para WhatsApp (abre wa.me).

Páginas principais: Home, Login, Agenda, Clientes, Compromissos, Marketing.

Acesso do Desenvolvedor pelo rodapé para testes internos.

Observação: envio automático real no WhatsApp exige backend + WhatsApp Cloud API.
No momento, o app abre o WhatsApp com a mensagem pronta.

🔒 Área do Desenvolvedor

Área restrita acessível pelo rodapé (botão “Dev Access”). Protegida por senha para ferramentas internas.

📂 Estrutura de Pastas
src/
  App.jsx
  main.jsx
  components/
    Header.jsx
    PersonalAppointmentModal.jsx
    AgendaProximos.jsx
    AgendaLembretes.jsx
    DevLogin.jsx
  pages/
    Home.jsx
    Login.jsx
    Agenda.jsx
    Clientes.jsx
    Compromissos.jsx
    AgendamentoPage.jsx
    Marketing.jsx
  authentication/
    ProtectedRoute.jsx
    session.jsx
  __tests__/
    Header.test.jsx
    RoutesProtected.test.jsx
  test/
    setupTests.js
public/
vite.config.js
package.json

🛠️ Como Rodar Localmente
git clone https://github.com/FernandoFogaca/proflex.git
cd proflex
npm install
npm run dev

🔨 Build
npm run build
# saída: dist/

✅ Testes
npm run test:run

🔑 Login de Demonstração

E-mail: 

Senha:

👨‍💻 Designed by Fernando Fogaça • ProFlex (React + Bootstrap + Tests + Mobile-first)
