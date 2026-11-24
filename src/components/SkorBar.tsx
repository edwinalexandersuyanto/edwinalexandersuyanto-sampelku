interface SkorBarProps {
  nilai: 1 | 2 | 3 | 4 | 5;
  label: string;
}

export function SkorBar({ nilai, label }: SkorBarProps) {
  return (
    <div className="flex items-center gap-2.5" aria-label={`${label}: ${nilai} dari 5`}>
      <div className="flex items-center gap-1" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((step) => (
          <span
            key={step}
            className={`h-2 w-4 rounded-[2px] ${
              step <= nilai ? 'bg-[#1F3A3D]' : 'bg-zinc-200'
            }`}
          />
        ))}
      </div>
      <span className="font-mono text-xs font-medium text-zinc-700 tabular-nums">
        {nilai}/5
      </span>
    </div>
  );
}
