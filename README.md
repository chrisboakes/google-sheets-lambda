# Google Sheets Lambda

An AWS Lambda that reads all rows from the first tab of a Google Sheet and returns them as JSON, keyed by the sheet's header row.

Written in TypeScript, authenticated with a Google service account via environment variables — no credentials live in the repo.

## Install

```sh
npm install
```

## Set up a Google service account

In your browser:

- Head over to the [Google Cloud Console](https://console.cloud.google.com/) and create (or select) a project
- Go to **APIs & Services → Enable APIs and Services** and enable the **Google Sheets API**
- Go to **IAM & Admin → Service Accounts** and create a service account (no roles are needed)
- Open the service account, go to the **Keys** tab, and create a new **JSON** key — this downloads a JSON file

From the downloaded JSON file you'll need two values:

- `client_email`
- `private_key`

Finally, open your Google Sheet and **share it with the `client_email` address** (Viewer access is enough).

## Configure the Lambda

Create the Lambda with the **Node.js 22.x** runtime and set these environment variables (Configuration → Environment variables):

| Variable | Value |
| --- | --- |
| `GOOGLE_SHEET_ID` | The ID of your spreadsheet, from its URL (`https://docs.google.com/spreadsheets/d/<THIS PART>/edit`) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | The `client_email` from the JSON key file |
| `GOOGLE_PRIVATE_KEY` | The `private_key` from the JSON key file (paste it as-is, including the `\n` sequences — the code restores the newlines) |

For anything beyond a hobby project, consider storing the private key in [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) or SSM Parameter Store instead of a plain environment variable.

## Build and deploy

```sh
npm run build
```

This bundles everything into a single file at `dist/index.mjs`. Zip the contents of `dist` and upload it to your Lambda, with the handler set to `index.handler`:

```sh
cd dist && zip -r ../lambda.zip . && cd ..
```

## Test

```sh
npm test
```
