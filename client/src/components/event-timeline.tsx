import type { Event } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

const SEVERITY_CLASSES: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  major: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  moderate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  minor: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const CATEGORY_COLORS: Record<string, string> = {
  airstrike: "bg-blue-500/20 text-blue-400",
  missile: "bg-red-500/20 text-red-400",
  drone: "bg-purple-500/20 text-purple-400",
  ground: "bg-amber-500/20 text-amber-400",
  naval: "bg-cyan-500/20 text-cyan-400",
  diplomatic: "bg-emerald-500/20 text-emerald-400",
  humanitarian: "bg-rose-500/20 text-rose-400",
  cyber: "bg-violet-500/20 text-violet-400",
};

const ACTOR_COLORS: Record<string, string> = {
  US: "bg-blue-900/40 text-blue-300",
  Israel: "bg-sky-900/40 text-sky-300",
  Iran: "bg-red-900/40 text-red-300",
  Coalition: "bg-indigo-900/40 text-indigo-300",
  Hezbollah: "bg-green-900/40 text-green-300",
};

interface TimelineProps {
  events: Event[];
  loading: boolean;
}

export function EventTimeline({ events, loading }: TimelineProps) {
  if (loading) {
    return (
      <div className="space-y-3 pt-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-1 h-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Group events by date
  const grouped: Record<string, Event[]> = {};
  events.forEach((e) => {
    const day = new Date(e.date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(e);
  });

  return (
    <div className="pt-3 space-y-4" data-testid="event-timeline">
      {Object.entries(grouped).map(([day, dayEvents]) => (
        <div key={day}>
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-1 mb-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">{day}</span>
            <span className="text-xs text-muted-foreground ml-2">({dayEvents.length})</span>
          </div>
          <div className="space-y-2">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="group relative pl-4 border-l-2 border-border hover:border-primary/50 transition-colors"
                data-testid={`event-item-${event.id}`}
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-[-5px] top-2 w-2 h-2 rounded-full"
                  style={{
                    background:
                      event.severity === "critical"
                        ? "#ef4444"
                        : event.severity === "major"
                        ? "#f97316"
                        : "#6b7280",
                  }}
                />

                <div className="pb-3">
                  <div className="flex items-start gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground leading-tight flex-1">
                      {event.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {new Date(event.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZoneName: "short",
                      })}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 h-4 border ${SEVERITY_CLASSES[event.severity] ?? ""}`}
                    >
                      {event.severity}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 h-4 ${CATEGORY_COLORS[event.category] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {event.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 h-4 ${ACTOR_COLORS[event.actor] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {event.actor}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-1">
                    {event.description.length > 180
                      ? event.description.slice(0, 180) + "..."
                      : event.description}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
                    <span>{event.location}</span>
                    <span>·</span>
                    <span>{event.source}</span>
                    {event.sourceUrl && (
                      <a
                        href={event.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-primary hover:underline"
                        data-testid={`link-source-${event.id}`}
                      >
                        <ExternalLink className="w-2.5 h-2.5" /> Link
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {events.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No events match current filters.
        </div>
      )}
    </div>
  );
}
