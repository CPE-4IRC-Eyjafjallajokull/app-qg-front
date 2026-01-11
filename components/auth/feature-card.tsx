export function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
      <div className="mb-2 text-white/90">{icon}</div>
      <h3 className="font-semibold text-sm mb-0.5">{title}</h3>
      <p className="text-xs text-white/60">{description}</p>
    </div>
  );
}
