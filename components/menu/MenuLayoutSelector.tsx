interface MenuLayoutSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MenuLayoutSelector({
  value,
  onChange,
}: MenuLayoutSelectorProps) {
  const options = [
    { value: "horizontal", label: "Horizontal" },
    { value: "vertical", label: "Vertical" },
  ];

  return (
    <div className="flex flex-row gap-3 w-full">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`
            flex flex-col items-center gap-2 flex-1 p-3 justify-center
            rounded-xl border-2 transition-all duration-150 cursor-pointer
            ${
              value === opt.value
                ? "border-[#114821] bg-[#CDF54533]"
                : "border-[#E4E4E6] bg-white hover:border-[#114821]"
            }
          `}
        >
          <LayoutPreview layout={opt.value} />
          <span
            className={`text-xs font-semibold ${
              value === opt.value ? "text-[#114821]" : "text-[#58606E]"
            }`}
          >
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function LayoutPreview({ layout }: { layout: string }) {
  if (layout === "horizontal") {
    return (
      <div className="flex flex-row gap-1.5 w-full items-center p-1.5 rounded-lg bg-white border border-[#E4E4E6]">
        <div className="size-8 rounded-md shrink-0 bg-[#D1D5DB]" />
        <div className="flex flex-col gap-1 flex-1">
          <div className="h-2 rounded-full w-3/4 bg-[#D1D5DB]" />
          <div className="h-1.5 rounded-full w-full bg-[#E4E4E6]" />
          <div className="h-1.5 rounded-full w-2/3 bg-[#E4E4E6]" />
        </div>
      </div>
    );
  }

  // vertical
  return (
    <div className="flex flex-col gap-1.5 w-full p-1.5 rounded-lg bg-white border border-[#E4E4E6]">
      <div className="h-10 w-full rounded-md bg-[#D1D5DB]" />
      <div className="h-2 rounded-full w-3/4 bg-[#D1D5DB]" />
      <div className="h-1.5 rounded-full w-full bg-[#E4E4E6]" />
    </div>
  );
}
