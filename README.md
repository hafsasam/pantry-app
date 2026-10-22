# Pantry API

A REST API for managing a personal pantry and shared recipes. Each user has their own
pantry; recipes are shared and managed by admins. Cooking a recipe deducts its
ingredients from your pantry in a single transaction.

## Tech stack

Express 5 · TypeScript · Zod · PostgreSQL + Prisma 7 · express-session (Postgres store)
· argon2 · pino · helmet · Vitest + Supertest · OpenAPI / Swagger UI

## Getting started

Prerequisites: Node 26, pnpm, and Docker (Docker Desktop, OrbStack or Colima).

```bash
git clone https://github.com/hafsasam/pantry-app.git
cd pantry-app
pnpm install                 # also generates the Prisma client (postinstall)

cp .env.example .env         # then fill in the values (see below)
cp .env.example .env.test    # same keys, pointing at the pantry_test database

docker compose up -d         # starts PostgreSQL on localhost:5432

npx prisma migrate dev       # creates the tables in the dev database
npx prisma db seed           # adds sample recipes, a pantry and an admin user

docker compose exec db createdb -U example pantry_test   # one-time: the test database
npm run db:test:reset        # applies the migrations to pantry_test

npm run dev                  # http://localhost:3000, docs at /docs
npm run test:run             # runs the test suite against pantry_test
```

Seeded admin: `hafsa@me.com` / `correct horse battery`

## Environment variables

| Variable           | Purpose                                                                       | Example                                            |
| ------------------ | ----------------------------------------------------------------------------- | -------------------------------------------------- |
| `DATABASE_URL`     | PostgreSQL connection string                                                  | `postgres://example:example@localhost:5432/pantry` |
| `SESSION_SECRET`   | Signs the session cookie; use a long random value (`openssl rand -hex 32`)    | —                                                  |
| `LOGIN_RATE_LIMIT` | Max login/signup attempts per IP per 15 minutes                               | `5` (set high in `.env.test`)                      |
| `CORS_ORIGINS`     | Comma-separated list of frontend origins allowed to call the API with cookies | `http://localhost:5173`                            |

## Scripts

| Script                          | What it does                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `npm run dev`                   | Starts the server in watch mode with pretty logs                             |
| `npm test` / `npm run test:run` | Runs the tests in watch mode / once                                          |
| `npm run db:migrate`            | Applies new migrations to the dev database and regenerates the Prisma client |
| `npm run db:test:reset`         | Resets the test database and applies all migrations                          |
| `npm run psql`                  | Opens psql on the dev database                                               |

## API overview

Full reference with request/response schemas: **`/docs`** (Swagger UI).

Authentication uses a cookie session: call `POST /auth/login`, then send the
`connect.sid` cookie with every request. Routes marked 🔒 require a login,
👑 require an admin.

| Route                                                        | Description                                                            |
| ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout` | Account and session (login/signup are rate-limited)                    |
| `GET /auth/me` 🔒                                            | The current user, including their role                                 |
| `GET /pantry` 🔒                                             | Your pantry, paginated; `?needs_restocking=true` for the shopping list |
| `POST /pantry`, `GET`/`PATCH`/`DELETE /pantry/{id}` 🔒       | Manage your own pantry items                                           |
| `GET /recipes` 🔒                                            | All recipes, paginated                                                 |
| `POST /recipes/{id}/cook` 🔒                                 | Deducts the recipe's ingredients from your pantry (all or nothing)     |
| `POST /recipes`, `DELETE /recipes/{id}` 👑                   | Create and delete recipes                                              |
| security: [{ [cookieAuth.name]: [] }], // ← here             |
| request: { … },                                              |
| responses: { … },                                            |
| });                                                          |

- [cookieAuth.name] uses the scheme's name as the object key ({ cookieAuth: [] }).
- The empty array [] is for scopes. Those are an OAuth concept, so for a cookie it's always empty.
- The outer array lists alternatives ("this or that way of logging in"). You only have one.

Which routes get it? Every route behind requireAuth, so all the /pantry and /recipes paths, plus /auth/me. Not signup, login or logout, which work without a session. (Logout without a session just returns 204.)

When you reload /docs, the protected routes show a 🔒 icon, and an "Authorize" button appears at the top.

✻ Brewed for 10s · done 9:59 PM

❯ check the code again

Ran 1 shell command

The docs are mostly fixed now—security scheme registered, lock icons correct, 404s added for cook/delete—though POST /recipes still has a spurious 404 and the cook route still returns 201. However, 23 tests are now failing, way more than that status issue would explain, so I'll dig into the root cause.

Ran 2 shell commands

Found it. The signup route now answers 200 instead of 201:
"/signup", loginLimiter, async (req, res) => {
const user = await signup(req.body);
res.json(user); // ← was res.status(201).json(user)
And the cook route still has res.status(201). It looks like the status change went onto the wrong route: signup lost its 201, and cook kept it.

Why that breaks 23 tests at once: your loginAs helper checks expect(signupResponse.status).toBe(201), and almost every test logs in through it. So one wrong status in signup fails nearly the whole suite. That's the helper doing its job: it stops at the
cause with a clear message (expected 200 to deeply equal 201), instead of letting tests fail later with confusing

Swap them back:

- signup → res.status(201).json(user), because a user is created
- cook → res.json(item) (200), because nothing is created, existing items are updated

And remove the 404 from POST /recipes in the docs. Then run the tests: 27/27 should be back.

(That's the "201 means created" rule from Week 1 Day 3, and it's also why your docs table said 201 for signup and 200 for cook.)

✻ Worked for 30s · done 10:04 PM

❯ check the code again

Ran 1 shell command

1. What it is: one or two sentences (a pantry and recipe API, with per-user pantries and admin-managed recipes)
2. Tech stack: Express 5, TypeScript, Zod, PostgreSQL + Prisma, Vitest + Supertest, sessions…
3. Getting started: the exact commands, in order, from git clone to a running server. Think about every step you did along the way: installing, the env files, starting Postgres, migrations, generate, seeding, the test database…
4. Environment variables: each variable from .env.example, with one line on what it's for
5. Scripts: what dev, test, test:run, db:migrate, db:test:reset and psql do
6. API overview: the main routes, and a pointer to /docs for the full reference. Mention how auth works (cookie session, /auth/login).

How to check it: follow your own README literally in a fresh clone, for example git clone https://github.com/hafsasam/pantry-app /tmp/pantry-check, step by step. Wherever you get stuck or need something the README doesn't say, there's a gap. (I suspect you'll find at least one: how does pantry_test get created on a new machine?)

✻ Sautéed for 23s · done 10:07 PM

※ recap: You're finishing Project 1 on Week 3 Day 2. The code is done and all 27 tests pass. Next, write README.md with the setup steps, env variables, scripts and API overview, then test it by following it in a fresh clone.

❯ check the readme

Ran 1 shell command

The structure is there, and the scripts and routes sections are a good start. But the most important section is empty, and a few parts still read like my prompt rather than your README:

1. "Getting started" is empty, and that's the section people actually need. Write out every command, in order, for someone with a fresh laptop. Use your own history from these weeks as the checklist:

- prerequisites: which tools must already be installed? (Node, and which version? pnpm? Docker or Colima?)
- clone and install (and what postinstall does automatically)
- create the env files from .env.example. Which files, and how do you get a SESSION_SECRET?
- start Postgres (Docker Compose)
- create the tables: migrations, then generate, then the seed. Mention the seeded admin's login, so people can try the admin routes.
- the test database: it needs to exist before db:test:reset can migrate it. How did you create pantry_test on Week 2, Day 3? That command is in no file in your repo, so a new developer can't know it.
- run the server, run the tests

2. "Environment variables: check .env.example". Your .env.example only has placeholders, so it shows what is needed but not why or what format. One line per variable: what it's for, and an example value (for example, that CORS_ORIGINS is comma-separated,
   and that LOGIN_RATE_LIMIT is per 15 minutes).

3. "API overview" is missing four pantry routes (GET /pantry, GET/PATCH/DELETE /pantry/{id}), and the most important facts: which routes need a login, and which ones need an admin.

4. Small things:

- a title at the top (# Pantry API)
- typos: "amd" (twice), "postinstakk"
- postinstall isn't something you run yourself. It runs automatically after pnpm install. Say that instead of listing it as a command.
- "sessions…" in the tech stack still has my trailing "…"

Then do the fresh-clone test: git clone https://github.com/hafsasam/pantry-app /tmp/pantry-check, cd into it, and follow only the README. (Use a different port or stop your dev server first, and note that the fresh clone shares your Docker database. That's fine for this check.) Everywhere you hesitate, the README is missing something.

✻ Brewed for 23s · done 10:27 PM

❯ can you give me a couple lines for each section

Here's a draft for each section. Adjust it to your own words, and then do the fresh-clone test, because it's the only way to know whether the steps really work:

# Pantry API

A REST API for managing a personal pantry and shared recipes. Each user has their own
pantry; recipes are shared and managed by admins. Cooking a recipe deducts its
ingredients from your pantry in a single transaction.

## Tech stack

Express 5 · TypeScript · Zod · PostgreSQL + Prisma 7 · express-session (Postgres store)
· argon2 · pino · helmet · Vitest + Supertest · OpenAPI / Swagger UI

## Getting started

| `npm run dev` | Starts the server in watch mode with pretty logs |
| `npm test` / `npm run test:run` | Runs the tests in watch mode / once |
| `npm run db:migrate` | Applies new migrations to the dev database and regenerates the Prisma client |
| `npm run db:test:reset` | Resets the test database and applies all migrations |
| `npm run psql` | Opens psql on the dev database |

## API overview

Full reference with request/response schemas: **`/docs`** (Swagger UI).

Authentication uses a cookie session: call `POST /auth/login`, then send the
`connect.sid` cookie with every request. Routes marked 🔒 require a login,
👑 require an admin.

| Route                                                        | Description                                                            |
| ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout` | Account and session (login/signup are rate-limited)                    |
| `GET /auth/me` 🔒                                            | The current user, including their role                                 |
| `GET /pantry` 🔒                                             | Your pantry, paginated; `?needs_restocking=true` for the shopping list |
| `POST /pantry`, `GET`/`PATCH`/`DELETE /pantry/{id}` 🔒       | Manage your own pantry items                                           |
| `GET /recipes` 🔒                                            | All recipes, paginated                                                 |
| `POST /recipes/{id}/cook` 🔒                                 | Deducts the recipe's ingredients from your pantry (all or nothing)     |
| `POST /recipes`, `DELETE /recipes/{id}` 👑                   | Create and delete recipes                                              |
