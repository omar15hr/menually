import { Input } from "../ui/input";
import SearchIcon from "../icons/SearchIcon";

interface Props {
  placeholder?: string;
}

export default function SearchInput({
  placeholder = "Buscar platos, analíticas...",
}: Props) {
  return (
    <div className="relative w-full">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[#64748B]" />
      <Input
        placeholder={placeholder}
        className="pl-10 bg-[#F1F5F9] border-none shadow-none focus-visible:ring-1 focus-visible:ring-gray-200 text-sm h-10 rounded-lg placeholder:text-[#94A3B8]"
      />
    </div>
  );
}
