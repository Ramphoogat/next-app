import { google } from "googleapis";
import SystemSettings from "@/models/SystemSettings";
import User from "@/models/User";

const getSheetsClient = () => {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !key) {
    throw new Error("Missing Google Service Account credentials");
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
};

export const performSheetSync = async (): Promise<void> => {
    const settings = await SystemSettings.findOne();
    if (!settings || !settings.googleSheetId) return;

    const sheets = getSheetsClient();
    const users = await User.find().sort({ createdAt: -1 });

    const header = ["ID", "Name", "Username", "Email", "Role", "Verified", "Created At", "Last Login", "Created By"];
    
    const sanitize = (val: unknown) => {
        if (val === null || val === undefined) return "";
        const str = String(val);
        if (['=', '+', '-', '@'].some(char => str.startsWith(char))) return "'" + str;
        return str;
    };

    const rows = users.map(u => [
        u._id.toString(),
        sanitize(u.name),
        sanitize(u.username),
        u.email || "",
        u.role || "user",
        u.isVerified ? "Yes" : "No",
        u.createdAt ? new Date(u.createdAt).toISOString() : "",
        u.lastLogin ? new Date(u.lastLogin).toISOString() : "",
        u.createdBy || "Admin"
    ]);

    const values = [header, ...rows];

    let sheetName = "Users";
    try {
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: settings.googleSheetId });
        sheetName = spreadsheet.data.sheets?.[0].properties?.title || "Users";
    } catch { /* unused */ }

    const rangeName = `'${sheetName.replace(/'/g, "''")}'!A1`;
    const clearRange = `'${sheetName.replace(/'/g, "''")}'!A:Z`;

    await sheets.spreadsheets.values.clear({ spreadsheetId: settings.googleSheetId, range: clearRange });
    await sheets.spreadsheets.values.update({
        spreadsheetId: settings.googleSheetId,
        range: rangeName,
        valueInputOption: "RAW",
        requestBody: { values }
    });

    settings.lastSync = new Date();
    await settings.save();
};
