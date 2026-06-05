import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCredits } from "../../api/client";

const EVENT_COLOR: Record<string, string> = {
  alert: "text-red-400",
  payment: "text-green-400",
  limit_change: "text-yellow-400",
};

const CreditTicker: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["credits"],
    queryFn: () => fetchCredits(10),
    refetchInterval: 20_000,
  });

  if (isLoading) return <div className="text-slate-400 text-sm">Loading credits…</div>;
  if (isError || !data)
    return <div className="text-red-400 text-sm">Failed to load credit events.</div>;

  return (
    <div className="rounded-xl bg-slate-800 p-5 flex flex-col gap-3">
      <div className="text-slate-400 text-xs uppercase tracking-widest">Credit Events</div>
      {data.length === 0 && (
        <div className="text-slate-500 text-sm">No credit events.</div>
      )}
      <ul className="divide-y divide-slate-700">
        {data.map((event) => (
          <li key={event.id} className="py-2">
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold uppercase ${EVENT_COLOR[event.eventType] ?? "text-slate-300"}`}
              >
                {event.eventType.replace("_", " ")}
              </span>
              {event.amount != null && (
                <span className="text-sm font-semibold">
                  {event.amount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </span>
              )}
            </div>
            <div className="text-slate-300 text-sm mt-0.5">{event.description}</div>
            <div className="text-slate-500 text-xs mt-0.5">
              {new Date(event.occurredAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CreditTicker;
