interface FlagSelectorProps {
  selectedFlags: string[];
  onFlagsChange: (flags: string[]) => void;
  disabled?: boolean;
}

const AVAILABLE_FLAGS = [
  {
    value: "recipe",
    label: "🍽️ Recipe",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  {
    value: "tip",
    label: "💡 Tip",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  {
    value: "question",
    label: "❓ Question",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  {
    value: "review",
    label: "⭐ Review",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  {
    value: "beginner",
    label: "🌱 Beginner",
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  },
];

const FlagSelector = ({
  selectedFlags,
  onFlagsChange,
  disabled = false,
}: FlagSelectorProps) => {
  const toggleFlag = (flagValue: string) => {
    if (disabled) return;

    if (selectedFlags.includes(flagValue)) {
      onFlagsChange(selectedFlags.filter((flag) => flag !== flagValue));
    } else {
      onFlagsChange([...selectedFlags, flagValue]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Tags (optional)
      </label>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_FLAGS.map((flag) => (
          <button
            key={flag.value}
            type="button"
            onClick={() => toggleFlag(flag.value)}
            disabled={disabled}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              selectedFlags.includes(flag.value)
                ? flag.color + " ring-2 ring-offset-1 ring-gray-400"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {flag.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export { FlagSelector, AVAILABLE_FLAGS };
export default FlagSelector;
