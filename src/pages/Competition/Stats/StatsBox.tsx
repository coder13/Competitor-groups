export function StatsBox({ title, value }: { title: string; value: number }) {
  return (
    <div className="flex flex-col text-center">
      <span className="type-title">{value}</span>
      <span className="type-body-sm">{title}</span>
    </div>
  );
}
