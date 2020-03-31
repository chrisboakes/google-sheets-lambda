// Get spreadsheet npm package
const { GoogleSpreadsheet } = require('google-spreadsheet');
// Ensure you've updated this file with your client secret
const clientSecret = require('./client_secret.json');

// Add your Google sheet ID here
const googleSheetID = '';

// Instantiates the spreadsheet
const sheet = new GoogleSpreadsheet(googleSheetID);

// Add the data we want into an object
function cleanData(data) {
    // Return data as a custom Object
    // Edit the below with your spreadsheet column names

	return {
		name: data['Name'],
		phone: data['Phone Number'],
		website: data['Website']
    }
}

// Asynchronously get the data
async function getData() {
    try {
        // Authenticate using the JSON file we set up earlier
        await sheet.useServiceAccountAuth(clientSecret);
        await sheet.loadInfo();

        // Get the first tab's data
        const tab = sheet.sheetsByIndex[0];

        // Get row data
        const rows = await tab.getRows();

        // Empty array for our data
        let data = [];

        // If we have data
        if (rows.length > 0) {
            // Iterate through the array of rows
            // and push the clean data from your spreadsheet
            rows.forEach(row => {
                data.push(cleanData(row));
            });
        } else {
            return false;
        }

        // Return the data JSON encoded
        return JSON.stringify(data);
    } catch(err) {
        console.log(err);
        return false;
    }
}

exports.handler = async (event) => {
    const data = await getData();
    
    let response = {
        "statusCode": 200,
        "body": data,
        "isBase64Encoded": false
    };

    if (!data) {
        response = {
            "statusCode": 400,
            "body": 'Something went wrong',
            "isBase64Encoded": false
        };
    }

    return response;
}
