interface UserSidebarInfoProps {
  businessName?: string;
}

export default function UserSidebarInfo({
  businessName,
}: UserSidebarInfoProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[#0F172A] text-xs font-semibold">
        {businessName ?? "Tu Negocio"}
      </span>
      <span className="text-[#64748B] text-[10px] font-normal">
        Premium Plan
      </span>
    </div>
  );
}
