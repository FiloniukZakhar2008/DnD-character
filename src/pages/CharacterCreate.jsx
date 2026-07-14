import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchClasses, fetchRaces } from '@/lib/dndApi';
import { Characters } from '@/lib/localCharacters';
import {
  applyRacialASI,
  getRacialBonuses,
  abilityModifier,
  parseHpAtFirstLevel,
  ABILITY_NAMES,
  getClassNameUa,
  getRaceNameUa,
  getAbilityNameUa,
  translateAbilityNames,
} from '@/lib/dndUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AbilityScoreEditor from '@/components/AbilityScoreEditor';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const STEPS = ['Основне', 'Раса', 'Клас', 'Характеристики', 'Фінал'];

export default function CharacterCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [races, setRaces] = useState(null);
  const [classes, setClasses] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    background: '',
    appearance: '',
    race_slug: '',
    subrace_slug: '',
    class_slug: '',
    ability_scores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
  });

  useEffect(() => {
    fetchRaces()
      .then(setRaces)
      .catch(() => setRaces([]));
    fetchClasses()
      .then(setClasses)
      .catch(() => setClasses([]));
  }, []);

  const selectedRace = races?.find((r) => r.slug === form.race_slug);
  const selectedSubrace = selectedRace?.subraces?.find((s) => s.slug === form.subrace_slug);
  const selectedClass = classes?.find((c) => c.slug === form.class_slug);

  const racialBonuses = getRacialBonuses(form.ability_scores, selectedRace, selectedSubrace);
  const totalScores = applyRacialASI(form.ability_scores, selectedRace, selectedSubrace);
  const conMod = abilityModifier(totalScores.constitution);
  const baseHp = selectedClass ? parseHpAtFirstLevel(selectedClass.hp_at_1st_level) + conMod : 10;

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const canProceed = () => {
    if (step === 0) return form.name.trim().length > 0;
    if (step === 1) return !!form.race_slug;
    if (step === 2) return !!form.class_slug;
    return true;
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const created = await Characters.create({
        name: form.name.trim(),
        background: form.background,
        appearance: form.appearance,
        race_slug: form.race_slug,
        race_name: getRaceNameUa(selectedRace.slug, selectedRace.name),
        subrace_slug: form.subrace_slug,
        subrace_name: selectedSubrace?.name || '',
        class_slug: form.class_slug,
        class_name: getClassNameUa(selectedClass.slug, selectedClass.name),
        level: 1,
        ability_scores: form.ability_scores,
        max_hp: baseHp,
        notes: '',
      });
      toast({ title: 'Персонажа створено!', description: `${form.name} починає свою пригоду.` });
      navigate(`/character/${created.id}`);
    } catch (e) {
      toast({ title: 'Помилка', description: 'Не вдалося створити персонажа.', variant: 'destructive' });
    }
    setSaving(false);
  };

  const cleanMd = (str) => str?.replace(/\*\*\*/g, '').replace(/\*\*/g, '').replace(/\*/g, '') || '';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Назад
      </button>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`flex flex-col items-center gap-1.5 ${i <= step ? '' : 'opacity-40'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
                  i === step
                    ? 'border-primary bg-primary/15 text-primary'
                    : i < step
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-[10px] text-muted-foreground hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 rounded ${i < step ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-card/40 border border-border/40 rounded-2xl p-5 sm:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-1">Хто твій герой?</h2>
              <p className="text-muted-foreground text-sm">Дай йому ім'я та опиши походження.</p>
            </div>
            <div>
              <Label className="mb-1.5 block">Ім'я персонажа *</Label>
              <Input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="напр. Торін Молотобієць"
                className="bg-background/50"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Походження (фон)</Label>
              <Input
                value={form.background}
                onChange={(e) => update('background', e.target.value)}
                placeholder="напр. Солдат, Мандрівник"
                className="bg-background/50"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Зовнішність</Label>
              <Textarea
                value={form.appearance}
                onChange={(e) => update('appearance', e.target.value)}
                placeholder="Опиши вигляд свого героя..."
                rows={3}
                className="bg-background/50 resize-none"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-1">Обери расу</h2>
              <p className="text-muted-foreground text-sm">
                Кожна раса дає бонуси до характеристик та особливі здібності.
              </p>
            </div>
            {races === null ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {races.map((r) => (
                  <button
                    key={r.slug}
                    onClick={() => {
                      update('race_slug', r.slug);
                      update('subrace_slug', '');
                    }}
                    className={`text-left p-3 rounded-xl border transition ${
                      form.race_slug === r.slug
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 bg-background/30 hover:border-border'
                    }`}
                  >
                    <p className="font-medium text-foreground">{getRaceNameUa(r.slug, r.name)}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {r.asi?.flatMap((a) =>
                        a.attributes.map((attr) => (
                          <span
                            key={attr}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          >
                            {getAbilityNameUa(attr)} +{a.value}
                          </span>
                        ))
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {selectedRace?.subraces?.length > 0 && (
              <div>
                <Label className="mb-1.5 block">Підраса</Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => update('subrace_slug', '')}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                      !form.subrace_slug
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Без підраси
                  </button>
                  {selectedRace.subraces.map((s) => (
                    <button
                      key={s.slug}
                      onClick={() => update('subrace_slug', s.slug)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                        form.subrace_slug === s.slug
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {selectedRace && (
              <div className="text-xs text-muted-foreground bg-background/30 rounded-lg p-3 border border-border/30">
                <p className="font-medium text-foreground/90 mb-1.5">Бонуси характеристик:</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRace.asi?.flatMap((a) =>
                    a.attributes.map((attr) => (
                      <span
                        key={attr}
                        className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      >
                        {getAbilityNameUa(attr)} +{a.value}
                      </span>
                    ))
                  )}
                  {selectedSubrace?.asi?.flatMap((a) =>
                    a.attributes.map((attr) => (
                      <span
                        key={attr}
                        className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/20"
                      >
                        {getAbilityNameUa(attr)} +{a.value}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-1">Обери клас</h2>
              <p className="text-muted-foreground text-sm">Клас визначає здібності твого героя та шлях прокачки.</p>
            </div>
            {classes === null ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {classes.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => update('class_slug', c.slug)}
                    className={`text-left p-3 rounded-xl border transition ${
                      form.class_slug === c.slug
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 bg-background/30 hover:border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{getClassNameUa(c.slug, c.name)}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-accent/60 text-foreground/70">{c.hit_dice}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Кістка HP: {c.hit_dice}</p>
                  </button>
                ))}
              </div>
            )}
            {selectedClass && (
              <div className="text-xs text-muted-foreground bg-background/30 rounded-lg p-3 border border-border/30">
                <p className="font-medium text-foreground/90 mb-1">
                  {getClassNameUa(selectedClass.slug, selectedClass.name)}
                </p>
                <p>Рятівні кидки: {translateAbilityNames(selectedClass.prof_saving_throws)}</p>
                <p className="mt-1">Броня: {selectedClass.prof_armor}</p>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-1">Характеристики</h2>
              <p className="text-muted-foreground text-sm">
                Розподіли значення між характеристиками. Расові бонуси враховуються автоматично.
              </p>
            </div>
            <AbilityScoreEditor
              scores={form.ability_scores}
              onChange={(scores) => update('ability_scores', scores)}
              racialBonuses={racialBonuses}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-1">Готовий до пригод</h2>
              <p className="text-muted-foreground text-sm">Перевір дані перед створенням.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-background/30 rounded-lg p-3 border border-border/30">
                <p className="text-muted-foreground text-xs">Ім'я</p>
                <p className="text-foreground font-medium">{form.name}</p>
              </div>
              <div className="bg-background/30 rounded-lg p-3 border border-border/30">
                <p className="text-muted-foreground text-xs">Раса</p>
                <p className="text-foreground font-medium">
                  {selectedRace ? getRaceNameUa(selectedRace.slug, selectedRace.name) : ''}{' '}
                  {selectedSubrace ? `(${selectedSubrace.name})` : ''}
                </p>
              </div>
              <div className="bg-background/30 rounded-lg p-3 border border-border/30">
                <p className="text-muted-foreground text-xs">Клас</p>
                <p className="text-foreground font-medium">
                  {selectedClass ? getClassNameUa(selectedClass.slug, selectedClass.name) : ''}
                </p>
              </div>
              <div className="bg-background/30 rounded-lg p-3 border border-border/30">
                <p className="text-muted-foreground text-xs">Здоров'я (HP)</p>
                <p className="text-foreground font-medium">{baseHp}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Object.entries(totalScores).map(([key, val]) => (
                <div key={key} className="bg-background/30 rounded-lg p-2 border border-border/30 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">{ABILITY_NAMES[key]}</p>
                  <p className="font-bold text-foreground">{val}</p>
                  <p className="text-xs text-primary">
                    {abilityModifier(val) >= 0 ? '+' : ''}
                    {abilityModifier(val)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => (step > 0 ? setStep(step - 1) : navigate(-1))}
          className="text-muted-foreground"
        >
          {step === 0 ? 'Скасувати' : 'Назад'}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-semibold"
          >
            Далі
          </Button>
        ) : (
          <Button
            onClick={handleCreate}
            disabled={saving}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-semibold"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
            Створити героя
          </Button>
        )}
      </div>
    </div>
  );
}