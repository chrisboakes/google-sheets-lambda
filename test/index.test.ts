import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadInfo = vi.fn();
const getRows = vi.fn();

vi.mock('google-spreadsheet', () => ({
    GoogleSpreadsheet: vi.fn(() => ({
        loadInfo,
        sheetsByIndex: [{ getRows }],
    })),
}));

vi.mock('google-auth-library', () => ({
    JWT: vi.fn(),
}));

const { handler } = await import('../src/index.js');

function makeRow(values: Record<string, unknown>) {
    return { toObject: () => values };
}

describe('handler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('GOOGLE_SHEET_ID', 'sheet-id');
        vi.stubEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL', 'bot@example.iam.gserviceaccount.com');
        vi.stubEnv('GOOGLE_PRIVATE_KEY', '-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----');
    });

    it('returns rows from the first tab as JSON', async () => {
        getRows.mockResolvedValue([
            makeRow({ Name: 'Ada', 'Phone Number': '01234', Website: 'https://example.com' }),
            makeRow({ Name: 'Grace', 'Phone Number': '05678', Website: 'https://example.org' }),
        ]);

        const response = await handler();

        expect(response.statusCode).toBe(200);
        expect(response.headers).toMatchObject({ 'Content-Type': 'application/json' });
        expect(JSON.parse(response.body)).toEqual([
            { Name: 'Ada', 'Phone Number': '01234', Website: 'https://example.com' },
            { Name: 'Grace', 'Phone Number': '05678', Website: 'https://example.org' },
        ]);
    });

    it('returns an empty array when the sheet has no rows', async () => {
        getRows.mockResolvedValue([]);

        const response = await handler();

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual([]);
    });

    it('returns a 500 when the Google API call fails', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        loadInfo.mockRejectedValue(new Error('API unavailable'));

        const response = await handler();

        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body)).toEqual({ message: 'Something went wrong' });
        expect(consoleError).toHaveBeenCalled();
    });

    it('returns a 500 when required environment variables are missing', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.stubEnv('GOOGLE_SHEET_ID', '');

        const response = await handler();

        expect(response.statusCode).toBe(500);
        expect(consoleError).toHaveBeenCalled();
    });

    it('authenticates with newlines restored in the private key', async () => {
        const { JWT } = await import('google-auth-library');
        getRows.mockResolvedValue([]);

        await handler();

        expect(JWT).toHaveBeenCalledWith(
            expect.objectContaining({
                key: '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----',
            })
        );
    });
});
