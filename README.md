# Google Sheets Lambda

A simple lambda to integrate with the Google Sheets API

These are the steps to get this up and running. Firstly, clone this repo, then:

## Install the package

```sh
npm install
```

## Authenticate the request

In your browser:

- Head over to the [Google Developers Console](https://console.developers.google.com/) and create a new project
- Now go to **Enable APIs and Services** and enable the **Google Drive API**
- Now navigate to **Create Credentials**:
	- Select **Google Drive API** from *Which API are you using?*
	- Select **Web server** from *Where will you be calling the API from*
	- Select **Application data** from *What data will you be accessing?*
	- Select **No** for the *API with App Engine* question
	- Create some credentials (setting the *Role* as **Editor**)
	- Ensure **JSON** is selected

The above steps should prompt a download of a JSON file. Rename this file to `client_secret.json` and put it in the root directory of this repo.

Open your `client_secret.json` file and copy the email address (without the quotation marks) next to `client_email`. Go to the spreadsheet you've created and share it with this email address.

## Add the ID of the spreadsheet

Head back over to the browser and fetch the [ID of the spreadsheet](https://stackoverflow.com/questions/36061433/how-to-do-i-locate-a-google-spreadsheet-id) from the URL.

Update the variable `googleSheetID` with this ID.

## Alter the cleanData method

Make sure that the `cleanData` method contains all of your column names. The ones included are just a sample.

## ZIP it up

Zip up the entire repo and upload it to your Lambda, ensuring all of the code in the repo goes in the root of your Lambda function's directory.
