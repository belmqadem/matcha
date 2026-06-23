interface ProfileInfoGridProps {
  locationCity: string | null;
  age: number | null;
  genderLabel: string;
  prefLabel: string;
  firstName: string;
}

export function ProfileInfoGrid({
  locationCity,
  age,
  genderLabel,
  prefLabel,
  firstName,
}: ProfileInfoGridProps) {
  const items = [
    { label: 'City', value: locationCity },
    { label: 'Age', value: age ? `${age} years old` : null },
    { label: 'Gender', value: genderLabel },
    { label: 'Orientation', value: prefLabel },
  ];

  return (
    <div className="bg-surface/85 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-border/70 shadow-premium hover:shadow-glow/5 hover:border-primary/20 transition-all duration-500 animate-fade-in-up shrink-0 w-full">
      <h3 className="text-base sm:text-lg font-black text-text mb-4 tracking-tight">
        About {firstName}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {items.map(({ label, value }) => (
          <div key={label} className="border-b border-background/45 pb-2">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className={`text-sm sm:text-base font-black ${value ? 'text-text' : 'text-border'}`}>
              {value ?? 'Not specified'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
