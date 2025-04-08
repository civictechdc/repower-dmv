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
docker-compose build
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

### Type Checking

This project uses TypeScript. It's recommended to get TypeScript set up for your editor to get a really great in-editor experience with type checking and auto-complete. To run type checking across the whole project, run `npm run typecheck`.

### Linting

This project uses ESLint for linting. That is configured in `.eslintrc.cjs`.

### Formatting

We use [Prettier](https://prettier.io/) for auto-formatting in this project. It's recommended to install an editor plugin (like the [VSCode Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)) to get auto-formatting on save. There's also a `npm run format` script you can run to format all files in the project.

### Content Management System

We use [Decap-CMS](https://decapcms.org/) as a content management system. This allows users who belong to the GitHub repository to sign into a special `/admin/` portal to edit any content that is managed by the CMS.

There is a specific deployed environment where the CMS system is enabled. In other environments it is disabled. It is also enabled in local environments, but you must run the CMS server separately for it to work correctly.

#### The Content Environment

The content environment is deployed at [https://repower-dmv-content.fly.dev/](https://repower-dmv-content.fly.dev/). The CMS admin panel is located at [https://repower-dmv-content.fly.dev/admin/](https://repower-dmv-content.fly.dev/admin/) (note: the trailing slash is important! `/admin` will not work).

The content environment is deployed from the `cms-content-updates` branch and changes made in the content environment are committed to the `cms-content-updates` branch. When new changes are committed they will trigger a new deployment and after a few minutes the changes will be visible in the application.

The Decap-CMS config file used for the content environment is [app/content/deployed-config.yml](./app/content/deployed-config.yml).

#### CMS in Local Development

The CMS is also enabled for local development but it runs with a different backend than in deployed environments. In order for it to function correctly you must be running the Decap server locally:

```
npx decap-server
```

**If you are prompted for a username and password when you try to use the CMS admin panel locally you probably aren't running the Decap server.**

The Decap-CMS config file used for the local environment is [app/content/local-config.yml](./app/content/local-config.yml).

#### Implementation and Configuration

The implementation is somewhat complicated so it's described here:

- There are custom routes implemented for the `/admin/` and `/admin/config.yml` paths. They have logic which checks the `DEPLOY_ENV` environment variable and if it is not set to one of `local` or `content` then they simply return 404. This is the case for all deployed environments except for the content environment.
- If the `DEPLOY_ENV` value is set to `content` then [app/content/deployed-config.yml](./app/content/deployed-config.yml) is returned by the `/admin/config.yml` path.
- If the `DEPLOY_ENV` value is set to `local` then [app/content/local-config.yml](./app/content/local-config.yml) is returned by the `/admin/config.yml` path.
- The `/admin/` path, when `DEPLOY_ENV` is set to a valid value, returns some static HTML which then serves the DecapCMS frontend from a CDN cache.

#### Managing Content in the CMS

In order for content to be managed by the CMS it needs to be configured. That means:

1. Making sure the information architecture is defined in [app/content/deployed-config.yml](./app/content/deployed-config.yml) and [app/content/local-config.yml](./app/content/local-config.yml).
2. Storing the content strings in a JSON file inside the [app/content/](./app/content/) directory.
3. Where the content is used in the application, import it from the relevant JSON file using the appropriate key. You can import entire JSON files like this: `import content from "../content/apply.json";`
