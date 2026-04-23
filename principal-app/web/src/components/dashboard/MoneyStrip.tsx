import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchWealth } from "../../api/client";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const MoneyStrip: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["wealth"],
    queryFn: fetchWealth,
    refetchInterval: 30_000,
  });

  if (isLoading) return <div className="text-slate-400 text-sm">Loading wealth…</div>;
  if (isError || !data)
    return <div className="text-red-400 text-sm">Failed to load wealth data.</div>;

  const { totalUsd, breakdown } = data;

  return (
    <div className="rounded-xl bg-slate-800 p-5 flex flex-col gap-3">
      <div className="text-slate-400 text-xs uppercase tracking-widest">Net Worth</div>
      <div className="text-4xl font-bold">{fmt(totalUsd)}</div>
      <div className="grid grid-cols-4 gap-3 mt-2">
        {(Object.entries(breakdown) as [string, number][]).map(([key, val]) => (
          <div key={key} className="rounded-lg bg-slate-700 p-3">
            <div className="text-slate-400 text-xs capitalize">{key}</div>
            <div className="font-semibold text-sm mt-1">{fmt(val)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoneyStrip;
