import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { fetchClass, fetchRace } from '@/lib/dndApi';
import {
  parseClassTable,
  applyRacialASI,
  abilityModifier,
  proficiencyBonus,
  ABILITY_NAMES,
  ABILITY_SHORT,
} from '@/lib/dndUtils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import FeatureTimeline from '@/components/FeatureTimeline';
import { ChevronLeft, TrendingUp, Heart, Shield, Star, Pencil, Check, X } from 'lucide-react';

export default function CharacterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [classData, setClassData] = useState(null);
  const [raceData, setRaceData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ notes: '', max_hp: 0, appearance: '' });

  useEffect(() => {
    base44.entities.Character
      .get(id)
      .then((c) => {
        setCharacter(c);
        setEditForm({ notes: c.notes || '', max_hp: c.max_hp || 0, appearance: c.appearance || '' });
        if (c.class_slug) fetchClass(c.class_slug).then(setClassData).catch(() => {});
        if (c.race_slug) fetchRace(c.race_slug).then(setRaceData).catch(() => {});
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
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Персонажа не знайдено.</p>
        <Link to="/" className="text-primary hover:underline mt-2 inline-block">
          На головну
        </Link>
      </div>
    );
  }

  const tableData = parseClassTable(classData?.table);
  const subraceData = raceData?.subraces?.find((s) => s.slug === character.subrace_slug);
  const totalScores = applyRacialASI(character.ability_scores || {}, raceData, subraceData);
  const dexMod = abilityModifier(totalScores.dexterity);
  const profBonus = proficiencyBonus(character.level);
  const ac = 10 + dexMod;

  const saveEdit = async () => {
    const updated = await base44.entities.Character.update(character.id, {
      notes: editForm.notes,
      max_hp: parseInt(editForm.max_hp, 10) || 0,
      appearance: editForm.appearance,
    });
    setCharacter(updated);
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Всі персонажі
      </button>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.06),transparent_60%)] pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-md bg-primary/15 text-primary font-medium">
                Рівень {character.level}
              </span>
              {character.background && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-accent/60 text-foreground/70">
                  {character.background}
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">{character.name}</h1>
            <p className="text-muted-foreground mt-1">
              {character.race_name}
              {character.subrace_name ? ` (${character.subrace_name})` : ''} {character.class_name}
            </p>
          </div>
          {character.level < 20 && (
            <Button
              onClick={() => navigate(`/character/${character.id}/level-up`)}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-emerald-950 font-semibold flex-shrink-0"
            >
              <TrendingUp className="w-4 h-4 mr-1.5" /> Підняти рівень
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Heart} label="Здоров'я" value={character.max_hp} color="rose" />
        <StatCard icon={Shield} label="Клас броні" value={ac} color="sky" />
        <StatCard icon={Star} label="Бонус майстерності" value={`+${profBonus}`} color="amber" />
        <StatCard icon={TrendingUp} label="Рівень" value={character.level} color="emerald" />
      </div>

      {/* Ability scores */}
      <div className="bg-card/40 border border-border/40 rounded-2xl p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-foreground mb-4">Характеристики</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {Object.entries(totalScores).map(([key, val]) => {
            const mod = abilityModifier(val);
            return (
              <div key={key} className="text-center bg-background/40 rounded-xl p-3 border border-border/30">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{ABILITY_SHORT[key]}</p>
                <p className="text-2xl font-display font-bold text-foreground mt-1">{val}</p>
                <p className={`text-sm font-medium ${mod >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {mod >= 0 ? `+${mod}` : mod}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{ABILITY_NAMES[key]}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-card/40 border border-border/40 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-foreground">Нотатки та опис</h2>
          {!editing ? (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="text-muted-foreground">
              <Pencil className="w-3.5 h-3.5 mr-1" /> Редагувати
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="text-muted-foreground">
                <X className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={saveEdit} className="text-emerald-400">
                <Check className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
        {!editing ? (
          <div className="space-y-3">
            {character.appearance && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Зовнішність</p>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{character.appearance}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Нотатки</p>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                {character.notes || 'Поки що порожньо...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Зовнішність</p>
              <Textarea
                value={editForm.appearance}
                onChange={(e) => setEditForm({ ...editForm, appearance: e.target.value })}
                rows={2}
                className="bg-background/50 resize-none"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Нотатки</p>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={4}
                className="bg-background/50 resize-none"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Максимальне HP</p>
              <Input
                type="number"
                value={editForm.max_hp}
                onChange={(e) => setEditForm({ ...editForm, max_hp: e.target.value })}
                className="bg-background/50 w-32"
              />
            </div>
          </div>
        )}
      </div>

      {/* Feature timeline */}
      {classData && (
        <div className="bg-card/40 border border-border/40 rounded-2xl p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-foreground mb-1">Здібності класу</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Усе, що {character.name} отримав на рівнях 1–{character.level}.
          </p>
          {tableData.length > 0 ? (
            <FeatureTimeline tableData={tableData} currentLevel={character.level} />
          ) : (
            <p className="text-sm text-muted-foreground">Не вдалося завантажити таблицю прогресії.</p>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    rose: 'text-rose-400 bg-rose-500/10',
    sky: 'text-sky-400 bg-sky-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
  };
  return (
    <div className="bg-card/40 border border-border/40 rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-display font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}