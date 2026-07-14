import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ABILITY_NAMES, ABILITY_SHORT, ABILITIES, abilityModifier } from '@/lib/dndUtils';
import { cn } from '@/lib/utils';

const STD_ARRAY = { strength: 15, dexterity: 14, constitution: 13, intelligence: 12, wisdom: 10, charisma: 8 };

export default function AbilityScoreEditor({ scores, onChange, racialBonuses = {} }) {
  const setScore = (key, value) => {
    const v = Math.max(1, Math.min(30, parseInt(value, 10) || 0));
    onChange({ ...scores, [key]: v });
  };

  const useStandardArray = () => {
    onChange({ ...STD_ARRAY });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Базові значення (расові бонуси додаються автоматично)</p>
        <button
          onClick={useStandardArray}
          className="text-xs px-3 py-1.5 rounded-md bg-primary/15 text-primary hover:bg-primary/25 transition font-medium"
        >
          Стандартний масив
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ABILITIES.map((key) => {
          const bonus = racialBonuses[key] || 0;
          const total = (scores[key] || 10) + bonus;
          const mod = abilityModifier(total);
          return (
            <div key={key} className="bg-card border border-border rounded-xl p-3 text-center">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {ABILITY_SHORT[key]}
              </Label>
              <p className="text-xs text-foreground/80 mb-2">{ABILITY_NAMES[key]}</p>
              <Input
                type="number"
                value={scores[key] ?? 10}
                onChange={(e) => setScore(key, e.target.value)}
                className="text-center text-xl font-bold h-12 bg-background/50 border-border/60"
              />
              {bonus > 0 && <p className="text-[10px] text-emerald-400 mt-1">+{bonus} раса</p>}
              <div className="mt-2 pt-2 border-t border-border/40">
                <p className="text-[10px] text-muted-foreground">Разом: {total}</p>
                <p className={cn('text-sm font-bold', mod >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                  {mod >= 0 ? `+${mod}` : mod}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}