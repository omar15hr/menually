interface MenuShapeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MenuShapeSelector({
  value,
  onChange,
}: MenuShapeSelectorProps) {
  const options = [
    { value: "square", label: "Cuadrada" },
    { value: "rounded", label: "Redondeada" },
    { value: "circle", label: "Circular" },
  ];

  return (
    <div className="flex flex-row gap-3 w-full">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`
            flex flex-col items-center gap-2 flex-1 p-3
            rounded-xl border-2 transition-all duration-150 cursor-pointer
            ${
              value === opt.value
                ? "border-[#114821] bg-[#CDF54533]"
                : "border-[#E4E4E6] bg-white hover:border-[#114821]"
            }
          `}
        >
          <ShapePreview shape={opt.value} />
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

function ShapePreview({ shape }: { shape: string }) {
  const radiusMap: Record<string, string> = {
    square: "rounded-none",
    rounded: "rounded-lg",
    circle: "rounded-full",
  };

  return (
    <div className="flex items-center justify-center w-full py-1">
      <div
        className={`size-10 bg-white border-2 border-[#E4E4E6] ${radiusMap[shape] ?? "rounded-none"}`}
      />
    </div>
  );
}
