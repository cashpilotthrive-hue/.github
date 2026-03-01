import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchActivity } from "../../api/client";

const STATUS_COLOR: Record<string, string> = {
  success: "bg-green-500",
  pending: "bg-yellow-400",
  failed: "bg-red-500",
};

const ActivityFeed: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["activity"],
    queryFn: () => fetchActivity(20),
    refetchInterval: 15_000,
  });

  if (isLoading) return <div className="text-slate-400 text-sm">Loading activity…</div>;
  if (isError || !data)
    return <div className="text-red-400 text-sm">Failed to load activity.</div>;

  return (
    <div className="rounded-xl bg-slate-800 p-5 flex flex-col gap-3">
      <div className="text-slate-400 text-xs uppercase tracking-widest">Recent Activity</div>
      {data.length === 0 && (
        <div className="text-slate-500 text-sm">No activity yet.</div>
      )}
      <ul className="divide-y divide-slate-700">
        {data.map((item) => (
          <li key={item.id} className="flex items-center justify-between py-2">
            <div>
              <span className="font-medium text-sm capitalize">{item.commandType}</span>
              <span className="ml-2 text-slate-400 text-xs">
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full text-white ${STATUS_COLOR[item.status] ?? "bg-slate-600"}`}
            >
              {item.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;
