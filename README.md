# Complaint Management System

A full stack MERN web app where residents of a housing community raise complaints, support agents resolve them, and admins track everything in one dashboard.

The idea comes from my 3 years as a Customer Care Representative at the Bahria Town Karachi complaint center, where I handled resident complaints every day.

> Status: 🚧 In development. This repo currently has the project setup (React client + Express API). Features are being added step by step.

## Planned Features

- [ ] Sign up and login with JWT authentication
- [ ] Three roles: **Resident**, **Support Agent**, **Admin**
- [ ] Residents create complaints with category, description and photo
- [ ] Complaint status flow: `Open` → `In Progress` → `Resolved` → `Closed`
- [ ] Admin assigns complaints to agents
- [ ] Agents update status and add comments
- [ ] Dashboard with complaint counts per status and category
- [ ] Search and filter complaints
- [ ] Responsive UI for mobile and desktop
- [ ] Deployed live (client on Vercel, API on Render, database on MongoDB Atlas)

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Auth | JSON Web Tokens (planned) |

## Folder Structure

```
complaint-management-system/
├── client/                 React app (Vite)
│   └── src/
│       ├── api/            fetch helper for calling the API
│       ├── components/     reusable UI pieces
│       ├── pages/          one file per screen
│       ├── App.jsx
│       └── main.jsx
├── server/                 Express API
│   └── src/
│       ├── config/         database connection
│       ├── controllers/    request handlers
│       ├── middleware/     error handling, auth
│       ├── models/         Mongoose schemas
│       ├── routes/         API routes
│       ├── app.js          Express app setup
│       └── index.js        server entry point
└── package.json            scripts to run both together
```

## Getting Started

### Requirements

- Node.js 20 or newer
- MongoDB (local install or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/rahilkhan5/complaint-management-system.git
cd complaint-management-system

# 2. Install all dependencies (root, server and client)
npm run install:all

# 3. Create the server environment file
cp server/.env.example server/.env
# then open server/.env and set MONGO_URI

# 4. Start client and server together
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:5000/api

### Environment Variables (`server/.env`)

| Name | Description | Example |
|---|---|---|
| `PORT` | API port | `5000` |
| `CLIENT_URL` | Allowed origin for CORS | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/complaint-management` |
| `JWT_SECRET` | Secret for signing login tokens | any long random string |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | API and database status |

More endpoints will be listed here as features are built.

## Scripts

| Command | What it does |
|---|---|
| `npm run install:all` | Install dependencies in root, server and client |
| `npm run dev` | Run server and client together |
| `npm run dev:server` | Run only the API |
| `npm run dev:client` | Run only the React app |
| `npm run build` | Build the client for production |

## Author

**Rahil Khan**, Junior MERN Stack Developer, Karachi

- LinkedIn: [rahil-khan-92b640439](https://www.linkedin.com/in/rahil-khan-92b640439/)
- GitHub: [rahilkhan5](https://github.com/rahilkhan5)
