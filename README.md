# ElectrifyDC

This is the Civic Tech DC repo for the Electrify DC website project.

## Tools we use

- Language: [TypeScript](https://typescriptlang.org)
- Deployment: [Fly app deployment](https://fly.io) with [Docker](https://www.docker.com/)
  - Healthcheck endpoint for [Fly backups region fallbacks](https://fly.io/docs/reference/configuration/#services-http_checks)
- Database: [SQLite Database](https://sqlite.org)
  - ORM: [Prisma](https://prisma.io)
- CI/CD: [GitHub Actions](https://github.com/features/actions)
- Email/Password Authentication with [cookie-based sessions](https://remix.run/utils/sessions#md-createcookiesessionstorage)
- Styling: [Tailwind](https://tailwindcss.com/)
- End-to-end testing: [Cypress](https://cypress.io)
- Local third party request mocking: [MSW](https://mswjs.io)
- Unit testing: [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com)
- Code formatting: [Prettier](https://prettier.io)
- Linting: [ESLint](https://eslint.org)

## Development

### Create your own untracked .env file

This sets some necessary environment variables and allows you to add your own environment variables in a file that is ignored by git.

```sh
cp .env.example .env
```

<details>
<summary><strong>Developing locally on MacOS</strong></summary>

#### Install Nodejs

You'll need to have Nodejs installed locally. See [.tool-versions](./.tool-versions) for the version.

I use [asdf](https://asdf-vm.com/) to manage my tool versions but you could also use `n`, `nvm`, or specific versions of `Nodejs`.

#### Install dependencies

```
npm install
```

#### Run the setup script

The setup script sets up the database, runs any pending migrations, and seeds the database with some starter data.

```sh
npm run setup
```

#### Start the dev server

This starts your app in development mode, rebuilding assets on file changes. It will run at [localhost:3000](localhost:3000).

```sh
npm run dev
```

</details>

<details>
<summary><strong>Developing locally with Docker</strong></summary>

#### Install Docker

You'll need to have Docker Desktop installed and running.

#### Build the Docker image

```
docker-compile build
```

#### Run the Docker image

Now you can run the Docker image with Docker Compose. It will run at [localhost:3000](localhost:3000). Docker Compose will share your local application files with the Docker container using a volume so that as you change application files they should also automatically update inside the Docker container and be reloaded by the web server.

```sh
docker-compose up
```

If you want it to run in the background you can add the `-d` flag. If you do you can view logs with `docker-compose logs app`.

</details>

### The app comes with a test-user pre-configured

- Email: `rachel@remix.run`
- Password: `racheliscool`

### Connecting to a deployed database

The sqlite database lives at `/data/sqlite.db` in your deployed application. You can connect to the live database by running `fly ssh console -C database-cli`.

## GitHub Actions

We use GitHub Actions for continuous integration and deployment. Anything that gets into the `main` branch will be deployed to staging after running tests/build/etc. Anything in the `prod` branch will be deployed to production.

Read more about [DEPLOYING](./DEPLOYING.md).

## Testing

### Cypress

We use Cypress for our End-to-End tests in this project. You'll find those in the `cypress` directory. As you make changes, add to an existing file or create a new file in the `cypress/e2e` directory to test your changes.

We use [`@testing-library/cypress`](https://testing-library.com/cypress) for selecting elements on the page semantically.

To run these tests in development, run `npm run test:e2e:dev` which will start the dev server for the app as well as the Cypress client. Make sure the database is running in docker as described above.

We have a utility for testing authenticated features without having to go through the login flow:

```ts
cy.login();
// you are now logged in as a new user
```

We also have a utility to auto-delete the user at the end of your test. Just make sure to add this in each test file:

```ts
afterEach(() => {
  cy.cleanupUser();
});
```

That way, we can keep your local db clean and keep your tests isolated from one another.

### Vitest

For lower level tests of utilities and individual components, we use `vitest`. We have DOM-specific assertion helpers via [`@testing-library/jest-dom`](https://testing-library.com/jest-dom).

### Type Checking

This project uses TypeScript. It's recommended to get TypeScript set up for your editor to get a really great in-editor experience with type checking and auto-complete. To run type checking across the whole project, run `npm run typecheck`.

### Linting

This project uses ESLint for linting. That is configured in `.eslintrc.cjs`.

### Formatting

We use [Prettier](https://prettier.io/) for auto-formatting in this project. It's recommended to install an editor plugin (like the [VSCode Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)) to get auto-formatting on save. There's also a `npm run format` script you can run to format all files in the project.
