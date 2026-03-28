import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Building2, Home, Stethoscope, GraduationCap, ShoppingBag, Factory, Heart } from "lucide-react";
import type { Infrastructure } from "@shared/schema";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  residential: <Home className="w-3.5 h-3.5 text-amber-400" />,
  commercial: <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />,
  medical: <Stethoscope className="w-3.5 h-3.5 text-red-400" />,
  school: <GraduationCap className="w-3.5 h-3.5 text-green-400" />,
  military: <Factory className="w-3.5 h-3.5 text-slate-400" />,
  humanitarian: <Heart className="w-3.5 h-3.5 text-rose-400" />,
  infrastructure: <Building2 className="w-3.5 h-3.5 text-purple-400" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  residential: "#f59e0b",
  commercial: "#3b82f6",
  medical: "#ef4444",
  school: "#22c55e",
  military: "#94a3b8",
  humanitarian: "#f43f5e",
  infrastructure: "#a855f7",
};

export function InfrastructurePanel() {
  const { data: infraData } = useQuery<Infrastructure[]>({
    queryKey: ["/api/infrastructure"],
  });

  const { data: infraSummary } = useQuery<{ category: string; totalCount: number; country: string }[]>({
    queryKey: ["/api/infrastructure/summary"],
  });

  // Aggregate by category for chart
  const categoryTotals: Record<string, number> = {};
  (infraSummary ?? []).forEach((s) => {
    categoryTotals[s.category] = (categoryTotals[s.category] ?? 0) + (s.totalCount ?? 0);
  });

  const chartData = Object.entries(categoryTotals)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const totalDamaged = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // Group by country
  const byCountry: Record<string, { category: string; totalCount: number }[]> = {};
  (infraSummary ?? []).forEach((s) => {
    if (!byCountry[s.country]) byCountry[s.country] = [];
    byCountry[s.country].push({ category: s.category, totalCount: s.totalCount ?? 0 });
  });

  return (
    <div className="space-y-3 pt-3" data-testid="infrastructure-panel">
      {/* Total */}
      <Card className="border-card-border bg-destructive/5">
        <CardContent className="p-3 flex items-center gap-3">
          <Building2 className="w-5 h-5 text-destructive" />
          <div>
            <p className="text-xs text-muted-foreground">Total Structures Damaged/Destroyed</p>
            <p className="text-xl font-bold tabular-nums">{totalDamaged.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="border-card-border">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Damage by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-3">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 70, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,12%,18%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(210,10%,55%)" }} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 10, fill: "hsl(210,10%,55%)" }} width={65} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220,16%,12%)",
                  border: "1px solid hsl(220,12%,18%)",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [value.toLocaleString(), "Units"]}
              />
              <Bar dataKey="count" radius={[0, 2, 2, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] ?? "#6b7280"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Breakdown by Country */}
      {Object.entries(byCountry).map(([country, items]) => (
        <Card key={country} className="border-card-border">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <span className="text-muted-foreground uppercase tracking-wider">{country}</span>
              <Badge variant="secondary" className="text-[10px] tabular-nums">
                {items.reduce((a, b) => a + b.totalCount, 0).toLocaleString()} total
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="space-y-1.5">
              {items.sort((a, b) => b.totalCount - a.totalCount).map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {CATEGORY_ICONS[item.category] ?? <Building2 className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span className="text-xs capitalize">{item.category}</span>
                  </div>
                  <span className="text-xs font-medium tabular-nums">{item.totalCount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Raw records table */}
      <Card className="border-card-border">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Damage Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="space-y-2">
            {(infraData ?? []).map((item) => (
              <div key={item.id} className="flex items-start gap-2 pb-2 border-b border-border/30 last:border-0">
                {CATEGORY_ICONS[item.category] ?? <Building2 className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{item.country}</span>
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{item.category}</Badge>
                    <span className="text-xs font-bold tabular-nums ml-auto">{item.count.toLocaleString()}</span>
                  </div>
                  {item.description && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {item.source}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Need to import Cell from recharts
import { Cell } from "recharts";
