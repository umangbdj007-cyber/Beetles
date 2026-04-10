# Campusconnect

A fully functional, role-based campus management platform designed to integrate communication, academic management, and service workflows into one system. 

## Features

- **Role-Based Workflows**: Student, Teacher, and Admin dedicated Dashboards.
- **Academic Module**: View timetables, submit assignments.
- **Real-time Engine**: Socket.io powered Campus announcements and global chat.
- **Events & Calendar**: Sign up for events. Includes powerful logic to detect time and location clashes.
- **Marketplace**: Buy/Sell/Service tracking system.
- **Support Flow**: A transparent, trackable complaint lodging system.

---

## Workspace Structure

- `Backend/` : Node.js, Express, MongoDB API endpoints.
- `Frontend/` : Next.js Version 14 (App Router) + Tailwind CSS UI.

---

## 🚀 Setup & Execution Instructions

**Prerequisites**: You must have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Database Setup
Ensure you have MongoDB running locally, or change the `MONGO_URI` inside `Backend/.env` to point to a cloud MongoDB Atlas instance.

### 2. Run the Backend
Open a terminal in the `Backend` directory and execute:
```bash
npm install
npm run dev
```
The Express server will start on `http://localhost:5000`.

### 3. Run the Frontend
Open a new terminal in the `Frontend` directory and execute:
```bash
npm install
npm run dev
```
The Next.js application will be available at `http://localhost:3000`.

### 4. Getting Started
1. Open your browser and navigate to `http://localhost:3000`.
2. Register an account as an `Admin` or `Student` or `Teacher`.
3. Start exploring the Modules in the Dashboard!
