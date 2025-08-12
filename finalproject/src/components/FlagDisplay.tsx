import { AVAILABLE_FLAGS } from "./FlagSelector";

interface FlagDisplayProps {
  flags: string[];
  size?: "sm" | "md";
}

const FlagDisplay = ({ flags, size = "sm" }: FlagDisplayProps) => {
  if (!flags || flags.length === 0) return null;

  const sizeClasses = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm";

  return (
    <div className="flex flex-wrap gap-1">
      {flags.map((flagValue) => {
        const flag = AVAILABLE_FLAGS.find((f) => f.value === flagValue);
        if (!flag) return null;

        return (
          <span
            key={flagValue}
            className={`${flag.color} ${sizeClasses} rounded-full font-medium`}
          >
            {flag.label}
          </span>
        );
      })}
    </div>
  );
};

export default FlagDisplay;
