export function StatsBox({ title, value }: { title: string; value: number }) {
  return (
    <div className="flex flex-col text-center">
      <span className="font-bold text-2xl">{value}</span>
      <span>{title}</span>
    </div>
  );
}
