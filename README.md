# Demand and Responsiveness

## Overview
- data-driven web application that analyzes NYC 311 service request data to help identify complaint hotspots, trends, and response patterns across the city.
The platform visualizes large volumes of 311 complaints to highlight areas with high demand and recurring issues, enabling teams to better understand service pressures, prioritize resources, and improve response efficiency. By combining an interactive frontend with a scalable backend and database, the project demonstrates how urban service data can be transformed into actionable insights for operational decision-making.

## Features
**Interactive Map Visualization**
- View NYC 311 complaint data on an interactive map with support for filtering by complaint type, location, date range, and other attributes.

**Heatmap Analysis**
- Identify high-density complaint areas using a heatmap overlay, making it easy to spot service demand hotspots across the city.

**Data Table & Reports**
- Explore complaint data in a structured, sortable table format for detailed inspection and reporting.

**Chart-Based Insights**
- Analyze complaint distributions using pie chart to quickly understand trends and category breakdowns.









Short instructions to get this project running locally or with Docker Compose.

## Prerequisites
- **Docker & Docker Compose**: Docker Engine with Compose (or `docker compose`) installed.
- **Node.js & npm** (for frontend local development): Node 14.
- **Java & Gradle** (for backend local development): JDK 11+; the project includes the Gradle wrapper.

**Quick start (recommended — Docker Compose)**
- From the repository root run (uses `compose.yaml`):

```
docker compose -f compose.yaml up --build
```

- To stop and remove containers:

```
docker compose -f compose.yaml down
```

Notes:
- The Compose files define the `backend`, `frontend`, and `database` services. Check `compose.yaml` and `compose.deploy.yaml` for ports and environment overrides.
- Using Docker is the easiest way to get all services running together with the correct configuration.

**Run services locally (developer mode)**

Backend
- Change to the backend folder and use the included Gradle wrapper:

```
cd backend
./gradlew bootRun
```

- To run backend tests:

```
./gradlew test
```

Frontend
- Install dependencies and run the app:

```
cd frontend
npm install
npm start
```

- To run frontend tests:

```
npm test
```

Database
- The database service and initialization scripts are in the `database/` folder.
- To initialize the DB manually (if not using Compose), you can use the provided SQL scripts in `database/scripts/01-setup.sql` or run the shell helper `database/init.sh`. To succesfully do it(even while composing), you need to have the csv 
locally in your environment as 'dataset/initDataset.csv'

- The dataset used for seeding is `database/dataset/initDataset.csv` and `frontend/public/initDataset.csv`.

## Testing and linting
- Frontend unit tests: `cd frontend && npm test`.
- Backend unit tests: `cd backend && ./gradlew test`.

- Backend linting: the backend uses **Checkstyle** (see `backend/checkstyle.xml`). Run the checks with Gradle from the `backend/` folder:

```
cd backend
./gradlew check
```

- Frontend linting: the frontend uses **ESLint** and **Prettier**. If the linting scripts are available in `frontend/package.json`, you can 'manually' install and run them with. Although they run themselves in pipelines when pushing to you own branch or merging to deployment or any other branch:

```
cd frontend
npm run setup:lint      # install or prepare linting dependencies (if provided)
npm run lint            # run lint checks
npm run lint:fix        # try to auto-fix fixable issues
```

**Useful commands**
- Build only (no run):

```
docker compose -f compose.yaml build
```

- View logs:

```
docker compose -f compose.yaml logs -f
```

- Recreate a single service (example: backend):

```
docker compose -f compose.yaml up -d --build backend
```

**Troubleshooting**
- If a service fails to start, run `docker compose -f compose.yaml logs <service>` to inspect logs.
- If ports conflict, open `compose.yaml` to see which host ports are mapped and change them or stop the conflicting service.
- If environment-specific secrets are required, check the Compose environment sections or `.env` files (not committed) and set the necessary variables before starting.

**Where to look for configuration**
- Docker Compose: `compose.yaml`, `compose.deploy.yaml`.
- Backend code & config: `backend/` (Gradle project, resources in `backend/src/main/resources`).
- Frontend code: `frontend/` (React + TypeScript).
- Database scripts: `database/scripts/01-setup.sql` and `database/init.sh`.

**Steps and tips**
- Use Docker Compose for a reproducible dev environment.
