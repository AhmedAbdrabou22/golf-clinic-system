// interface Props {
//   data: any;
//   depth?: number;
// }

// const isPlainObject = (v: any) => v !== null && typeof v === "object" && !Array.isArray(v);

// const prettify = (key: string) => key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// const formatValue = (v: any) => {
//   if (v === null || v === undefined || v === "") return "—";
//   if (typeof v === "number") return v.toLocaleString("en-US");
//   if (typeof v === "boolean") return v ? "نعم" : "لا";
//   return String(v);
// };

// /**
//  * عارض عام: بياخد أي كائن JSON راجع من التقارير ويعرضه تلقائيًا
//  * - القيم البسيطة (رقم/نص) → كروت إحصائية
//  * - مصفوفة كائنات → جدول تلقائي بأعمدة من مفاتيح أول عنصر
//  * - مصفوفة قيم بسيطة → tags
//  * - كائن متداخل → قسم فرعي بنفس المنطق
//  */
// const ReportDataView = ({ data, depth = 0 }: Props) => {
//   if (data === null || data === undefined) {
//     return <p className="py-4 text-center text-sm text-ink/40">لا توجد بيانات</p>;
//   }

//   if (Array.isArray(data)) {
//     if (data.length === 0) return <p className="py-4 text-center text-sm text-ink/40">لا توجد بيانات</p>;

//     if (isPlainObject(data[0])) {
//       const columns = Object.keys(data[0]).filter(
//         (k) => !isPlainObject(data[0][k]) && !Array.isArray(data[0][k])
//       );
//       return (
//         <div className="overflow-x-auto rounded-xl border border-ink/10">
//           <table className="w-full text-sm">
//             <thead className="bg-paper">
//               <tr>
//                 {columns.map((c) => (
//                   <th key={c} className="whitespace-nowrap px-3 py-2 text-start font-bold text-ink/60">
//                     {prettify(c)}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {data.map((row, i) => (
//                 <tr key={i} className="border-t border-ink/5">
//                   {columns.map((c) => (
//                     <td key={c} className="whitespace-nowrap px-3 py-2 text-ink/80">
//                       {formatValue(row[c])}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       );
//     }

//     return (
//       <div className="flex flex-wrap gap-1.5">
//         {data.map((v, i) => (
//           <span key={i} className="rounded-lg bg-paper px-2 py-1 text-xs text-ink/70">
//             {formatValue(v)}
//           </span>
//         ))}
//       </div>
//     );
//   }

//   if (isPlainObject(data)) {
//     const entries = Object.entries(data);
//     const scalarEntries = entries.filter(([, v]) => !isPlainObject(v) && !Array.isArray(v));
//     const complexEntries = entries.filter(([, v]) => isPlainObject(v) || Array.isArray(v));

//     return (
//       <div className="flex flex-col gap-5">
//         {scalarEntries.length > 0 && (
//           <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
//             {scalarEntries.map(([k, v]) => (
//               <div key={k} className="rounded-xl border border-ink/10 p-3">
//                 <p className="text-[11px] font-bold text-ink/40">{prettify(k)}</p>
//                 <p className="mt-1 text-lg font-extrabold text-ink">{formatValue(v)}</p>
//               </div>
//             ))}
//           </div>
//         )}

//         {complexEntries.map(([k, v]) => (
//           <div key={k} className={depth > 0 ? "rounded-xl bg-paper p-3" : ""}>
//             <p className="mb-2 text-sm font-extrabold text-ink">{prettify(k)}</p>
//             <ReportDataView data={v} depth={depth + 1} />
//           </div>
//         ))}
//       </div>
//     );
//   }

//   return <p className="text-sm text-ink">{formatValue(data)}</p>;
// };

// export default ReportDataView;
import { translateKey } from "@/utils/reportLabels";

interface Props {
  data: any;
  depth?: number;
}

const isPlainObject = (v: any) => v !== null && typeof v === "object" && !Array.isArray(v);

const formatValue = (v: any) => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") return v.toLocaleString("en-US");
  if (typeof v === "boolean") return v ? "نعم" : "لا";
  return String(v);
};

/**
 * عارض عام: بياخد أي كائن JSON راجع من التقارير ويعرضه تلقائيًا بأسماء عربية
 * - القيم البسيطة (رقم/نص) → كروت إحصائية
 * - مصفوفة كائنات → جدول تلقائي بأعمدة من مفاتيح أول عنصر
 * - مصفوفة قيم بسيطة → tags
 * - كائن متداخل → قسم فرعي بنفس المنطق
 */
const ReportDataView = ({ data, depth = 0 }: Props) => {
  if (data === null || data === undefined) {
    return <p className="py-4 text-center text-sm text-ink/40">لا توجد بيانات</p>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return <p className="py-4 text-center text-sm text-ink/40">لا توجد بيانات</p>;

    if (isPlainObject(data[0])) {
      const columns = Object.keys(data[0]).filter(
        (k) => !isPlainObject(data[0][k]) && !Array.isArray(data[0][k])
      );
      return (
        <div className="overflow-x-auto rounded-xl border border-ink/10">
          <table className="w-full text-sm">
            <thead className="bg-paper">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="whitespace-nowrap px-3 py-2 text-start font-bold text-ink/60">
                    {translateKey(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-t border-ink/5">
                  {columns.map((c) => (
                    <td key={c} className="whitespace-nowrap px-3 py-2 text-ink/80">
                      {formatValue(row[c])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-1.5">
        {data.map((v, i) => (
          <span key={i} className="rounded-lg bg-paper px-2 py-1 text-xs text-ink/70">
            {formatValue(v)}
          </span>
        ))}
      </div>
    );
  }

  if (isPlainObject(data)) {
    const entries = Object.entries(data);
    const scalarEntries = entries.filter(([, v]) => !isPlainObject(v) && !Array.isArray(v));
    const complexEntries = entries.filter(([, v]) => isPlainObject(v) || Array.isArray(v));

    return (
      <div className="flex flex-col gap-5">
        {scalarEntries.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {scalarEntries.map(([k, v]) => (
              <div key={k} className="rounded-xl border border-ink/10 p-3">
                <p className="text-[11px] font-bold text-ink/40">{translateKey(k)}</p>
                <p className="mt-1 text-lg font-extrabold text-ink">{formatValue(v)}</p>
              </div>
            ))}
          </div>
        )}

        {complexEntries.map(([k, v]) => (
          <div key={k} className={depth > 0 ? "rounded-xl bg-paper p-3" : ""}>
            <p className="mb-2 text-sm font-extrabold text-ink">{translateKey(k)}</p>
            <ReportDataView data={v} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  return <p className="text-sm text-ink">{formatValue(data)}</p>;
};

export default ReportDataView;