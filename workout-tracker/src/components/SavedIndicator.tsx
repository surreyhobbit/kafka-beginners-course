interface SavedIndicatorProps {
  visible: boolean;
}

export default function SavedIndicator({ visible }: SavedIndicatorProps) {
  return (
    <span
      className={`text-xs font-medium text-emerald-600 transition-opacity duration-300 dark:text-emerald-400 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      role="status"
      aria-live="polite"
    >
      Saved
    </span>
  );
}
