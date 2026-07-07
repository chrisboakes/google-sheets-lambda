import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import type { APIGatewayProxyResult } from 'aws-lambda';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

interface Config {
    sheetId: string;
    clientEmail: string;
    privateKey: string;
}

function getConfig(): Config {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!sheetId || !clientEmail || !privateKey) {
        throw new Error(
            'Missing required environment variables: GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY must all be set'
        );
    }

    return {
        sheetId,
        clientEmail,
        // Lambda environment variables store the key with literal "\n"
        // sequences rather than real newlines
        privateKey: privateKey.replace(/\\n/g, '\n'),
    };
}

export async function getData(): Promise<Record<string, unknown>[]> {
    const { sheetId, clientEmail, privateKey } = getConfig();

    const auth = new JWT({
        email: clientEmail,
        key: privateKey,
        scopes: SCOPES,
    });

    const doc = new GoogleSpreadsheet(sheetId, auth);
    await doc.loadInfo();

    // Read the first tab and return every row keyed by the header row
    const tab = doc.sheetsByIndex[0];
    const rows = await tab.getRows();

    return rows.map((row) => row.toObject());
}

export async function handler(): Promise<APIGatewayProxyResult> {
    try {
        const data = await getData();

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            isBase64Encoded: false,
        };
    } catch (err) {
        console.error(err);

        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Something went wrong' }),
            isBase64Encoded: false,
        };
    }
}
