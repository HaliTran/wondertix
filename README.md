# WonderTix

Main branch is the latest stable release. Develop branch is the latest development release.

## Overview

WonderTix is a full-featured ticket sales platform and CRM built for Portland Playhouse.
It consists of a user ticketing system as well as both ticketing and CRM administrative panels.
This project serves a variety of purposes including managing task assignments, performing financial reporting, and handling ticket sales.
Future features include managing/creating email campaigns and ticket exchanges.

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- mkcert
   - Mac: install with [Brew](https://brew.sh) `brew install mkcert nss`
   - Windows: install with [Chocolatey](https://chocolatey.org) `choco install mkcert`
   - Linux: install with your favorite package manager. If mkcert is not available using your favorite package manager, run the following:

    ```bash
    curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
    chmod +x mkcert-v*-linux-amd64
    sudo cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert
    ```

- [Stripe CLI](https://stripe.com/docs/stripe-cli)

## Setup

1. Clone the repository.
   1. Open your command line. 
   2. Navigate to desired folder to install WonderTix repository.
   3. Execute the following command:

   ```bash
   git clone https://github.com/WonderTix/WonderTix.git
   ```

2. Create a `.env` file and copy over the contents from the `.env.dist` (.env example) file.
   1. Set a value for the `AUTH0_CLIENT_ID`. Currently, we use the Wondertix Development Single Page Application in the `wtix-dev` Auth0 tenant for authenticating requests made from locally running instances of Wondertix. If you don't have access to the `wtix-dev` tenant, ask a team lead for access and/or for the value of the Client ID.
   2. Set values for the `PRIVATE_STRIPE_KEY` and `PUBLIC_STRIPE_KEY`. For testing, we also send requests from locally running instances of Wondertix to an external Stripe account. The Stripe account we use for this is `wtix-dev`. Likewise, if you don't already, ask a team lead for access and/or for the values of `wtix-dev`'s private and public keys. 
3. Create mkcert certificates.
   1. Navigate to `<path/to/WonderTix/server>` and `<path/to/WonderTix/client>`.
   2. Run `mkcert -install` to install the local certificate authority.
   3. Run `mkcert localhost` to create a certificate.   
4. Run `docker-compose up -d` (or `docker compose up` to see live container logs in the terminal). This starts a locally running instance of Wondertix using docker containers. 
5. To test the checkout process with Stripe, make sure you have the [Stripe CLI](https://stripe.com/docs/stripe-cli) installed. 
   1. Once the Stripe CLI is installed, run `stripe login` and press enter to open the browser. 
   2. In the browser that the Stripe CLI opens, make sure you select `Wondertix Dev` as the account, verify that the code matches that in your terminal, and select `Allow Access`. If `Wondertix Dev` does not appear as an option, you will need to ask for access to the account. You should only need to login to the account like this once. 
   3. Back in your terminal, run `stripe listen --forward-to https://localhost:8000/api/2/order/webhook --events checkout.session.completed,checkout.session.expired` and copy the resulting ***signing secret*** as your `PRIVATE_STRIPE_WEBHOOK` variable in the `.env` file. This tells Stripe to forward events to your local webhook. See the `stripe listen` command [API docs](https://stripe.com/docs/cli/listen) for more details. 
      - __NOTE__ - stripe listen _must_ remain running in your terminal for events to be forwarded and, subsequently, for the checkout process to complete. This means that everytime you wish to test the checkout process locally, you have to run the `stripe listen` command and leave it running. You should see your device listed in the Stripe developer portal on the `Wondertix Dev` account under `Webhooks -> Local listeners` and the `Status` should be `Listening`. 
   4. You should now be able to sucessfully checkout with Stripe locally and see order details updated. See [Test Payment Methods](https://stripe.com/docs/testing) for how to checkout with Stripe in test mode. 
6. The client will be available at <https://localhost:3000>
7. The server will be available at <https://localhost:8000>
8. The swagger docs will be available at <https://localhost:8000/api/docs>
   1. To log in to swagger, login to the client and copy the value of the `access_token` from the request to `<AUTH0_URL>/oath/token`. Paste this value into the `Authorize` dialog in swagger.

## Connecting to the database

### Use CLI in container

1. SSH into to the container with `docker compose exec database sh`.
2. Run `psql -U <PG_USER> <PG_DB>` to connect to the database.

### Use PGAdmin

1. Download PGAdmin: <https://www.pgadmin.org/download/>
2. Open PGAdmin and create a new server.
3. Set the credentials to the values in the `.env` file.

## Using the WonderTix.code-workspace in VSCode

Open the folder where you cloned your repository to then:

1. Double-click the `WonderTix.code-workspace` file to open it in VSCode.
2. You can click `File -> Open Workspace from File...` to open it if VSCode is open already.

Once it is open, you will notice 4 folders in the Explorer pane on the left side of the screen.

Here you will see:

1. `WonderTix Root`: The root folder of the whole project.
2. `WonderTix Server`: The folder containing the backend/server code.
3. `WonderTix Client`: The folder containing the frontend/client code.
4. `WonderTix Deploy`: The folder containing the deployment/terraform code.

This allows VSCode to keep your files organized, as well as getting the Jest tests running properly. Simply double-click a folder for the project you want to work on and everything will run in that particular project, including opening a new terminal.

### Using Swagger:

1. To get the bearer token, create a user by going through the signup process in WonderTix.
   - For admin functions, make sure the user has an admin role (contact team lead for admin role).
   - Team Leads: In the User section of Auth0, you can grant individual users an admin role.
2. Log into the client.
3. Once you're logged in, open the dev tools menu (Chrome), refresh the page, and find the `token` in the Network tab.
4. Go to the Preview section for that token and then right-click on the `access_token` and `Copy string contents`.
5. Paste that into the bearerAuth input after clicking the "Authorize" button within Swagger (https://localhost:8000/api/docs).

## Troubleshooting

This list will be updated as new issues arise. If you your issue is not listed, please create an issue and we will look into it.

### Changes are not being reflected

The client and server are built with docker. In most cases you can restart the containers with `docker-compose restart`.

If that does not work, you can try `docker-compose down`, `docker-compose build --no-cache`, `docker compose up -d --build`.

## Playwright Testing

This section covers the Playwright automated testing setup that has been configured for this project. Currently, the `./client/` directory is the only part with Playwright setup. The `./server/` folder will get it later once authentication issues have been resolved (Currently reworking the server tests to work without the need to connect to Auth0 as we will blow through the limit for API calls in no time as it currently does 2-5 Auth0 API requests per test and 2 times per login/page refresh).

Before you begin running tests, make sure you have a TEST_EMAIL and TEST_PASSWORD set in your `.env` that belong to an account with admin privileges. Please refer to the `.env.dist` example. This will allow the `auth.setup.ts` test setup file to authenticate and save the authenticated browser context locally to be used for subsequent tests; and admin credentials are required for tests involving the admin-facing pages to pass.

Here is how you run the playwright tests:

- While in the `./client` folder, type `npm run test:playwright`. This will start the playwright tests using Chromium, Firefox, and Webkit (Safari).
   - In the future, the command will become `npm run test` once we replace the current react tests.
- You can use the Code Generator to record your steps as you interact with a webpage to make a simple test. Simply run the following: `npm run codegen`. This will automatically open your browser and a recording window. The URL will be `https://localhost:3000`. From there, as you interact with the page, the recorder window will record your steps. You simply copy and paste that into a new test file in the `./client/tests/<test type folder>/testname.spec.ts`. It is important to note that all test file *must* end with `*.spec.ts` and be within the `./client/tests/` folder/subfolder.
- You can view a trace (recording of the test) by typing `npx playwright show-trace test-results/<folder for test trace>/trace.zip` and a window will open that will let you step through all of the tests steps to see where it failed or is flaky.

If you have any issues with the tests starting, or it complains about needing requirements, type the following in the `./client/` directory: `npx playwright install --with-deps`. This does require root/admin access on the machine, so you may be prompted to type your password, as this will install things such as Chromium, Firefox, Webkit (Safari) and any other required dependencies that may be needed. This should be done automatically after you do the initial `npm install --legacy-peer-deps` or `npm install --force` in the `./client/` directory.

Once tests have been written, they can be organized in various ways. Possibly create the folders: `./client/tests/{events,tickets,donation,general}`. Once that is done, you can put specific tests in each subfolder.

Expect a much more detailed Playwright tutorial and how-to in the very near future. Currently, I recommend visiting the [Playwright](https://playwright.dev/docs/intro).

## CI/CD

Broadly speaking, we use GitHub Actions for continuous integration and Google Cloud Platform for continuous deployment.

Unit tests and sandboxed E2E tests run via GitHub Actions whenever a pull request is opened or updated. The corresponding workflows can be found in the `.github` directory.

Deployed E2E tests run automatically via Cloud Build trigger when a commit (typically a pull request) is merged to the `main` branch. Note that if these tests fail, the `main` branch will be left in an erroneous state: in other words, if there's a red `X` at the top of this page, something needs to be fixed. If the tests pass, the changes will go live on the `dev` deployment on Cloud Run.

The `cloudbuild.yaml` files in this repo define the workflows that run on Cloud Build. The one at the root level is the main `test-and-deploy` pipeline.

More documentation on our GCP architecture is forthcoming. 
