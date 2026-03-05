
  # Centralized Academic Project Hub

  This is a code bundle for Centralized Academic Project Hub. The original project is available at https://www.figma.com/design/Gv2Qk61iUzaJmcLQokgMlW/Centralized-Academic-Project-Hub.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
Architecture Overview

  React Frontend (Vite)          Express Backend             MongoDB Atlas
─────────────────────    →     ──────────────────    →    ────────────────
App.tsx / components           REST API (port 5000)        Collections:
  - Auth state                   /api/auth                   users
  - Projects state               /api/projects               projects
  - AccessRequests state         /api/access-requests        accessRequests
  - LandingContent state         /api/admin                  landingContent
                                 /api/landing

prime-backend/
├── .env
├── server.js
├── models/
│   ├── User.js
│   ├── Project.js
│   ├── AccessRequest.js
│   └── LandingContent.js
├── routes/
│   ├── auth.js
│   ├── projects.js
│   ├── accessRequests.js
│   ├── admin.js
│   └── landing.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
└── scripts/
    └── seedAdmin.js