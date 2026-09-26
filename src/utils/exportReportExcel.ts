// import * as XLSX from "xlsx";
// import { translateKey, translateValue } from "@/utils/reportLabels";

// const isPlainObject = (v: any) => v !== null && typeof v === "object" && !Array.isArray(v);

// const formatCell = (v: any): any => {
//   if (v === null || v === undefined) return "";
//   if (typeof v === "boolean") return v ? "نعم" : "لا";
//   if (typeof v === "string") return translateValue(v);
//   return v;
// };

// /**
//  * يفكّك كائن (صف واحد) لحقول مسطّحة بأسماء عربية، ويرجّع
//  * منفصلة أي مصفوفات كائنات موجودة جواه (هتتحول لصفحات مستقلة).
//  */
// const flattenRow = (
//   obj: Record<string, any>,
//   prefix = ""
// ): { flat: Record<string, any>; nestedArrays: [string, any[]][] } => {
//   let flat: Record<string, any> = {};
//   const nestedArrays: [string, any[]][] = [];

//   Object.entries(obj).forEach(([k, v]) => {
//     const label = prefix ? `${prefix} - ${translateKey(k)}` : translateKey(k);
//     if (Array.isArray(v)) {
//       if (v.length > 0 && isPlainObject(v[0])) {
//         nestedArrays.push([label, v]);
//       }
//       // مصفوفات القيم البسيطة (نادرة جدًا في التقارير) بيتم تجاهلها من الإكسل
//     } else if (isPlainObject(v)) {
//       const nested = flattenRow(v, label);
//       flat = { ...flat, ...nested.flat };
//       nestedArrays.push(...nested.nestedArrays);
//     } else {
//       flat[label] = formatCell(v);
//     }
//   });

//   return { flat, nestedArrays };
// };

// /**
//  * صفحة "الملخص": كل الحقول البسيطة والمتداخلة (بدون أي مصفوفات) في صف واحد لكل بيان.
//  */
// const buildSummarySheet = (obj: Record<string, any>) => {
//   const rows: { البيان: string; القيمة: any }[] = [];

//   const walk = (o: Record<string, any>, path: string) => {
//     Object.entries(o).forEach(([k, v]) => {
//       if (Array.isArray(v)) return; // المصفوفات ليها صفحات منفصلة
//       const label = path ? `${path} - ${translateKey(k)}` : translateKey(k);
//       if (isPlainObject(v)) {
//         walk(v, label);
//       } else {
//         rows.push({ البيان: label, القيمة: formatCell(v) });
//       }
//     });
//   };

//   walk(obj, "");
//   return XLSX.utils.json_to_sheet(rows);
// };

// /**
//  * بيدور جوه أي مصفوفة كائنات (وأي مصفوفات متداخلة جواها) ويبني صفحة لكل واحدة،
//  * مع نقل بيانات السياق من الأب (زي اسم القسم) لكل صف فرعي.
//  */
// const collectArraySheets = (
//   node: any[],
//   sheetName: string,
//   contextRow: Record<string, any> = {},
//   sheets: { name: string; rows: any[] }[] = []
// ): { name: string; rows: any[] }[] => {
//   if (Array.isArray(node) && node.length > 0 && isPlainObject(node[0])) {
//     const rows: any[] = [];
//     node.forEach((item) => {
//       const { flat, nestedArrays } = flattenRow(item);
//       rows.push({ ...contextRow, ...flat });
//       nestedArrays.forEach(([label, arr]) => {
//         collectArraySheets(arr, `${sheetName} - ${label}`, { ...contextRow, ...flat }, sheets);
//       });
//     });
//     sheets.push({ name: sheetName, rows });
//   }
//   return sheets;
// };

// /**
//  * يصدّر أي تقرير (بأي شكل JSON) لملف Excel:
//  * - صفحة "الملخص" لكل الأرقام والبيانات البسيطة
//  * - صفحة مستقلة لكل جدول/مصفوفة (شفتات، أقسام، أطباء، حركات، إلخ) بأعمدة عربية
//  */
// export const exportReportToExcel = (fileName: string, data: any) => {
//   if (!data || typeof data !== "object") return;

//   const workbook = XLSX.utils.book_new();

//   const topLevelScalarsAndObjects: Record<string, any> = {};
//   const topLevelArrays: [string, any[]][] = [];

//   Object.entries(data).forEach(([key, value]) => {
//     if (Array.isArray(value)) {
//       if (value.length > 0 && isPlainObject(value[0])) {
//         topLevelArrays.push([translateKey(key), value]);
//       }
//     } else {
//       topLevelScalarsAndObjects[key] = value;
//     }
//   });

//   const summarySheet = buildSummarySheet(topLevelScalarsAndObjects);
//   XLSX.utils.book_append_sheet(workbook, summarySheet, "الملخص");

//   const allSheets: { name: string; rows: any[] }[] = [];
//   topLevelArrays.forEach(([name, arr]) => collectArraySheets(arr, name, {}, allSheets));

//   // اسم صفحة الإكسل بحد أقصى 31 حرف ولازم يكون فريد
//   const usedNames = new Set<string>(["الملخص"]);
//   allSheets.forEach(({ name, rows }) => {
//     if (rows.length === 0) return;
//     let safeName = name.slice(0, 31) || "بيانات";
//     let counter = 2;
//     while (usedNames.has(safeName)) {
//       safeName = `${name.slice(0, 28)} ${counter}`;
//       counter++;
//     }
//     usedNames.add(safeName);
//     XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), safeName);
//   });

//   XLSX.writeFile(workbook, `${fileName}.xlsx`);
// };

import * as XLSX from "xlsx";
import { translateKey, translateValue } from "@/utils/reportLabels";

const isPlainObject = (v: any) =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const formatCell = (v: any): any => {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "نعم" : "لا";
  if (typeof v === "string") return translateValue(v);
  return v;
};

/**
 * ✅ بيحسب عرض مناسب لكل عمود بناءً على أطول قيمة فيه (بالعربي)
 */
const autoFitColumns = (rows: Record<string, any>[]) => {
  if (!rows || rows.length === 0) return [];

  // نجمع كل الـ keys من كل الصفوف (مش بس أول صف)
  const keys = new Set<string>();
  rows.forEach((row) => Object.keys(row).forEach((k) => keys.add(k)));

  const cols = Array.from(keys).map((key) => {
    // أطول قيمة في العمود (بين الهيدر وكل القيم)
    let maxLen = String(key).length;

    rows.forEach((row) => {
      const val = row[key];
      if (val !== null && val !== undefined) {
        const len = String(val).length;
        if (len > maxLen) maxLen = len;
      }
    });

    // نضيف padding صغير، وبحد أدنى 10 وبحد أقصى 60 عشان العمود ما يبقاش غبي
    const width = Math.min(Math.max(maxLen + 2, 10), 60);
    return { wch: width };
  });

  return cols;
};

/**
 * ✅ بيبني worksheet مع RTL + auto-width
 */
const buildSheet = (rows: Record<string, any>[]) => {
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = autoFitColumns(rows);
  // خلي كل الخلايا فيها wrap text عشان لو حاجة طويلة
  return ws;
};

/**
 * يفكّك كائن (صف واحد) لحقول مسطّحة بأسماء عربية، ويرجّع
 * منفصلة أي مصفوفات كائنات موجودة جواه (هتتحول لصفحات مستقلة).
 */
const flattenRow = (
  obj: Record<string, any>,
  prefix = ""
): { flat: Record<string, any>; nestedArrays: [string, any[]][] } => {
  let flat: Record<string, any> = {};
  const nestedArrays: [string, any[]][] = [];

  Object.entries(obj).forEach(([k, v]) => {
    const label = prefix ? `${prefix} - ${translateKey(k)}` : translateKey(k);
    if (Array.isArray(v)) {
      if (v.length > 0 && isPlainObject(v[0])) {
        nestedArrays.push([label, v]);
      }
    } else if (isPlainObject(v)) {
      const nested = flattenRow(v, label);
      flat = { ...flat, ...nested.flat };
      nestedArrays.push(...nested.nestedArrays);
    } else {
      flat[label] = formatCell(v);
    }
  });

  return { flat, nestedArrays };
};

/**
 * صفحة "الملخص": كل الحقول البسيطة والمتداخلة (بدون أي مصفوفات) في صف واحد لكل بيان.
 */
const buildSummarySheet = (obj: Record<string, any>) => {
  const rows: { البيان: string; القيمة: any }[] = [];

  const walk = (o: Record<string, any>, path: string) => {
    Object.entries(o).forEach(([k, v]) => {
      if (Array.isArray(v)) return;
      const label = path ? `${path} - ${translateKey(k)}` : translateKey(k);
      if (isPlainObject(v)) {
        walk(v, label);
      } else {
        rows.push({ البيان: label, القيمة: formatCell(v) });
      }
    });
  };

  walk(obj, "");
  return buildSheet(rows);
};

/**
 * بيدور جوه أي مصفوفة كائنات (وأي مصفوفات متداخلة جواها) ويبني صفحة لكل واحدة،
 * مع نقل بيانات السياق من الأب (زي اسم القسم) لكل صف فرعي.
 */
const collectArraySheets = (
  node: any[],
  sheetName: string,
  contextRow: Record<string, any> = {},
  sheets: { name: string; rows: any[] }[] = []
): { name: string; rows: any[] }[] => {
  if (Array.isArray(node) && node.length > 0 && isPlainObject(node[0])) {
    const rows: any[] = [];
    node.forEach((item) => {
      const { flat, nestedArrays } = flattenRow(item);
      rows.push({ ...contextRow, ...flat });
      nestedArrays.forEach(([label, arr]) => {
        collectArraySheets(
          arr,
          `${sheetName} - ${label}`,
          { ...contextRow, ...flat },
          sheets
        );
      });
    });
    sheets.push({ name: sheetName, rows });
  }
  return sheets;
};

/**
 * يصدّر أي تقرير (بأي شكل JSON) لملف Excel:
 * - صفحة "الملخص" لكل الأرقام والبيانات البسيطة
 * - صفحة مستقلة لكل جدول/مصفوفة (شفتات، أقسام، أطباء، حركات، إلخ) بأعمدة عربية
 * - ✅ كل الصفحات RTL وكل الأعمدة auto-width
 */
export const exportReportToExcel = (fileName: string, data: any) => {
  if (!data || typeof data !== "object") return;

  const workbook = XLSX.utils.book_new();

  // ✅ خلي الـ Workbook كله RTL
  workbook.Workbook = { Views: [{ RTL: true }] };

  const topLevelScalarsAndObjects: Record<string, any> = {};
  const topLevelArrays: [string, any[]][] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0 && isPlainObject(value[0])) {
        topLevelArrays.push([translateKey(key), value]);
      }
    } else {
      topLevelScalarsAndObjects[key] = value;
    }
  });

  const summarySheet = buildSummarySheet(topLevelScalarsAndObjects);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "الملخص");

  const allSheets: { name: string; rows: any[] }[] = [];
  topLevelArrays.forEach(([name, arr]) =>
    collectArraySheets(arr, name, {}, allSheets)
  );

  // اسم صفحة الإكسل بحد أقصى 31 حرف ولازم يكون فريد
  const usedNames = new Set<string>(["الملخص"]);
  allSheets.forEach(({ name, rows }) => {
    if (rows.length === 0) return;
    let safeName = name.slice(0, 31) || "بيانات";
    let counter = 2;
    while (usedNames.has(safeName)) {
      safeName = `${name.slice(0, 28)} ${counter}`;
      counter++;
    }
    usedNames.add(safeName);
    XLSX.utils.book_append_sheet(workbook, buildSheet(rows), safeName);
  });

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};