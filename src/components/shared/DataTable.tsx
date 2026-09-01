import Loader from "./Loader";
import EmptyState from "./EmptyState";

export interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  isLoading?: boolean;
  rowKey: (row: T) => React.Key;
  emptyTitle?: string;
  emptyHint?: string;
}

function DataTable<T>({
  columns,
  rows,
  isLoading,
  rowKey,
  emptyTitle,
  emptyHint,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="table-wrap bg-white">
        <Loader label="جاري تحميل البيانات..." />
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="table-wrap bg-white">
        <EmptyState title={emptyTitle} hint={emptyHint} />
      </div>
    );
  }

  return (
    <div className="table-wrap bg-white">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.header}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((col) => (
                <td key={col.header} className={col.className}>
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
