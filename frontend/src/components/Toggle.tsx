interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 group"
    >
      <div
        className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
          checked ? 'bg-primary-500' : 'bg-ink-200'
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 shadow-sm ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
      {label && (
        <span className="text-sm text-ink-600 group-hover:text-ink-800 transition-colors">
          {label}
        </span>
      )}
    </button>
  );
}
