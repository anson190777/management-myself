import type { NextApiRequest, NextApiResponse } from 'next';
import {
  buildBillSheetName,
  buildLegacyBillSheetName,
  extractBillingYear,
  isLegacyBillSheetTab,
} from '../../config/billSheetNames';
import {
  appendRow,
  deleteSheetTab,
  ensureSheetWithHeaders,
  listSpreadsheetTabs,
  readSheet,
} from './sheetsClient';

export interface MigrateBillSheetsResult {
  migratedSheets: string[];
  createdSheets: string[];
  movedRows: number;
  deletedLegacySheets: string[];
}

type SheetRow = Record<string, string | number | boolean>;

export const migrateLegacyBillSheets = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<MigrateBillSheetsResult> => {
  const tabNames = await listSpreadsheetTabs(req, res);
  const roomsResponse = await readSheet(req, res, { sheetKey: 'rooms' });
  const rooms = roomsResponse.rows as SheetRow[];

  const result: MigrateBillSheetsResult = {
    migratedSheets: [],
    createdSheets: [],
    movedRows: 0,
    deletedLegacySheets: [],
  };

  const legacyTabsFromRooms = rooms
    .map((room) => buildLegacyBillSheetName(String(room.name ?? '')))
    .filter((name) => tabNames.includes(name));

  const orphanLegacyTabs = tabNames.filter(
    (name) => isLegacyBillSheetTab(name) && !legacyTabsFromRooms.includes(name),
  );

  const legacyTabs = [...new Set([...legacyTabsFromRooms, ...orphanLegacyTabs])];

  for (const legacySheetName of legacyTabs) {
    const room = rooms.find(
      (item) => buildLegacyBillSheetName(String(item.name ?? '')) === legacySheetName,
    );

    const legacyResponse = await readSheet(req, res, { sheetName: legacySheetName });
    const bills = legacyResponse.rows as SheetRow[];

    if (bills.length === 0) {
      await deleteSheetTab(req, res, legacySheetName);
      result.deletedLegacySheets.push(legacySheetName);
      continue;
    }

    const billsByYear = bills.reduce<Record<string, SheetRow[]>>((acc, bill) => {
      const year = extractBillingYear(String(bill.billingMonth ?? ''));
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(bill);
      return acc;
    }, {});

    for (const [year, yearBills] of Object.entries(billsByYear)) {
      if (!room) {
        continue;
      }

      const targetSheetName = buildBillSheetName(String(room.name ?? ''), year);
      const ensureResult = await ensureSheetWithHeaders(req, res, {
        sheetName: targetSheetName,
      });

      if (ensureResult.created) {
        result.createdSheets.push(targetSheetName);
      }

      const targetResponse = await readSheet(req, res, { sheetName: targetSheetName });
      const existingBills = targetResponse.rows as SheetRow[];
      const existingMonths = new Set(
        existingBills.map((bill) => String(bill.billingMonth ?? '')),
      );

      for (const bill of yearBills) {
        const billingMonth = String(bill.billingMonth ?? '');
        if (existingMonths.has(billingMonth)) {
          continue;
        }

        await appendRow(req, res, {
          sheetName: targetSheetName,
          row: {
            ...bill,
            roomId: room._id ?? bill.roomId,
            roomName: String(room.name ?? bill.roomName ?? ''),
          },
        });
        result.movedRows += 1;
        existingMonths.add(billingMonth);
      }

      if (!result.migratedSheets.includes(legacySheetName)) {
        result.migratedSheets.push(legacySheetName);
      }
    }

    await deleteSheetTab(req, res, legacySheetName);
    result.deletedLegacySheets.push(legacySheetName);
  }

  return result;
};
