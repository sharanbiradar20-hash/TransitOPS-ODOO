# TransitOPS — Knowledge Transfer (KT) Document

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema (Prisma)](#database-schema-prisma)
5. [Backend Architecture & Conventions](#backend-architecture--conventions)
6. [Frontend Architecture & Conventions](#frontend-architecture--conventions)
7. [How to Build a New Module (e.g., "Trip Management")](#how-to-build-a-new-module)

---

## Project Overview

**TransitOPS** is a fleet/transit operations management system. It manages vehicles, drivers, trips, maintenance, fuel expenses, and provides dashboard analytics. The system has role-based access control (RBAC) with four user roles.

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (v22+) |
| Framework | Express.js v5 |
| ORM | Prisma Client v5.22 |
| Database | MySQL |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Module System | CommonJS (`require/module.exports`) |

### Frontend (Scaffolded — files exist but are 0 bytes / not yet implemented)
| Layer | Technology (Planned) |
|-------|-----------|
| Framework | React (JSX components) |
| State/Context | React Context API (`AuthContext.jsx`) |
| Routing | Likely React Router (pages structure) |
| API Layer | Service files pattern (`api.js` + per-module services) |

---

## Project Structure

```
TransitOPS-ODOO/
├── backend/
│   ├── server.js                    # Entry point — loads .env, starts Express on PORT 5000
│   ├── package.json                 # Dependencies: express, prisma, bcryptjs, jsonwebtoken, cors, dotenv
│   ├── prisma/
│   │   └── schema.prisma           # Database models (User, Vehicle, Driver)
│   └── src/
│       ├── app.js                   # Express app setup, CORS, JSON parsing, route mounting
│       ├── config/
│       │   └── db.js               # PrismaClient singleton instance
│       ├── controllers/             # Business logic handlers
│       │   ├── auth.controller.js       ✅ Implemented (register, login)
│       │   ├── dashboard.controller.js  ✅ Implemented (getKpis)
│       │   ├── driver.controller.js     ✅ Implemented (CRUD)
│       │   ├── vehicle.controller.js    ✅ Implemented (CRUD)
│       │   ├── trip.controller.js       ⬜ Empty (0 bytes)
│       │   ├── maintenance.controller.js ⬜ Empty (0 bytes)
│       │   ├── fuelExpense.controller.js ⬜ Empty (0 bytes)
│       │   └── report.controller.js     ⬜ Empty (0 bytes)
│       ├── middleware/
│       │   ├── auth.middleware.js       ✅ JWT verification
│       │   ├── rbac.middleware.js       ✅ Role-based authorization
│       │   └── validate.middleware.js   ⬜ Empty (0 bytes)
│       ├── models/                      ⬜ All empty (0 bytes) — not used; Prisma handles models
│       ├── routes/
│       │   ├── auth.routes.js           ✅ Implemented
│       │   ├── dashboard.routes.js      ✅ Implemented
│       │   ├── driver.routes.js         ✅ Implemented
│       │   ├── vehicle.routes.js        ✅ Implemented
│       │   ├── trip.routes.js           ⬜ Empty (0 bytes)
│       │   ├── maintenance.routes.js    ⬜ Empty (0 bytes)
│       │   ├── fuelExpense.routes.js    ⬜ Empty (0 bytes)
│       │   └── report.routes.js         ⬜ Empty (0 bytes)
│       ├── utils/
│       │   └── statusTransition.js      ⬜ Empty (0 bytes)
│       └── validators/                  ⬜ All empty (0 bytes)
├── frontend/
│   ├── .env                             ⬜ Empty
│   ├── package.json                     ⬜ Empty (dependencies not yet defined)
│   └── src/
│       ├── App.jsx                      ⬜ Empty
│       ├── index.js                     ⬜ Empty
│       ├── context/
│       │   └── AuthContext.jsx          ⬜ Empty
│       ├── services/
│       │   ├── api.js                   ⬜ Empty
│       │   ├── auth.service.js          ⬜ Empty
│       │   ├── vehicle.service.js       ⬜ Empty
│       │   ├── driver.service.js        ⬜ Empty
│       │   ├── trip.service.js          ⬜ Empty
│       │   ├── maintenance.service.js   ⬜ Empty
│       │   └── report.service.js        ⬜ Empty
│       ├── pages/
│       │   ├── LoginPage.jsx            ⬜ Empty
│       │   ├── DashboardPage.jsx        ⬜ Empty
│       │   ├── VehiclesPage.jsx         ⬜ Empty
│       │   ├── DriversPage.jsx          ⬜ Empty
│       │   ├── TripsPage.jsx            ⬜ Empty
│       │   ├── MaintenancePage.jsx      ⬜ Empty
│       │   ├── FuelExpensePage.jsx       ⬜ Empty
│       │   └── ReportsPage.jsx          ⬜ Empty
│       └── components/
│           ├── auth/.gitkeep
│           ├── common/.gitkeep
│           ├── dashboard/.gitkeep
│           ├── drivers/.gitkeep
│           ├── vehicles/.gitkeep
│           ├── trips/.gitkeep
│           ├── maintenance/.gitkeep
│           ├── fuelExpense/.gitkeep
│           └── reports/.gitkeep
└── database/
    └── schema.sql                       ✅ Raw SQL schema for MySQL
```

---

## Database Schema (Prisma)

### Enums

| Enum Name | Values |
|-----------|--------|
| `Role` | `FLEET_MANAGER`, `DRIVER`, `SAFETY_OFFICER`, `FINANCIAL_ANALYST` |
| `VehicleStatus` | `AVAILABLE`, `ON_TRIP`, `IN_SHOP`, `RETIRED` |
| `DriverStatus` | `AVAILABLE`, `ON_TRIP`, `OFF_DUTY`, `SUSPENDED` |

### Models

#### `User` (mapped to `users` table)
| Field | Type | Attributes |
|-------|------|-----------|
| id | Int | `@id @default(autoincrement())` |
| name | String | — |
| email | String | `@unique` |
| password | String | — |
| role | Role (enum) | — |

#### `Vehicle` (mapped to `vehicles` table)
| Field | Type | Attributes |
|-------|------|-----------|
| id | Int | `@id @default(autoincrement())` |
| regNumber | String | `@unique` (mapped: `reg_number`) |
| nameModel | String | (mapped: `name_model`) |
| type | String | — |
| maxLoadCapacity | Decimal | (mapped: `max_load_capacity`) |
| odometer | Decimal | `@default(0)` |
| acquisitionCost | Decimal | (mapped: `acquisition_cost`) |
| status | VehicleStatus | `@default(AVAILABLE)` |
| region | String | — |

#### `Driver` (mapped to `drivers` table)
| Field | Type | Attributes |
|-------|------|-----------|
| id | Int | `@id @default(autoincrement())` |
| name | String | — |
| licenseNumber | String | `@unique` (mapped: `license_number`) |
| licenseCategory | String | (mapped: `license_category`) |
| licenseExpiry | DateTime | (mapped: `license_expiry`) |
| contactNumber | String | (mapped: `contact_number`) |
| safetyScore | Decimal | `@default(100)` (mapped: `safety_score`) |
| status | DriverStatus | `@default(AVAILABLE)` |

### Relationships
> **Note:** Currently there are NO explicit relations defined between models in `schema.prisma`. Vehicles and Drivers are independent tables. A Trip model (not yet in schema) would likely reference both Vehicle and Driver via foreign keys.

---

## Backend Architecture & Conventions

### 1. Entry Point & App Setup

**`server.js`:**
```javascript
require('dotenv').config();
const app = require('./src/app');
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { ... });
```

**`src/app.js`:**
- Uses `cors()` globally
- Parses JSON with `express.json()`
- Mounts routes under `/api/<resource>` prefix
- Has a catch-all 404 handler

### 2. Database Access (`src/config/db.js`)
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = prisma;
```
Every controller imports this singleton: `const prisma = require('../config/db');`

### 3. Authentication Middleware (`src/middleware/auth.middleware.js`)

**How it works:**
1. Reads `Authorization` header
2. Expects format: `Bearer <token>`
3. Verifies JWT using `process.env.JWT_SECRET` (fallback: `'transitops_secret_key_12345'`)
4. Attaches decoded payload to `req.user` (contains: `id`, `email`, `role`)
5. Returns `401` if no token, `403` if invalid/expired

**Usage in routes:**
```javascript
router.get('/', authenticate, controller.handler);
```

### 4. RBAC Middleware (`src/middleware/rbac.middleware.js`)

**How it works:**
1. Takes an array of allowed roles: `authorize(['FLEET_MANAGER', 'SAFETY_OFFICER'])`
2. Checks `req.user.role` against allowed roles
3. Returns `403` if role not in the allowed list

**Usage in routes (always AFTER authenticate):**
```javascript
router.post('/', authenticate, authorize(['FLEET_MANAGER']), controller.create);
```

### 5. Controller Conventions

**Pattern used:** `async/await` with `try/catch`

```javascript
const handlerName = async (req, res) => {
  try {
    // 1. Extract & validate input
    // 2. Business logic (Prisma queries)
    // 3. Return success response
    return res.status(XXX).json({ ... });
  } catch (error) {
    console.error('Error message:', error);
    return res.status(500).json({ error: 'Internal server error <context>.' });
  }
};
```

**Key conventions:**
- **Async/Await** — never `.then()/.catch()` chains
- **Error response format:** `{ error: 'Human-readable message.' }` (always a string)
- **Success response:** Returns the entity directly (object/array) or `{ message: '...' }` for deletes
- **Status codes used:**
  - `200` — Successful GET, PUT, DELETE
  - `201` — Successful POST (creation)
  - `400` — Validation error / bad input / duplicate unique field
  - `401` — Invalid credentials (login)
  - `403` — Forbidden (auth/RBAC)
  - `404` — Resource not found
  - `500` — Internal server error (catch block)
- **ID parsing:** `parseInt(id, 10)` with `isNaN()` check → 400
- **Unique field checking:** `findUnique()` before create/update → 400 on duplicate
- **Partial updates:** Build `updateData = {}` conditionally, only include fields that are `!== undefined`
- **Validation:** Inline in controllers (no middleware validators implemented yet)

### 6. Route File Conventions

```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controllers/<name>.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

// GET — usually open to any authenticated user
router.get('/', authenticate, controller.getAll);

// POST, PUT, DELETE — restricted by role
router.post('/', authenticate, authorize([...roles]), controller.create);
router.put('/:id', authenticate, authorize([...roles]), controller.update);
router.delete('/:id', authenticate, authorize([...roles]), controller.delete);

module.exports = router;
```

**Route registration (in `app.js`):**
```javascript
app.use('/api/<plural-resource>', require('./routes/<name>.routes'));
```

### 7. Role Permissions Pattern (observed)

| Resource | GET (Read) | POST (Create) | PUT (Update) | DELETE |
|----------|-----------|--------------|-------------|--------|
| Vehicles | Any authenticated | FLEET_MANAGER | FLEET_MANAGER | FLEET_MANAGER |
| Drivers | Any authenticated | FLEET_MANAGER, SAFETY_OFFICER | FLEET_MANAGER, SAFETY_OFFICER | FLEET_MANAGER |
| Dashboard | Any authenticated | — | — | — |

### 8. JWT Token Payload Structure
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "FLEET_MANAGER",
  "iat": 1234567890,
  "exp": 1234654290
}
```
Token expires in `1d` (1 day).

---

## Frontend Architecture & Conventions

> ⚠️ **Important:** The entire frontend is scaffolded (file structure exists) but **all files are 0 bytes**. No implementation exists yet. The structure reveals the **intended architecture:**

### Planned Architecture
- **`src/services/api.js`** — Likely an Axios/fetch instance with base URL and auth interceptor
- **`src/services/<module>.service.js`** — Per-module API call functions
- **`src/context/AuthContext.jsx`** — React Context for auth state (token, user, role)
- **`src/pages/<Module>Page.jsx`** — Full-page components (one per route)
- **`src/components/<module>/`** — Reusable sub-components for each module

### Recommended Implementation Pattern (based on backend API structure)

**`api.js` should:**
- Create an Axios instance with `baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'`
- Add request interceptor to attach `Authorization: Bearer <token>` from localStorage/context
- Add response interceptor for 401/403 handling (redirect to login)

**Service files should:**
```javascript
import api from './api';

export const getVehicles = (params) => api.get('/vehicles', { params });
export const createVehicle = (data) => api.post('/vehicles', data);
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);
```

---

## How to Build a New Module

### Example: "Trip Management" Module

#### Step 1: Define the Prisma Model
Add to `backend/prisma/schema.prisma`:
```prisma
enum TripStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model Trip {
  id          Int         @id @default(autoincrement())
  vehicleId   Int         @map("vehicle_id")
  driverId    Int         @map("driver_id")
  origin      String
  destination String
  distance    Decimal?
  startTime   DateTime    @map("start_time")
  endTime     DateTime?   @map("end_time")
  status      TripStatus  @default(SCHEDULED)
  fuelUsed    Decimal?    @map("fuel_used")
  notes       String?

  @@map("trips")
}
```
Then run: `npx prisma migrate dev --name add_trips`

#### Step 2: Create the Controller (`backend/src/controllers/trip.controller.js`)
Follow the established pattern:
```javascript
const prisma = require('../config/db');

const getTrips = async (req, res) => {
  try {
    // filter logic...
    const trips = await prisma.trip.findMany({ where });
    return res.status(200).json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    return res.status(500).json({ error: 'Internal server error fetching trips.' });
  }
};

// createTrip, updateTrip, deleteTrip following same pattern...
module.exports = { getTrips, createTrip, updateTrip, deleteTrip };
```

#### Step 3: Create the Route File (`backend/src/routes/trip.routes.js`)
```javascript
const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

router.get('/', authenticate, tripController.getTrips);
router.post('/', authenticate, authorize(['FLEET_MANAGER']), tripController.createTrip);
router.put('/:id', authenticate, authorize(['FLEET_MANAGER', 'DRIVER']), tripController.updateTrip);
router.delete('/:id', authenticate, authorize(['FLEET_MANAGER']), tripController.deleteTrip);

module.exports = router;
```

#### Step 4: Register in `app.js`
```javascript
const tripRoutes = require('./routes/trip.routes');
app.use('/api/trips', tripRoutes);
```

#### Step 5: Frontend Service (`frontend/src/services/trip.service.js`)
```javascript
import api from './api';

export const getTrips = (params) => api.get('/trips', { params });
export const createTrip = (data) => api.post('/trips', data);
export const updateTrip = (id, data) => api.put(`/trips/${id}`, data);
export const deleteTrip = (id) => api.delete(`/trips/${id}`);
```

#### Step 6: Frontend Page (`frontend/src/pages/TripsPage.jsx`)
- Create a page component with list view + create/edit form
- Use the service functions for API calls
- Handle loading/error states
- Apply role-based UI (show/hide buttons based on user role from AuthContext)

---

## Key Reminders

1. **Always use `async/await`** — no `.then()` chains
2. **Error format:** `{ error: 'Message string.' }` — always use `error` key
3. **Success format:** Return entity directly or `{ message: '...' }` for actions
4. **Parse IDs:** `parseInt(id, 10)` + `isNaN()` guard
5. **Check existence** before update/delete → 404 if not found
6. **Check uniqueness** before create/update unique fields → 400 if duplicate
7. **Middleware order:** `authenticate` → `authorize([...])` → `controller.method`
8. **Route prefix:** `/api/<plural-resource-name>`
9. **File naming:** `<resource>.controller.js`, `<resource>.routes.js`, `<Resource>Page.jsx`
10. **Database:** Import prisma from `'../config/db'`

---

## Files That Need Implementation (Your TODO)

### Backend (0-byte files needing code):
- `backend/src/controllers/trip.controller.js`
- `backend/src/controllers/maintenance.controller.js`
- `backend/src/controllers/fuelExpense.controller.js`
- `backend/src/controllers/report.controller.js`
- `backend/src/routes/trip.routes.js`
- `backend/src/routes/maintenance.routes.js`
- `backend/src/routes/fuelExpense.routes.js`
- `backend/src/routes/report.routes.js`
- `backend/src/utils/statusTransition.js`
- `backend/src/middleware/validate.middleware.js`
- All `backend/src/validators/*.js`
- All `backend/src/models/*.js` (may not be needed since Prisma handles models)

### Frontend (entire frontend needs implementation):
- All service files
- All page components
- All sub-components
- `App.jsx` (routing setup)
- `AuthContext.jsx` (auth state management)
- `api.js` (HTTP client setup)
- `package.json` (dependencies: react, react-router-dom, axios, tailwindcss, etc.)

---

*Document generated on: July 12, 2026*
*Based on commit: `81e030c` (HEAD → main)*
