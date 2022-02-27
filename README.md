# Random Comments

Comments system built with Express. Code is live [here](https://random-comments-k3usw.ondigitalocean.app/).

### Tech setup

- Express server which hosts an index.html file and API routes
- A PostgreSQL DB hosted in the cloud with Supabase
- Server and tests written in typescript
- Frontend uses Vanilla JS
- Frontend styled with Tailwind CSS

### Run locally

1. `npm install` to install dependencies
2. Add `DATABASE_URL` in a `.env` file and point it to your DB
3. `npx prisma migrate dev` to sync your database with the project schema
4. `npm start` to run the server on http://localhost:3000

### Run tests

The tests are written in Playwright, an e2e testing framework. They are configured to run against Chrome, Firefox and Safari. The repo has been setup to run the tests on changes to the main branch.

To run tests locally, do the following:

1. Add `BASE_URL` in a `.env` file with the value http://localhost:3000
2. `npm test` to run the tests
