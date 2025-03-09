# Deploying this app

This app is hosted using Fly.io and deployments occur automatically with GitHub Actions. This document describes how to add an additional environment.

Prior to your first deployment, you'll need to do a few things:

## Add FLY_API_TOKEN secret to GitHub Actions if you are forking this repository

- Add a `FLY_API_TOKEN` to your GitHub repo. To do this, go to your user settings on Fly and create a new [token](https://web.fly.io/user/personal_access_tokens/new), then add it to [your repo secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) with the name `FLY_API_TOKEN`.

## Configure Fly.io

- [Install Fly](https://fly.io/docs/getting-started/installing-flyctl/)

- Sign up and log in to Fly

  ```sh
  fly auth signup
  ```

  > **Note:** If you have more than one Fly account, ensure that you are signed into the same account in the Fly CLI as you are in the browser. In your terminal, run `fly auth whoami` and ensure the email matches the Fly account signed into the browser.

- Create the new app on Fly using whatever moniker you want:

  ```sh
  fly apps create repower-dmv-moniker
  ```

  > **Note:** Make sure this name matches the `app` set in `fly.toml` file. Otherwise, you will not be able to deploy.

- Add a `SESSION_SECRET` to your fly app secrets, to do this you can run the following commands:

  ```sh
  fly secrets set SESSION_SECRET=$(openssl rand -hex 32) --app repower-dmv-moniker
  ```

  If you don't have openssl installed, you can also use [1Password](https://1password.com/password-generator) to generate a random secret, just replace `$(openssl rand -hex 32)` with the generated secret.

- Create a persistent volume for the sqlite database for both your staging and production environments. Run the following:

  ```sh
  fly volumes create data --size 1 --app repower-dmv-moniker
  ```

## Connect the new Fly app to a particular branch in GitHub

Update the [deploy.yml](.github/workflows/deploy.yml) GitHub Action to include steps for recognizing a branch and deploying it to your newly-created Fly.io app.

Now that everything is set up you can commit and push your changes to your repo. Every commit to your target branch will trigger a deployment to the new Fly.io app.
