import React from 'react';
import { getFeaturesUpToLevel, extractLevel } from '@/lib/dndUtils';

export default function FeatureTimeline({ tableData, currentLevel }) {
  if (!tableData || tableData.length === 0) return null;

  const rows = getFeaturesUpToLevel(tableData, currentLevel);

  return (
    <div className="space-y-2">
      {rows.map((row, i) => {
        const level = extractLevel(row['Level']);
        const isCurrent = level === currentLevel;
        const features = (row['Features'] || '')
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean);
        return (
          <div
            key={i}
            className={`flex items-start gap-4 p-3 rounded-lg border transition ${
              isCurrent ? 'border-primary/50 bg-primary/5' : 'border-border/40 bg-card/30'
            }`}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <span className="font-display font-bold text-primary text-sm">{level}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Рівень {level}</span>
                {row['Proficiency Bonus'] && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-accent/60 text-foreground/80">
                    {row['Proficiency Bonus']}
                  </span>
                )}
                {isCurrent && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                    Поточний
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {features.map((f, j) => (
                  <span
                    key={j}
                    className="text-sm text-foreground/90 px-2 py-0.5 rounded-md bg-background/60 border border-border/40"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}