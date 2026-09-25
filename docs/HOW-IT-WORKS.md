# How Complaint Desk works

A plain English walkthrough of the code, written so I can explain every part in an interview.

## The big picture

There are two programs:

1. **The API** (`server/`) is an Express app. It talks to MongoDB and decides who is allowed to do what.
2. **The React app** (`client/`) is what people see in the browser. It never talks to the database. It only calls the API.

In development, Vite runs the React app on port 5173 and forwards every request that starts with `/api` to the Express server on port 5000 (see `client/vite.config.js`). That is why the React code can call `/api/complaints` without writing the full address.

## What happens when a resident files a complaint

1. The resident fills the form on `NewComplaintPage.jsx`. The page checks the fields first (title at least 5 characters, a category, a location, a description of at least 10 characters) so mistakes show up instantly.
2. `complaintsApi.create()` in `client/src/api/services.js` calls `apiRequest()`, which adds the login token to the `Authorization` header and sends a `POST /api/complaints`.
3. On the server, `routes/complaint.routes.js` sends the request through two checks:
   - `protect` reads the token, verifies it, and loads the user from the database. No valid token means 401.
   - `authorize('resident')` makes sure only residents can file complaints. Anyone else gets 403.
4. `createComplaint` in `controllers/complaint.controller.js` checks the fields again (never trust the browser), then saves the complaint with a first history entry: "created, status open, by this user".
5. Before saving, the Complaint model asks the `Counter` model for the next number. `Counter` uses MongoDB's `$inc`, which is atomic, so two complaints at the same moment still get different numbers. The number becomes `CMS-0011`.
6. The API sends back the saved complaint. The React app opens its detail page and shows "Complaint filed. Your case number is CMS-0011."

## How login works

- **Sign up:** the password is hashed with bcrypt in a `pre('save')` hook on the User model. The plain password is never stored.
- **Log in:** `login` finds the user by email, compares the password with `bcrypt.compare`, and returns a JWT that holds the user's id and role. The token expires after 7 days.
- **Every request after that:** the React app sends the token. The `protect` middleware verifies it and also checks the account is still active, so turning an account off works right away.
- **The password never leaves the server:** the field has `select: false`, and `toJSON` removes it just in case.
- **On the React side:** `AuthProvider` keeps the logged in user. On page load it calls `/api/auth/me` to turn a saved token back into a user. If the API ever answers 401, the app logs out by itself.

## How roles and access work

There are three roles: resident, agent and admin.

- `scopeFor(user)` builds the database filter for lists: residents get `{ createdBy: me }`, agents get `{ assignedTo: me }`, admins get everything.
- For a single complaint, `actorRoles()` works out which "hats" the user wears for that complaint: owner (filed it), assignee (assigned to it) or admin.
- If a user asks for a complaint they are not allowed to see, the API answers **404, not 403**. A 403 would tell them the complaint exists.
- The React app hides buttons people cannot use, but that is only for a clean screen. The server always checks again.

## The status rules

All allowed moves are in one object, `TRANSITIONS`, in `server/src/constants.js`:

| From | To | Who |
|---|---|---|
| Open | In progress | the assigned agent or an admin, and an agent must be assigned |
| Open | Closed | admin only, with a note |
| In progress | Resolved | the assigned agent or an admin, with a note |
| Resolved | Closed | the resident who filed it, or an admin |
| Resolved | In progress (reopen) | the resident who filed it, or an admin, with a note |

`updateStatus` looks up the move in this table, checks the user's hats, checks the note, then saves the new status and adds a history entry. Because the rules are data and not a pile of `if` statements, adding a new status later means changing one table.

## The list page

- Filters (status, category, priority, search, page) are stored in the URL with `useSearchParams`. Refreshing the page or sharing the link keeps the same view.
- The search box waits 350 ms after the last key press before searching, so the API is not called on every letter.
- The server uses a regular expression for search, and escapes special characters first so a search like `(` cannot break the query.
- Results come back 20 per page with `skip` and `limit`, plus the total so the app can show "Page 1 of 2".

## The dashboard numbers

`getStats` runs a few counts in parallel with `Promise.all`:

- complaints per status (a MongoDB `aggregate` with `$group`)
- new complaints this week and last week
- resolved complaints this week and last week
- for admins: complaints waiting for an agent, and unfinished work per category

The side panel shows each weekly number next to last week's, like "7, 4 more than last week", so a number never appears without context.

## Tests

`server/test/` has 20 tests using Node's built in test runner and Supertest. `mongodb-memory-server` starts a throwaway MongoDB for the tests, so they never touch real data. Run them with `npm test`.

## Questions I expect in an interview

**Why JWT and not sessions?**
The API stays stateless: any server can check a token without shared session storage. The trade off is that a token cannot be cancelled early, which is why `protect` also checks that the account is still active on every request.

**Why return 404 instead of 403 for someone else's complaint?**
403 would confirm the complaint exists. 404 gives nothing away.

**How do you stop two complaints getting the same case number?**
The counter is increased with `$inc` in a single `findByIdAndUpdate`, which MongoDB runs atomically.

**Why check the form in the browser and on the server?**
The browser check is for a fast, friendly experience. The server check is the real protection, because anyone can call the API directly without the React app.

**What would you improve?**
Photo uploads, email or SMS notifications, rate limiting on login, and a live deployment.
