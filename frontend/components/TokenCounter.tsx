export default function TokenCounter({ tokens, onRecharge }: { tokens: number; onRecharge: () => void }) {
  const isLow = tokens < 200;
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium ${isLow ? "border-red-300 bg-red-50 text-red-600" : "border-slate-200 bg-white text-slate-700"}`}>
      <span>🪙</span>
      <span>{tokens.toLocaleString()} tokens</span>
      {isLow && (
        <button className="rounded bg-red-600 px-2 py-1 text-xs text-white" onClick={onRecharge}>
          Recharge
        </button>
      )}
    </div>
  );
}
