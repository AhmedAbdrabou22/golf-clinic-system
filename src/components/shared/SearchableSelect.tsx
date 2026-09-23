import { useMemo, useState } from "react";

interface Option {
  value: string | number;
  label: string;
  sublabel?: string;
}

interface Props {
  label?: string;
  value: string | number | null;
  onChange: (value: string | number) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const SearchableSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder = "اختر...",
  required,
  disabled,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => String(o.value) === String(value));

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.trim().toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sublabel ?? "").toLowerCase().includes(q)
    );
  }, [options, query]);

  return (
    <div className="relative">
      {label && <label className="field-label">{label}</label>}

      <input
        type="text"
        className="field-input"
        placeholder={placeholder}
        required={required && !value}
        disabled={disabled}
        value={open ? query : selected?.label ?? ""}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange("");
        }}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />

      {open && filtered.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-ink/10 bg-white shadow-lg">
          {filtered.map((o) => (
            <li
              key={o.value}
              onMouseDown={() => {
                onChange(o.value);
                setQuery("");
                setOpen(false);
              }}
              className={`cursor-pointer px-3 py-2 text-sm hover:bg-mint-100 ${
                String(o.value) === String(value) ? "bg-mint-100 font-bold" : ""
              }`}
            >
              <span className="font-bold text-ink">{o.label}</span>
              {o.sublabel && (
                <span className="ms-2 text-xs text-ink/50">{o.sublabel}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {open && filtered.length === 0 && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-ink/10 bg-white p-3 text-xs text-ink/50 shadow-lg">
          لا توجد نتائج
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;