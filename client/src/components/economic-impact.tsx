/**
 * economic-impact.tsx
 * Economic Impact dashboard showing:
 * 1. Oil price gauge with "acceptable range" for US economy (green/yellow/red zones)
 * 2. Brent crude price history since war started
 * 3. Strait of Hormuz shipping status — daily transits, blocked vs open
 *
 * The oil price gauge shows the current Brent crude price against an
 * inflation-adjusted range where the US economy performs best ($60-$90/bbl).
 * Outside that range, the gauge shifts to yellow (strain) and red (crisis).
 *
 * Author: Austin Wesley
 */
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, ReferenceArea, Area, AreaChart,
} from "recharts";
import { Fuel, Ship, AlertTriangle, TrendingUp, Anchor, ShieldAlert } from "lucide-react";

interface OilPriceData {
  current: { brent: number; wti: number; timestamp: string; source: string };
  history: { date: string; price: number; label: string }[];
  acceptableRange: {
    idealLow: number; idealHigh: number;
    warningHigh: number; criticalHigh: number; warningLow: number;
    unit: string; note: string;
  };
}

interface HormuzData {
  status: string;
  statusSince: string;
  normalDailyTransits: number;
  currentDailyTransits: number;
  transitHistory: { date: string; transits: number; status: string }[];
  strandedVessels: number;
  warRiskInsuranceMultiplier: number;
  oilThroughputImpact: string;
  globalOilSupplyImpact: string;
  source: string;
}

export function EconomicImpact() {
  const { data: oilData } = useQuery<OilPriceData>({
    queryKey: ["/api/oil-price"],
  });

  const { data: hormuzData } = useQuery<HormuzData>({
    queryKey: ["/api/hormuz"],
  });

  const brent = oilData?.current.brent ?? 0;
  const range = oilData?.acceptableRange;

  // Calculate gauge position (0-100%)
  const gaugeMin = 40;
  const gaugeMax = 140;
  const gaugePercent = Math.max(0, Math.min(100, ((brent - gaugeMin) / (gaugeMax - gaugeMin)) * 100));

  // Determine zone color
  const getZoneColor = (price: number) => {
    if (!range) return "#6b7280";
    if (price >= range.idealLow && price <= range.idealHigh) return "#22c55e"; // green
    if (price > range.idealHigh && price <= range.warningHigh) return "#eab308"; // yellow
    if (price > range.warningHigh) return "#ef4444"; // red
    if (price < range.idealLow && price >= range.warningLow) return "#eab308"; // yellow low
    return "#ef4444"; // red low
  };

  const getZoneLabel = (price: number) => {
    if (!range) return "Unknown";
    if (price >= range.idealLow && price <= range.idealHigh) return "OPTIMAL";
    if (price > range.idealHigh && price <= range.warningHigh) return "ELEVATED";
    if (price > range.warningHigh) return "CRISIS";
    if (price < range.idealLow) return "TOO LOW";
    return "Unknown";
  };

  const zoneColor = getZoneColor(brent);
  const zoneLabel = getZoneLabel(brent);

  // Hormuz status color
  const hormuzStatusColor = hormuzData?.status === "CLOSED" ? "#ef4444"
    : hormuzData?.status === "RESTRICTED" ? "#eab308" : "#22c55e";

  return (
    <div className="space-y-3 pt-3" data-testid="economic-impact">
      {/* ==================== OIL PRICE GAUGE ==================== */}
      <Card className="border-card-border overflow-hidden">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Fuel className="w-3.5 h-3.5" />
            Brent Crude — US Economy Impact Gauge
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {/* Gauge visualization */}
          <div className="relative h-20 mb-3">
            {/* Background track */}
            <div className="absolute inset-x-0 top-8 h-6 rounded-full overflow-hidden flex">
              {/* Red zone (too low) */}
              <div className="h-full bg-red-500/30" style={{ width: `${((range?.warningLow ?? 45) - gaugeMin) / (gaugeMax - gaugeMin) * 100}%` }} />
              {/* Yellow zone (low warning) */}
              <div className="h-full bg-yellow-500/30" style={{ width: `${((range?.idealLow ?? 60) - (range?.warningLow ?? 45)) / (gaugeMax - gaugeMin) * 100}%` }} />
              {/* Green zone (optimal) */}
              <div className="h-full bg-green-500/40" style={{ width: `${((range?.idealHigh ?? 90) - (range?.idealLow ?? 60)) / (gaugeMax - gaugeMin) * 100}%` }} />
              {/* Yellow zone (elevated) */}
              <div className="h-full bg-yellow-500/30" style={{ width: `${((range?.warningHigh ?? 110) - (range?.idealHigh ?? 90)) / (gaugeMax - gaugeMin) * 100}%` }} />
              {/* Red zone (crisis) */}
              <div className="h-full bg-red-500/30 flex-1" />
            </div>

            {/* Current price indicator (needle) */}
            <div
              className="absolute top-1 transition-all duration-700 ease-out flex flex-col items-center"
              style={{ left: `${gaugePercent}%`, transform: "translateX(-50%)" }}
            >
              <div className="text-sm font-bold tabular-nums" style={{ color: zoneColor }}>
                ${brent.toFixed(2)}
              </div>
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent" style={{ borderTopColor: zoneColor }} />
              <div className="w-0.5 h-3" style={{ background: zoneColor }} />
            </div>

            {/* Zone labels */}
            <div className="absolute bottom-0 inset-x-0 flex justify-between text-[9px] text-muted-foreground/60 px-1">
              <span>${gaugeMin}</span>
              <span className="text-green-500/60">${range?.idealLow ?? 60}</span>
              <span className="text-green-500/60">${range?.idealHigh ?? 90}</span>
              <span className="text-yellow-500/60">${range?.warningHigh ?? 110}</span>
              <span>${gaugeMax}</span>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full animate-pulse-dot" style={{ background: zoneColor }} />
              <span className="text-xs font-bold" style={{ color: zoneColor }}>{zoneLabel}</span>
              <span className="text-[10px] text-muted-foreground">
                WTI: ${oilData?.current.wti?.toFixed(2) ?? "—"}
              </span>
            </div>
            <span className="text-[9px] text-muted-foreground/50">{range?.note}</span>
          </div>
        </CardContent>
      </Card>

      {/* ==================== OIL PRICE HISTORY ==================== */}
      <Card className="border-card-border">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Brent Crude Since War Started
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-3">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={oilData?.history ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="oilGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,12%,18%)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "hsl(210,10%,55%)" }}
                tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              />
              <YAxis tick={{ fontSize: 9, fill: "hsl(210,10%,55%)" }} domain={[60, 130]} />
              {/* Optimal zone reference area */}
              <ReferenceArea y1={range?.idealLow ?? 60} y2={range?.idealHigh ?? 90} fill="#22c55e" fillOpacity={0.08} />
              <ReferenceLine y={range?.idealLow ?? 60} stroke="#22c55e" strokeDasharray="3 3" strokeWidth={1} />
              <ReferenceLine y={range?.idealHigh ?? 90} stroke="#22c55e" strokeDasharray="3 3" strokeWidth={1} />
              <ReferenceLine y={range?.warningHigh ?? 110} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220,16%,12%)",
                  border: "1px solid hsl(220,12%,18%)",
                  borderRadius: "6px",
                  fontSize: "11px",
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Brent"]}
                labelFormatter={(label) => {
                  const item = oilData?.history.find((h) => h.date === label);
                  return item?.label ?? label;
                }}
              />
              <Area type="monotone" dataKey="price" stroke="#ef4444" strokeWidth={2} fill="url(#oilGradient)" dot={{ fill: "#ef4444", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 text-[9px] text-muted-foreground/60 mt-1">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block" /> Optimal range ($60-$90)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block" /> Crisis threshold ($110+)</span>
          </div>
        </CardContent>
      </Card>

      {/* ==================== STRAIT OF HORMUZ ==================== */}
      <Card className="border-card-border">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Ship className="w-3.5 h-3.5" />
            Strait of Hormuz — Shipping Status
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {/* Status banner */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg mb-3" style={{ background: `${hormuzStatusColor}15`, border: `1px solid ${hormuzStatusColor}30` }}>
            <ShieldAlert className="w-5 h-5" style={{ color: hormuzStatusColor }} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: hormuzStatusColor }}>
                  STRAIT {hormuzData?.status ?? "—"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  since {hormuzData?.statusSince ? new Date(hormuzData.statusSince).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {hormuzData?.globalOilSupplyImpact}
              </p>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <p className="text-lg font-bold tabular-nums text-red-400">{hormuzData?.currentDailyTransits ?? 0}</p>
              <p className="text-[9px] text-muted-foreground">Ships/Day</p>
              <p className="text-[8px] text-muted-foreground/50">Normal: {hormuzData?.normalDailyTransits ?? 60}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <p className="text-lg font-bold tabular-nums text-orange-400">{hormuzData?.strandedVessels ?? 0}+</p>
              <p className="text-[9px] text-muted-foreground">Stranded</p>
              <p className="text-[8px] text-muted-foreground/50">Vessels waiting</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <p className="text-lg font-bold tabular-nums text-yellow-400">{hormuzData?.warRiskInsuranceMultiplier ?? 0}x</p>
              <p className="text-[9px] text-muted-foreground">Insurance</p>
              <p className="text-[8px] text-muted-foreground/50">vs normal rates</p>
            </div>
          </div>

          {/* Daily transits chart */}
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={hormuzData?.transitHistory ?? []} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,12%,18%)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 8, fill: "hsl(210,10%,55%)" }}
                tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              />
              <YAxis tick={{ fontSize: 9, fill: "hsl(210,10%,55%)" }} />
              <ReferenceLine y={60} stroke="#22c55e" strokeDasharray="3 3" label={{ value: "Normal", fontSize: 8, fill: "#22c55e" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220,16%,12%)",
                  border: "1px solid hsl(220,12%,18%)",
                  borderRadius: "6px",
                  fontSize: "11px",
                }}
                formatter={(value: number, _name: string, props: any) => {
                  const item = props.payload;
                  const color = item.status === "open" ? "#22c55e" : item.status === "restricted" ? "#eab308" : "#ef4444";
                  return [`${value} transits (${item.status})`, "Ships"];
                }}
              />
              <Bar
                dataKey="transits"
                radius={[2, 2, 0, 0]}
                fill="#ef4444"
              />
            </BarChart>
          </ResponsiveContainer>

          <p className="text-[9px] text-muted-foreground/50 text-center mt-1">
            Source: {hormuzData?.source ?? "Multiple sources"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
