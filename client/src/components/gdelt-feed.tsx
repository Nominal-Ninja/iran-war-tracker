/**
 * gdelt-feed.tsx
 * Live OSINT intelligence feed powered by the GDELT Project.
 * Pulls real-time English-language articles about the Iran conflict
 * from GDELT's free API (updated every 15 minutes, 100+ languages monitored).
 * No API key required.
 *
 * Author: Austin Wesley
 */
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Globe, Newspaper, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";

interface GdeltArticle {
  url: string;
  title: string;
  seendate: string;
  domain: string;
  language: string;
  sourcecountry: string;
  socialimage?: string;
}

export function GdeltFeed() {
  const { data, isLoading, isFetching } = useQuery<{ articles: GdeltArticle[] }>({
    queryKey: ["/api/gdelt/articles"],
    refetchInterval: 15 * 60 * 1000, // Auto-refresh every 15 minutes
    staleTime: 5 * 60 * 1000,
  });

  const articles = data?.articles ?? [];

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/gdelt/articles"] });
  };

  // Parse GDELT date format: 20260328T141500Z -> Date
  const parseGdeltDate = (dateStr: string): Date => {
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    const hour = dateStr.slice(9, 11);
    const min = dateStr.slice(11, 13);
    return new Date(`${year}-${month}-${day}T${hour}:${min}:00Z`);
  };

  const timeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-3 pt-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2 p-3 border border-border/30 rounded-lg">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-3" data-testid="gdelt-feed">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            GDELT Live Intelligence Feed
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={handleRefresh}
          disabled={isFetching}
          data-testid="button-refresh-gdelt"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Updating..." : "Refresh"}
        </Button>
      </div>

      <div className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
        <Newspaper className="w-3 h-3" />
        Monitoring 100+ languages across global news. Updated every 15 min.
        {articles.length > 0 && ` Showing ${articles.length} articles from last 24h.`}
      </div>

      {/* Article list */}
      <div className="space-y-2">
        {articles.map((article, i) => {
          const date = parseGdeltDate(article.seendate);
          return (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2.5 border border-border/30 rounded-lg hover:border-primary/30 hover:bg-muted/20 transition-colors group"
              data-testid={`gdelt-article-${i}`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {timeAgo(date)}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50">·</span>
                    <span className="text-[10px] text-muted-foreground">{article.domain}</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                      {article.sourcecountry}
                    </Badge>
                    {article.language !== "English" && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 text-blue-400 border-blue-400/30">
                        {article.language}
                      </Badge>
                    )}
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary mt-0.5 flex-shrink-0" />
              </div>
            </a>
          );
        })}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-xs">
          No articles found. GDELT may be temporarily unavailable.
        </div>
      )}

      <div className="text-[9px] text-muted-foreground/40 text-center pt-2">
        Powered by GDELT Project — gdeltproject.org
      </div>
    </div>
  );
}
