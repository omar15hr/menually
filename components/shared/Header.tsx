import { BellIcon } from "lucide-react";
import SearchInput from "../dashboard/SearchInput";
import QuestionCircleIcon from "../icons/QuestionCircleIcon";
import { SidebarTrigger } from "../ui/sidebar";

export default function Header() {
  return (
    <header className="border-b border-[#E2E8F0] w-full flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-3 w-full max-w-md">
        <SidebarTrigger className="cursor-pointer -ml-2 text-[#64748B] hover:text-[#0F172A]" />
        <SearchInput />
      </div>
      <div className="flex items-center gap-6 pr-2">
        <button className="hover:opacity-70 transition-opacity cursor-pointer flex items-center justify-center">
          <BellIcon />
        </button>
        <button className="hover:opacity-70 transition-opacity cursor-pointer flex items-center justify-center">
          <QuestionCircleIcon />
        </button>
      </div>
    </header>
  )
}