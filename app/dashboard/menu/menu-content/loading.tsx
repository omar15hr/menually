import { MenuallySpinner } from "@/components/shared/MenuallySpinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <MenuallySpinner size={48} />
    </div>
  );
}
