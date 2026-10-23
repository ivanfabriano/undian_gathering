import * as XLSX from "xlsx";
import type { ImportResult, Participant, ParticipantType } from "./types";

const normalize = (value: unknown) => String(value ?? "").trim();
const normalizeKey = (value: string) =>
  value.toLowerCase().replace(/[\s_.-]+/g, "");

function findValue(row: Record<string, unknown>, aliases: string[]) {
  const normalizedAliases = new Set(aliases.map(normalizeKey));
  const key = Object.keys(row).find((item) =>
    normalizedAliases.has(normalizeKey(item)),
  );
  return key ? normalize(row[key]) : "";
}

function parseType(value: string, sheetName: string): ParticipantType | null {
  const text = `${value} ${sheetName}`.toUpperCase().replace(/[\s_-]+/g, " ");
  if (/NON\s*NPP|NONNPP|MITRA|OUTSOURCE/.test(text)) return "NON_NPP";
  if (/\bNPP\b|KARYAWAN|PEGAWAI/.test(text)) return "NPP";
  return null;
}

export async function parseParticipantFile(file: File): Promise<ImportResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const participants: Participant[] = [];
  let skipped = 0;

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });

    rows.forEach((row, rowIndex) => {
      const name = findValue(row, [
        "nama",
        "name",
        "nama karyawan",
        "karyawan",
      ]);
      const employeeId = findValue(row, [
        "npp",
        "id",
        "nik",
        "nomor",
        "no",
        "employee id",
        "nomor peserta",
      ]);
      const category = findValue(row, [
        "kategori",
        "status",
        "tipe",
        "type",
        "jenis",
      ]);
      const department = findValue(row, [
        "unit",
        "divisi",
        "department",
        "departemen",
        "bagian",
      ]);
      const type = parseType(category, sheetName);

      if (!name || !employeeId || !type) {
        skipped += 1;
        return;
      }

      participants.push({
        id: `${type}-${employeeId}-${rowIndex}`
          .toLowerCase()
          .replace(/\s+/g, "-"),
        name,
        employeeId,
        type,
        department: department || undefined,
      });
    });
  });

  const unique = Array.from(
    new Map(
      participants.map((participant) => [
        `${participant.type}:${participant.employeeId}`,
        participant,
      ]),
    ).values(),
  );
  skipped += participants.length - unique.length;
  return { participants: unique, skipped };
}

export function downloadTemplate() {
  const employeeRows = [
    { ID: "100001", Nama: "Contoh Karyawan", Unit: "SBU HIMPM" },
    { ID: "100002", Nama: "Contoh Karyawan 2", Unit: "Operasional" },
  ];
  const partnerRows = [
    { ID: "MTR001", Nama: "Contoh Mitra", Unit: "Mitra" },
    { ID: "MTR002", Nama: "Contoh Mitra 2", Unit: "Mitra" },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(employeeRows),
    "Karyawan",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(partnerRows),
    "Mitra",
  );
  XLSX.writeFile(workbook, "Template-Peserta-Golden-Hours.xlsx");
}
