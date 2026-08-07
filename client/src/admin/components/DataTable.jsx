import { useState, useMemo } from "react";
import LoadingSkeleton from "./LoadingSkeleton";

export default function DataTable({
  columns,
  data,
  loading,
  searchPlaceholder = "Search records...",
  onAddClick,
  addButtonText = "Add New",
  actions,
  pageSize = 10,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some(
        (val) => val && String(val).toLowerCase().includes(query)
      )
    );
  }, [data, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="admin-table-wrapper">
      <div className="admin-table-toolbar">
        <div className="admin-search-input">
          <span className="admin-search-icon">🔍</span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          {onAddClick && (
            <button onClick={onAddClick} className="admin-btn admin-btn-primary admin-btn-sm">
              <span>➕</span> {addButtonText}
            </button>
          )}
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={col.key || index} style={{ width: col.width }}>
                  {col.title}
                </th>
              ))}
              {actions && <th style={{ width: "120px", textAlign: "right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx}>
                      <LoadingSkeleton height="20px" width="80%" />
                    </td>
                  ))}
                  {actions && (
                    <td>
                      <LoadingSkeleton height="20px" width="100%" />
                    </td>
                  )}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}>
                  <div className="admin-empty-state">
                    <div className="admin-empty-icon">📂</div>
                    <div className="admin-empty-title">No Records Found</div>
                    <div className="admin-empty-text">
                      {searchQuery ? "Try adjusting your search criteria" : "Click add new to create a record"}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIdx) => (
                <tr key={row.id || rIdx}>
                  {columns.map((col, cIdx) => (
                    <td key={col.key || cIdx}>
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
                    </td>
                  ))}
                  {actions && (
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-table-pagination">
        <div className="admin-table-pagination-info">
          Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
          {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
        </div>

        <div className="admin-pagination-btns">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="admin-page-btn"
          >
            ◀
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`admin-page-btn ${currentPage === pageNum ? "active" : ""}`}
                >
                  {pageNum}
                </button>
              );
            }
            if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
              return <span key={pageNum} style={{ padding: "0 4px", color: "var(--admin-text-dim)" }}>...</span>;
            }
            return null;
          })}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="admin-page-btn"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
