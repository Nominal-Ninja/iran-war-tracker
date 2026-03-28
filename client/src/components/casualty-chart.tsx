import { useQuery } from "@tanstack/react-query";
import type { Casualty } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Skull, Heart, Shield, Users } from "lucide-react";

const SIDE_COLORS: Record<string, string> = {
  Iran: "#ef4444",
  US: "#3b82f6",
  Israel: "#38bdf8",
  Lebanon: "#22c55e",
  "Gulf States": "#f59e0b",
};

interface CasualtyChartProps {
  summary: {
    side: string;
    totalKilled: number;
    totalWounded: number;
    militaryKilled: number;
    civilianKilled: number;
  }[];
}

export function CasualtyChart({ summary }: CasualtyChartProps) {
  const { data: rawCasualties } = useQuery<Casualty[]>({
    queryKey: ["/api/casualties"],
  });

  const totalKilled = summary.reduce((acc, s) => acc + (s.totalKilled ?? 0), 0);
  const totalWounded = summary.reduce((acc, s) => acc + (s.totalWounded ?? 0), 0);
  const totalMilitary = summary.reduce((acc, s) => acc + (s.militaryKilled ?? 0), 0);
  const totalCivilian = summary.reduce((acc, s) => acc + (s.civilianKilled ?? 0), 0);

  // Bar chart data
  const barData = summary.map((s) => ({
    name: s.side,
    Killed: s.totalKilled ?? 0,
    Wounded: s.totalWounded ?? 0,
  }));

  // Pie chart — killed by side
  const pieData = summary
    .filter((s) => (s.totalKilled ?? 0) > 0)
    .map((s) => ({
      name: s.side,
      value: s.totalKilled ?? 0,
    }));

  // Military vs civilian breakdown
  const breakdownData = [
    { name: "Military", value: totalMilitary, color: "#3b82f6" },
    { name: "Civilian", value: totalCivilian, color: "#ef4444" },
    { name: "Unclassified", value: Math.max(0, totalKilled - totalMilitary - totalCivilian), color: "#6b7280" },
  ].filter((d) => d.value > 0);

  // Daily casualties timeline from raw data
  const dailyData: Record<string, number> = {};
  (rawCasualties ?? []).forEach((c) => {
    const key = c.date;
    dailyData[key] = (dailyData[key] ?? 0) + c.killed;
  });
  const timelineData = Object.entries(dailyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, killed]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      killed,
    }));

  return (
    <div className="space-y-3 pt-3" data-testid="casualty-panel">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-2">
        <MiniKpi icon={<Skull className="w-3.5 h-3.5 text-red-400" />} label="Total Killed" value={totalKilled.toLocaleString()} />
        <MiniKpi icon={<Heart className="w-3.5 h-3.5 text-orange-400" />} label="Total Wounded" value={totalWounded.toLocaleString()} />
        <MiniKpi icon={<Shield className="w-3.5 h-3.5 text-blue-400" />} label="Military KIA" value={totalMilitary.toLocaleString()} />
        <MiniKpi icon={<Users className="w-3.5 h-3.5 text-rose-400" />} label="Civilian KIA" value={totalCivilian.toLocaleString()} />
      </div>

      {/* Deaths by Side — bar chart */}
      <Card className="border-card-border">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Casualties by Side
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-3">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,12%,18%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(210,10%,55%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(210,10%,55%)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220,16%,12%)",
                  border: "1px solid hsl(220,12%,18%)",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(210,15%,90%)" }}
              />
              <Bar dataKey="Killed" fill="#ef4444" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Wounded" fill="#f97316" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Killed Distribution + Mil vs Civ */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="border-card-border">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Killed by Side
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" strokeWidth={1} stroke="hsl(220,16%,10%)">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={SIDE_COLORS[entry.name] ?? "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220,16%,12%)",
                    border: "1px solid hsl(220,12%,18%)",
                    borderRadius: "6px",
                    fontSize: "11px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Mil. vs Civilian
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={breakdownData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" strokeWidth={1} stroke="hsl(220,16%,10%)">
                  {breakdownData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220,16%,12%)",
                    border: "1px solid hsl(220,12%,18%)",
                    borderRadius: "6px",
                    fontSize: "11px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Casualties Timeline */}
      {timelineData.length > 0 && (
        <Card className="border-card-border">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Daily Reported Killed
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={timelineData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,12%,18%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(210,10%,55%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(210,10%,55%)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220,16%,12%)",
                    border: "1px solid hsl(220,12%,18%)",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="killed" fill="#ef4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Side detail table */}
      <Card className="border-card-border">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Breakdown by Side
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <table className="w-full text-xs" data-testid="casualty-table">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 font-medium text-muted-foreground">Side</th>
                <th className="text-right py-1.5 font-medium text-muted-foreground">Killed</th>
                <th className="text-right py-1.5 font-medium text-muted-foreground">Wounded</th>
                <th className="text-right py-1.5 font-medium text-muted-foreground">Mil. KIA</th>
                <th className="text-right py-1.5 font-medium text-muted-foreground">Civ. KIA</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s) => (
                <tr key={s.side} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-1.5 font-medium">
                    <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: SIDE_COLORS[s.side] ?? "#6b7280" }} />
                    {s.side}
                  </td>
                  <td className="text-right py-1.5 tabular-nums">{(s.totalKilled ?? 0).toLocaleString()}</td>
                  <td className="text-right py-1.5 tabular-nums">{(s.totalWounded ?? 0).toLocaleString()}</td>
                  <td className="text-right py-1.5 tabular-nums">{(s.militaryKilled ?? 0).toLocaleString()}</td>
                  <td className="text-right py-1.5 tabular-nums">{(s.civilianKilled ?? 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniKpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="border-card-border">
      <CardContent className="p-2.5 flex items-center gap-2">
        {icon}
        <div>
          <p className="text-[10px] text-muted-foreground">{label}</p>
          <p className="text-sm font-bold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
