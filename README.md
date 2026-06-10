📦 Asset Tracking System

A full-stack Asset Tracking and Management System built with FastAPI (backend) and a modular HTML/CSS/JavaScript frontend, designed for organizations to track, assign, maintain, and audit physical or digital assets.

## Features

## 1. User Management
    - Secure authentication (JWT-based)
    - Role-based access control (Admin, Manager, Staff, Technician)
    - User assignment tracking
## 2. Asset Management
    - Create, update, and delete assets
    - Track asset status (active, assigned, maintenance, retired)
    - QR code generation for each asset
    - Asset history and audit trail
## 3. Asset Assignment
    - Assign assets to users or departments
    - Track assignment history
    - Return and reassignment handling
## 4. Maintenance Module
    - Log maintenance requests
    - Track repair history
    - Schedule preventive maintenance
## 5. Reporting
    - Export reports (PDF/CSV)
    - Asset utilization analytics
    - Maintenance summaries
## 6. System Features
Audit logging for all critical actions
Email notifications (assignments, maintenance alerts)
Modular architecture for scalability
Docker support for deployment


## System Architecture

The system follows a layered clean architecture approach:

Frontend (HTML/CSS/JS)
        ↓
FastAPI Routers (API Layer)
        ↓
Service Layer (Business Logic)
        ↓
SQLAlchemy Models (Database Layer)
        ↓
PostgreSQL / MySQL
Backend Structure
routers/ → API endpoints
services/ → Business logic
models/ → Database tables
schemas/ → Request/response validation
middleware/ → Authentication, logging, CORS
utils/ → Helpers (QR, PDF, CSV)
migrations/ → Database version control (Alembic)


## Project Structure
asset-tracking-system/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   │
│   ├── migrations/
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── index.html
│   ├── dashboard.html
│   ├── assets.html
│   ├── assignments.html
│   ├── maintenance.html
│   ├── reports.html
│   ├── css/
│   └── js/
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── nginx/
├── .github/workflows/
└── README.md


## Tech Stack
Backend
FastAPI
SQLAlchemy
Pydantic
Alembic (migrations)
JWT Authentication
Python 3.10+
Frontend
HTML5
CSS3 (modular architecture)
Vanilla JavaScript
Infrastructure
Docker & Docker Compose
Nginx (reverse proxy)
GitHub Actions (CI/CD)