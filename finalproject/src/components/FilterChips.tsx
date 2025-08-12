import { AVAILABLE_FLAGS } from "./FlagSelector";

interface FilterChipsProps {
  selectedFilters: string[];
  onFiltersChange: (filters: string[]) => void;
}

const FilterChips = ({
  selectedFilters,
  onFiltersChange,
}: FilterChipsProps) => {
  const toggleFilter = (flagValue: string) => {
    if (selectedFilters.includes(flagValue)) {
      onFiltersChange(selectedFilters.filter((filter) => filter !== flagValue));
    } else {
      onFiltersChange([...selectedFilters, flagValue]);
    }
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter by tags:
        </h3>
        {selectedFilters.length > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {AVAILABLE_FLAGS.map((flag) => (
          <button
            key={flag.value}
            onClick={() => toggleFilter(flag.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              selectedFilters.includes(flag.value)
                ? flag.color +
                  " ring-2 ring-offset-1 ring-gray-400 dark:ring-offset-gray-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {flag.label}
            {selectedFilters.includes(flag.value) && (
              <span className="ml-1">×</span>
            )}
          </button>
        ))}
      </div>

      {selectedFilters.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing posts with:{" "}
          {selectedFilters
            .map((filter) => {
              const flag = AVAILABLE_FLAGS.find((f) => f.value === filter);
              return flag?.label;
            })
            .join(", ")}
        </div>
      )}
    </div>
  );
};

export default FilterChips;
