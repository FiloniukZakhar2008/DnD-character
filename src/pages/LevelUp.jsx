import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchClass } from '@/lib/dndApi';
import { Characters } from '@/lib/localCharacters';
import {
  parseClassTable,
  getLevelRow,
  abilityModifier,
  averageHitDie,
  parseHitDice,
} from '@/lib/dndUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, TrendingUp, Sparkles, Loader2, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function LevelUp() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [character, setCharacter] = useState(null);
  const [classData, setClassData] = useState(null);
  const [newHp, setNewHp] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Characters.get(id)
      .then((c) => {
        setCharacter(c);
        if (c.class_slug) fetchClass(c.class_slug).then(setClassData).catch(() => {});
      })
      .catch(() => setCharacter(false));
  }, [id]);

  if (character === null) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (character === false) {
    return <div className="text-center py-20 text-muted-foreground">Персонажа не знайдено.</div>;
  }

  const currentLevel = character.level;
  const nextLevel = currentLevel + 1;

  if (currentLevel >= 20) {
    return (
      <div className="text-center py-20">
        <Sparkles className="w-12 h-12 text-primary mx-auto mb-3" />
        <h2 className="font-display text-2xl font-bold text-foreground">Максимальний рівень!</h2>
        <p className="text-muted-foreground mt-1">
          {character.name} досяг 20 рівня — вершини можливого.
        </p>
        <Button onClick={() => navigate(`/character/${id}`)} className="mt-4">
          Повернутись
        </Button>
      </div>
    );
  }

  const tableData = parseClassTable(classData?.table);
  const currentRow = getLevelRow(tableData, currentLevel);
  const nextRow = getLevelRow(tableData, nextLevel);

  const nextFeatures = (nextRow?.['Features'] || '')
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);
  const currentFeatures = (currentRow?.['Features'] || '')
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);
  const newFeatures = nextFeatures.filter((f) => !currentFeatures.includes(f));

  const hd = parseHitDice(classData?.hit_dice);
  const avgHp = hd ? averageHitDie(hd.sides) : 0;
  const conMod = abilityModifier(character.ability_scores?.constitution || 10);
  const suggestedHp = character.max_hp + avgHp + conMod;
  const displayHp = newHp === '' ? suggestedHp : parseInt(newHp, 10) || suggestedHp;

  const handleLevelUp = async () => {
    setSaving(true);
    try {
      await Characters.update(character.id, {
        level: nextLevel,
        max_hp: displayHp,
      });
      toast({
        title: `Рівень ${nextLevel}! 🎉`,
        description: `${character.name} став сильнішим.`,
      });
      navigate(`/character/${id}`);
    } catch (e) {
      toast({ title: 'Помилка', description: 'Не вдалося підняти рівень.', variant: 'destructive' });
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(`/character/${id}`)}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Назад до персонажа
      </button>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-card via-card to-emerald-500/5 p-6 sm:p-8 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06),transparent_60%)] pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-sm font-medium mb-3">
            <TrendingUp className="w-4 h-4" /> Підвищення рівня
          </div>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase">Зараз</p>
              <p className="text-4xl font-display font-bold text-foreground">{currentLevel}</p>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div className="text-center">
              <p className="text-xs text-emerald-400 uppercase">Стане</p>
              <p className="text-4xl font-display font-bold text-emerald-400">{nextLevel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* What's new */}
      <div className="bg-card/40 border border-border/40 rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-foreground">Що нового на рівні {nextLevel}</h2>

        {classData ? (
          <>
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Нові здібності</p>
              {newFeatures.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {newFeatures.map((f, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-sm font-medium border border-emerald-500/20"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Нових окремих здібностей немає, але інші показники можуть змінитись.
                </p>
              )}
            </div>

            {[4, 8, 12, 16, 19].includes(nextLevel) && (
              <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                <p className="text-sm text-amber-400 font-medium mb-0.5">⚡ Покращення характеристик!</p>
                <p className="text-sm text-foreground/80">
                  На цьому рівні можна збільшити одну характеристику на 2, або дві на 1 (макс. 20).
                </p>
              </div>
            )}

            {nextRow && (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(nextRow).map(([key, val]) => {
                  if (key === 'Level') return null;
                  const oldVal = currentRow?.[key];
                  const changed = oldVal !== val;
                  return (
                    <div
                      key={key}
                      className={`rounded-lg p-3 border ${
                        changed
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-border/30 bg-background/30'
                      }`}
                    >
                      <p className="text-xs text-muted-foreground">{key}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm text-muted-foreground line-through opacity-50">{oldVal || '—'}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className={`text-sm font-medium ${changed ? 'text-emerald-400' : 'text-foreground'}`}>
                          {val || '—'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* HP update */}
      <div className="bg-card/40 border border-border/40 rounded-2xl p-5 sm:p-6 space-y-3">
        <h2 className="font-display text-lg font-bold text-foreground">Оновлення здоров'я</h2>
        <p className="text-sm text-muted-foreground">
          Кістка HP класу: <span className="text-foreground/90 font-medium">{classData?.hit_dice}</span>. Середнє +
          модифікатор Витривалості ({conMod >= 0 ? '+' : ''}
          {conMod}) = <span className="text-emerald-400 font-medium">+{avgHp + conMod}</span> HP.
        </p>
        <div className="bg-background/30 rounded-lg p-3 border border-border/30 space-y-2 text-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Правила кидків HP</p>
          <p className="text-foreground/80">
            <span className="text-foreground font-medium">🎲 Кидок:</span> кинь {classData?.hit_dice} + мод.
            Витривалості ({conMod >= 0 ? '+' : ''}
            {conMod}) і додай результат до поточного HP.
          </p>
          <p className="text-foreground/80">
            <span className="text-foreground font-medium">📊 Середнє (фіксоване):</span> {avgHp} (середнє{' '}
            {classData?.hit_dice}) + {conMod >= 0 ? '+' : ''}
            {conMod} = <span className="text-emerald-400 font-medium">+{avgHp + conMod}</span> HP.
          </p>
          <p className="text-xs text-muted-foreground italic">{classData?.hp_at_higher_levels}</p>
        </div>
        <div>
          <Label className="mb-1.5 block">Нове максимальне HP</Label>
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              type="number"
              value={newHp}
              onChange={(e) => setNewHp(e.target.value)}
              placeholder={String(suggestedHp)}
              className="bg-background/50 w-32"
            />
            <Button variant="outline" size="sm" onClick={() => setNewHp('')} className="border-border/60">
              <Check className="w-3.5 h-3.5 mr-1" /> Середнє ({suggestedHp})
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Поточне: {character.max_hp} → Нове: {displayHp}
          </p>
        </div>
      </div>

      {/* Confirm */}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => navigate(`/character/${id}`)} className="text-muted-foreground">
          Скасувати
        </Button>
        <Button
          onClick={handleLevelUp}
          disabled={saving}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-emerald-950 font-semibold"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-1.5" />
          )}
          Підтвердити рівень {nextLevel}
        </Button>
      </div>
    </div>
  );
}