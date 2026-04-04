/**
 * dashboard.tsx
 * Main dashboard layout for the Iran War Tracker COP.
 * Renders KPI strip, filter bar, interactive map, and tabbed panels
 * (timeline, casualties, infrastructure damage, GDELT intel feed, economic impact).
 *
 * Author: Austin Wesley
 */
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import type { Event, Casualty } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skull, Crosshair, Building2, Globe, Activity, AlertTriangle, Shield, Clock, Newspaper, Fuel } from "lucide-react";
import { ConflictMap } from "@/components/conflict-map";
import { EventTimeline } from "@/components/event-timeline";
import { CasualtyChart } from "@/components/casualty-chart";
import { InfrastructurePanel } from "@/components/infrastructure-panel";
import { GdeltFeed } from "@/components/gdelt-feed";
import { EconomicImpact } from "@/components/economic-impact";

export default function Dashboard() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [actorFilter, setActorFilter] = useState<string>("all");

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalEvents: number;
    totalKilled: number;
    totalWounded: number;
    countriesAffected: number;
    lastUpdated: string;
  }>({
    queryKey: ["/api/stats"],
  });

  const { data: allEvents, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: casualtySummary } = useQuery<{
    side: string;
    totalKilled: number;
    totalWounded: number;
    militaryKilled: number;
    civilianKilled: number;
  }[]>({
    queryKey: ["/api/casualties/summary"],
  });

  // Apply filters locally for instant response
  const filteredEvents = (allEvents ?? []).filter((e) => {
    if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
    if (countryFilter !== "all" && e.country !== countryFilter) return false;
    if (actorFilter !== "all" && e.actor !== actorFilter) return false;
    return true;
  });

  const mapEvents = filteredEvents.filter((e) => e.lat && e.lng);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card" data-testid="header">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 32 32" width="28" height="28" aria-label="Iran War Tracker Logo">
              <circle cx="16" cy="16" r="14" fill="none" stroke="hsl(38, 92%, 50%)" strokeWidth="2" />
              <path d="M16 6 L16 26 M6 16 L26 16" stroke="hsl(38, 92%, 50%)" strokeWidth="1.5" opacity="0.4" />
              <circle cx="16" cy="16" r="3" fill="hsl(38, 92%, 50%)" />
              <circle cx="16" cy="16" r="7" fill="none" stroke="hsl(38, 92%, 50%)" strokeWidth="1" strokeDasharray="2 3" />
            </svg>
            <div>
              <h1 className="text-sm font-bold tracking-wide uppercase text-foreground" data-testid="text-app-title">
                Iran War Tracker
              </h1>
              <p className="text-xs text-muted-foreground">Operation Epic Fury — Feb 28, 2026 – Present</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 ml-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot" />
            <span className="text-xs font-medium text-red-400 uppercase tracking-wider">Conflict Active</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>Data as of {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "..."}</span>
        </div>
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3 border-b border-border bg-card/50" data-testid="kpi-strip">
        <KpiCard
          icon={<Crosshair className="w-4 h-4 text-primary" />}
          label="Total Strikes"
          value={statsLoading ? "..." : (stats?.totalEvents ?? 0).toLocaleString()}
          testId="kpi-strikes"
        />
        <KpiCard
          icon={<Skull className="w-4 h-4 text-destructive" />}
          label="Confirmed Killed"
          value={statsLoading ? "..." : (stats?.totalKilled ?? 0).toLocaleString()}
          testId="kpi-killed"
        />
        <KpiCard
          icon={<AlertTriangle className="w-4 h-4 text-orange-500" />}
          label="Wounded"
          value={statsLoading ? "..." : (stats?.totalWounded ?? 0).toLocaleString()}
          testId="kpi-wounded"
        />
        <KpiCard
          icon={<Globe className="w-4 h-4 text-blue-500" />}
          label="Countries Affected"
          value={statsLoading ? "..." : String(stats?.countriesAffected ?? 0)}
          testId="kpi-countries"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card/30" data-testid="filters">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filters:</span>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36 h-8 text-xs" data-testid="select-category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="airstrike">Airstrike</SelectItem>
            <SelectItem value="missile">Missile</SelectItem>
            <SelectItem value="drone">Drone</SelectItem>
            <SelectItem value="ground">Ground</SelectItem>
            <SelectItem value="naval">Naval</SelectItem>
            <SelectItem value="diplomatic">Diplomatic</SelectItem>
            <SelectItem value="humanitarian">Humanitarian</SelectItem>
            <SelectItem value="cyber">Cyber</SelectItem>
          </SelectContent>
        </Select>
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-36 h-8 text-xs" data-testid="select-country">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            <SelectItem value="Iran">Iran</SelectItem>
            <SelectItem value="Israel">Israel</SelectItem>
            <SelectItem value="Lebanon">Lebanon</SelectItem>
            <SelectItem value="Iraq">Iraq</SelectItem>
            <SelectItem value="Kuwait">Kuwait</SelectItem>
            <SelectItem value="Bahrain">Bahrain</SelectItem>
            <SelectItem value="Oman">Oman</SelectItem>
            <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
            <SelectItem value="UAE">UAE</SelectItem>
            <SelectItem value="Qatar">Qatar</SelectItem>
            <SelectItem value="Yemen">Yemen</SelectItem>
            <SelectItem value="US">United States</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actorFilter} onValueChange={setActorFilter}>
          <SelectTrigger className="w-36 h-8 text-xs" data-testid="select-actor">
            <SelectValue placeholder="Actor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actors</SelectItem>
            <SelectItem value="US">United States</SelectItem>
            <SelectItem value="Israel">Israel</SelectItem>
            <SelectItem value="Iran">Iran</SelectItem>
            <SelectItem value="Coalition">Coalition</SelectItem>
            <SelectItem value="Hezbollah">Hezbollah</SelectItem>
            <SelectItem value="Houthi">Houthi</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="text-xs ml-auto tabular-nums" data-testid="badge-event-count">
          {filteredEvents.length} events
        </Badge>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map — left 60% */}
        <div className="w-[60%] relative" data-testid="map-panel">
          <ConflictMap events={mapEvents} />
        </div>

        {/* Right panel — 40% with 5 tabs */}
        <div className="w-[40%] border-l border-border flex flex-col overflow-hidden" data-testid="right-panel">
          <Tabs defaultValue="timeline" className="flex flex-col flex-1 overflow-hidden">
            <TabsList className="mx-3 mt-2 grid grid-cols-5 h-8">
              <TabsTrigger value="timeline" className="text-xs" data-testid="tab-timeline">
                <Activity className="w-3.5 h-3.5 mr-1" /> Timeline
              </TabsTrigger>
              <TabsTrigger value="casualties" className="text-xs" data-testid="tab-casualties">
                <Skull className="w-3.5 h-3.5 mr-1" /> Casualties
              </TabsTrigger>
              <TabsTrigger value="infrastructure" className="text-xs" data-testid="tab-infrastructure">
                <Building2 className="w-3.5 h-3.5 mr-1" /> Damage
              </TabsTrigger>
              <TabsTrigger value="intel" className="text-xs" data-testid="tab-intel">
                <Newspaper className="w-3.5 h-3.5 mr-1" /> Intel
              </TabsTrigger>
              <TabsTrigger value="economic" className="text-xs" data-testid="tab-economic">
                <Fuel className="w-3.5 h-3.5 mr-1" /> Oil
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="flex-1 overflow-y-auto m-0 px-3 pb-3">
              <EventTimeline events={filteredEvents} loading={eventsLoading} />
            </TabsContent>

            <TabsContent value="casualties" className="flex-1 overflow-y-auto m-0 px-3 pb-3">
              <CasualtyChart summary={casualtySummary ?? []} />
            </TabsContent>

            <TabsContent value="infrastructure" className="flex-1 overflow-y-auto m-0 px-3 pb-3">
              <InfrastructurePanel />
            </TabsContent>

            <TabsContent value="intel" className="flex-1 overflow-y-auto m-0 px-3 pb-3">
              <GdeltFeed />
            </TabsContent>

            <TabsContent value="economic" className="flex-1 overflow-y-auto m-0 px-3 pb-3">
              <EconomicImpact />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 py-1.5 border-t border-border bg-card text-xs text-muted-foreground flex items-center justify-between">
        <span>Data: CENTCOM, HRANA, Al Jazeera, Reuters, IDF, GDELT, EIA. For informational purposes only.</span>
        <span>Built by Austin Wesley</span>
      </footer>
    </div>
  );
}

function KpiCard({ icon, label, value, testId }: { icon: React.ReactNode; label: string; value: string; testId: string }) {
  return (
    <Card className="border-card-border" data-testid={testId}>
      <CardContent className="p-3 flex items-center gap-3">
        <div className="p-2 rounded-md bg-muted/50">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
