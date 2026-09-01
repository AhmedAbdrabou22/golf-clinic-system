import { FiSearch } from "react-icons/fi";

const SearchBox = ({
  value,
  onChange,
  placeholder = "بحث...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="relative w-full sm:w-72">
    <FiSearch className="absolute top-1/2 right-3.5 -translate-y-1/2 text-ink/35" size={17} />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="field-input pr-10"
    />
  </div>
);

export default SearchBox;
