import { useEffect, useRef, useState } from "react";

export interface StaffFilterOption {
  id: string;
  fullName: string;
  email: string;
}

interface StaffMultiSelectProps {
  label: string;
  placeholder: string;
  options: StaffFilterOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

function StaffMultiSelect({
  label,
  placeholder,
  options,
  selectedIds,
  onChange,
}: StaffMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeWhenClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeWhenClickOutside);
    return () => document.removeEventListener("mousedown", closeWhenClickOutside);
  }, []);

  const allSelected =
    options.length > 0 && options.every((option) => selectedIds.includes(option.id));

  const summary = (() => {
    if (options.length === 0) return "Không có nhân viên";
    if (allSelected) return `Tất cả (${options.length})`;
    if (selectedIds.length === 0) return placeholder;

    const selectedNames = options
      .filter((option) => selectedIds.includes(option.id))
      .map((option) => option.fullName);

    if (selectedNames.length <= 2) return selectedNames.join(", ");
    return `${selectedNames.slice(0, 2).join(", ")} +${selectedNames.length - 2}`;
  })();

  const toggleAll = () => {
    onChange(allSelected ? [] : options.map((option) => option.id));
  };

  const toggleOne = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id]
    );
  };

  return (
    <div className="staff-multi-select" ref={rootRef}>
      <span className="staff-filter-label" style={{ color: "#f6eadb" }}>
        {label}
      </span>

      <button
        type="button"
        className={`staff-filter-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        style={{
          background: "#fffaf4",
          color: "#211a15",
          WebkitTextFillColor: "#211a15",
        }}
      >
        <span
          style={{
            color: selectedIds.length === 0 ? "#6d5e52" : "#211a15",
            WebkitTextFillColor: selectedIds.length === 0 ? "#6d5e52" : "#211a15",
            fontWeight: 700,
          }}
        >
          {summary}
        </span>
        <b
          style={{
            color: "#8f5e26",
            WebkitTextFillColor: "#8f5e26",
            fontSize: "12px",
          }}
        >
          {open ? "▲" : "▼"}
        </b>
      </button>

      {open && (
        <div
          className="staff-filter-menu"
          style={{
            background: "#fffdf9",
            color: "#201914",
            border: "1px solid #c9aa82",
          }}
        >
          <label
            className="staff-filter-all"
            style={{
              color: "#201914",
              WebkitTextFillColor: "#201914",
              fontWeight: 800,
            }}
          >
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            <span style={{ color: "#201914", WebkitTextFillColor: "#201914" }}>
              Chọn tất cả
            </span>
          </label>

          <div className="staff-filter-options">
            {options.map((option) => (
              <label key={option.id}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(option.id)}
                  onChange={() => toggleOne(option.id)}
                />
                <span>
                  <strong
                    style={{
                      color: "#211a15",
                      WebkitTextFillColor: "#211a15",
                    }}
                  >
                    {option.fullName}
                  </strong>
                  <small
                    style={{
                      color: "#77685c",
                      WebkitTextFillColor: "#77685c",
                    }}
                  >
                    {option.email}
                  </small>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffMultiSelect;