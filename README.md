# Job Tracker

Personal job application tracker. Spring Boot 3.5 (Java 21) backend, Angular 22 frontend, packaged as **one** Docker container.

- Add an application in seconds (only company + position are required)
- One-click status change: Wishlist → Applied → Interview → Offer / Rejected / No reply
- Status chips with counts that double as filters, search, filter by type (Werkstudent, HiWi, …)
- Follow-up dates with a "Follow up" reminder when they are due
- Notes, contact person, job link
- CSV export (opens in Excel) as a backup
- Password protected, works on phone and laptop

---

## Run locally

**Backend** (uses a local H2 file database in `backend/data`, nothing to install):

First set your local login. Copy the example file and put your own username and password in it:

```bash
cd backend/src/main/resources
cp application-local.properties.example application-local.properties
```

`application-local.properties` is git-ignored, so your login stays on your machine. Then:

```bash
cd backend
mvn spring-boot:run
```

The app will not start if no username/password is configured. This is on purpose, so it can never run on the internet with a default password.

**Frontend** (hot reload, proxies `/api` to port 8080):

```bash
cd frontend
npm install
npx ng serve
```

Open http://localhost:4200

Tests: `cd backend && mvn test`

---

## Put it live (free): Neon (database) + Render (app)

Total time ≈ 15 minutes. Both have free plans, no credit card needed.

### 1. Push the code to GitHub

```bash
cd job-tracker
git init
git add .
git commit -m "Job tracker"
git branch -M main
git remote add origin https://github.com/HarisKhan15/job-tracker.git
git push -u origin main
```

(Create an empty **private** repo called `job-tracker` on GitHub first.)

### 2. Create the database on Neon

1. Sign up at https://neon.tech, create a project, region **Europe (Frankfurt)**.
2. On the dashboard click **Connect**. You get a string like
   `postgresql://neondb_owner:AbC123@ep-cool-name-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require`
3. Split it into three values:

| Variable      | Value from the example                                                                   |
|---------------|------------------------------------------------------------------------------------------|
| `DB_URL`      | `jdbc:postgresql://ep-cool-name-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require` |
| `DB_USER`     | `neondb_owner`                                                                           |
| `DB_PASSWORD` | `AbC123`                                                                                 |

Note the `jdbc:` prefix and that user/password are removed from the URL.

### 3. Deploy on Render

1. Sign up at https://render.com with your GitHub account.
2. **New → Blueprint**, pick the `job-tracker` repo. Render reads `render.yaml`.
3. It asks for the environment variables:
   - `APP_USERNAME`: your login name
   - `APP_PASSWORD`: a strong password (this protects your data on the internet)
   - `DB_URL`, `DB_USER`, `DB_PASSWORD`: from step 2
4. Click **Apply**. The first build takes ~5–8 minutes.
5. Your app is live at `https://job-tracker-xxxx.onrender.com`. Bookmark it / "Add to Home Screen" on your phone.

Every `git push` to `main` redeploys automatically.

**Free plan note:** Render puts the app to sleep after 15 minutes without visits. The first open after that takes ~30–60 seconds; then it is fast. Your data is safe in Neon, it does not sleep away.

### Alternative without the Blueprint

**New → Web Service**, pick the repo, Runtime **Docker**, plan **Free**, region **Frankfurt**, add the same 5 environment variables, health check path `/api/health`.

---

## Configuration

| Env variable   | Default                          | Meaning                    |
|----------------|----------------------------------|----------------------------|
| `APP_USERNAME` | none, required                   | Login username             |
| `APP_PASSWORD` | none, required                   | Login password             |
| `DB_URL`       | H2 file in `./data`              | JDBC URL of the database   |
| `DB_USER`      | `sa`                             | Database user              |
| `DB_PASSWORD`  | (empty)                          | Database password          |
| `PORT`         | `8080`                           | HTTP port (Render sets it) |

## API

All under `/api`, HTTP Basic auth.

| Method | Path                              | What                     |
|--------|-----------------------------------|--------------------------|
| GET    | `/api/applications`               | List all                 |
| POST   | `/api/applications`               | Create                   |
| PUT    | `/api/applications/{id}`          | Update                   |
| PATCH  | `/api/applications/{id}/status`   | Change status only       |
| DELETE | `/api/applications/{id}`          | Delete                   |
| GET    | `/api/applications/stats`         | Count per status         |
| GET    | `/api/applications/export`        | CSV download             |
| GET    | `/api/health`                     | Health check (public)    |

## Project structure

```
job-tracker/
├── backend/            Spring Boot (REST API, security, JPA)
├── frontend/           Angular (standalone components + signals)
├── Dockerfile          builds Angular, puts it inside the Spring Boot jar
└── render.yaml         Render deployment blueprint
```
