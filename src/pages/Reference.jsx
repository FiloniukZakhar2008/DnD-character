import React, { useState, useEffect } from 'react';
import { fetchClasses, fetchRaces } from '@/lib/dndApi';
import { getClassNameUa, getRaceNameUa, getAbilityNameUa, translateAbilityNames } from '@/lib/dndUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BookOpen, Users, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Reference() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">Довідник</h1>
        <p className="text-muted-foreground">
          Уся інформація про класи та раси D&amp;D 5e — здібності, рівні, бонуси. Дані завантажуються з відкритого
          Open5e API; докладні описи там англійською мовою.
        </p>
      </div>

      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="bg-card/40 border border-border/40">
          <TabsTrigger
            value="classes"
            className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
          >
            <BookOpen className="w-4 h-4 mr-1.5" /> Класи
          </TabsTrigger>
          <TabsTrigger
            value="races"
            className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
          >
            <Users className="w-4 h-4 mr-1.5" /> Раси
          </TabsTrigger>
        </TabsList>
        <TabsContent value="classes">
          <ClassesPanel />
        </TabsContent>
        <TabsContent value="races">
          <RacesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DndImage({ src, loading, name }) {
  if (loading) {
    return (
      <div className="w-full h-44 sm:h-52 rounded-xl bg-gradient-to-br from-card to-primary/10 border border-border/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs">Генерування зображення...</span>
        </div>
      </div>
    );
  }
  if (!src) {
    return (
      <div className="w-full h-44 sm:h-52 rounded-xl bg-gradient-to-br from-card to-primary/10 border border-border/30 flex items-center justify-center">
        <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
      </div>
    );
  }
  return (
    <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden border border-border/30">
      <img src={src} alt={name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />
    </div>
  );
}

function InfoCard({ title, text, full }) {
  return (
    <div className={`bg-background/30 rounded-lg p-3 border border-border/30 ${full ? 'sm:col-span-2' : ''}`}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
      <p className="text-sm text-foreground/90 whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function LoadingText() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
      <Loader2 className="w-4 h-4 animate-spin" /> Переклад...
    </div>
  );
}

function ClassesPanel() {
  const [classes, setClasses] = useState(null);
  const [selected, setSelected] = useState(null);
  const [translation, setTranslation] = useState(null);
  const [img, setImg] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    fetchClasses()
      .then((list) => {
        setClasses(list);
        if (list[0]) setSelected(list[0].slug);
      })
      .catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    // Дані класу приходять з англомовного Open5e API "як є" — без AI-перекладу й
    // без генерації зображень (ці функції прибрано разом з Base44).
    setTranslation(null);
    setImg(null);
    setImgLoading(false);
    setContentLoading(false);
  }, [selected, classes]);

  const selectedClass = classes?.find((c) => c.slug === selected);
  if (!classes)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );

  const uaName = selectedClass ? getClassNameUa(selectedClass.slug, selectedClass.name) : '';
  const t = translation || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
        {classes.map((c) => (
          <button
            key={c.slug}
            onClick={() => setSelected(c.slug)}
            className={`w-full text-left p-3 rounded-xl border transition ${
              selected === c.slug
                ? 'border-primary bg-primary/10'
                : 'border-border/40 bg-card/30 hover:border-border/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground text-sm">{getClassNameUa(c.slug, c.name)}</p>
              <span className="text-xs text-muted-foreground">{c.hit_dice}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-card/40 border border-border/40 rounded-2xl p-5 sm:p-6">
        {selectedClass && (
          <div className="space-y-5">
            <DndImage src={img} loading={imgLoading} name={uaName} />
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">{uaName}</h2>
              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                <span className="px-2 py-1 rounded-md bg-accent/60 text-foreground/80">
                  Кістка HP: {selectedClass.hit_dice}
                </span>
                <span className="px-2 py-1 rounded-md bg-accent/60 text-foreground/80">
                  Рятівні кидки: {translateAbilityNames(t.saves || selectedClass.prof_saving_throws)}
                </span>
                <span className="px-2 py-1 rounded-md bg-accent/60 text-foreground/80">
                  Броня: {t.armor || selectedClass.prof_armor}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <InfoCard title="HP на 1 рівні" text={t.hp1 || selectedClass.hp_at_1st_level} />
                <InfoCard title="HP на вищих рівнях" text={t.hpHigh || selectedClass.hp_at_higher_levels} />
                <InfoCard title="Зброя" text={t.weapons || selectedClass.prof_weapons} />
                <InfoCard title="Навички" text={t.skills || selectedClass.prof_skills} />
                <InfoCard title="Спорядження" text={t.equip || selectedClass.equipment} full />
                <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/20 sm:col-span-2">
                  <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">
                    Покращення характеристик (ASI)
                  </p>
                  <p className="text-sm text-foreground/90">
                    На рівнях 4, 8, 12, 16 та 19 можна збільшити одну характеристику на 2, або дві на 1 (макс. 20).
                    {selectedClass.spellcasting_ability && (
                      <span className="block mt-1 text-foreground/80">
                        ⚡ Магія: ключова характеристика — {translateAbilityNames(selectedClass.spellcasting_ability)}.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wider">
                Таблиця прогресії
              </h3>
              <div className="md-content overflow-x-auto max-h-[400px] overflow-y-auto pr-2 rounded-lg border border-border/30 p-2 bg-background/20">
                {contentLoading && !t.table ? (
                  <LoadingText />
                ) : (
                  <ReactMarkdown>{t.table || selectedClass.table}</ReactMarkdown>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wider">Опис класу</h3>
              <div className="md-content max-h-[400px] overflow-y-auto pr-2">
                {contentLoading && !t.desc ? (
                  <LoadingText />
                ) : (
                  <ReactMarkdown>{t.desc || selectedClass.desc}</ReactMarkdown>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RacesPanel() {
  const [races, setRaces] = useState(null);
  const [selected, setSelected] = useState(null);
  const [translation, setTranslation] = useState(null);
  const [img, setImg] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    fetchRaces()
      .then((list) => {
        setRaces(list);
        if (list[0]) setSelected(list[0].slug);
      })
      .catch(() => setRaces([]));
  }, []);

  useEffect(() => {
    // Дані раси приходять з англомовного Open5e API "як є" — без AI-перекладу й
    // без генерації зображень (ці функції прибрано разом з Base44).
    setTranslation(null);
    setImg(null);
    setImgLoading(false);
    setContentLoading(false);
  }, [selected, races]);

  const selectedRace = races?.find((r) => r.slug === selected);
  if (!races)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );

  const uaName = selectedRace ? getRaceNameUa(selectedRace.slug, selectedRace.name) : '';
  const t = translation || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
        {races.map((r) => (
          <button
            key={r.slug}
            onClick={() => setSelected(r.slug)}
            className={`w-full text-left p-3 rounded-xl border transition ${
              selected === r.slug
                ? 'border-primary bg-primary/10'
                : 'border-border/40 bg-card/30 hover:border-border/70'
            }`}
          >
            <p className="font-medium text-foreground text-sm">{getRaceNameUa(r.slug, r.name)}</p>
            <p className="text-xs text-muted-foreground">
              {r.size_raw} • {r.speed?.walk} ft
            </p>
          </button>
        ))}
      </div>

      <div className="bg-card/40 border border-border/40 rounded-2xl p-5 sm:p-6">
        {selectedRace && (
          <div className="space-y-5">
            <DndImage src={img} loading={imgLoading} name={uaName} />
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">{uaName}</h2>
              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                <span className="px-2 py-1 rounded-md bg-accent/60 text-foreground/80">
                  Розмір: {selectedRace.size_raw}
                </span>
                <span className="px-2 py-1 rounded-md bg-accent/60 text-foreground/80">
                  Швидкість: {selectedRace.speed?.walk} ft
                </span>
              </div>
              {selectedRace.asi && selectedRace.asi.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedRace.asi.flatMap((a) =>
                    a.attributes.map((attr) => (
                      <span
                        key={attr}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-medium border border-emerald-500/20"
                      >
                        {getAbilityNameUa(attr)} +{a.value}
                      </span>
                    ))
                  )}
                  {selectedRace.subraces?.flatMap((s) =>
                    (s.asi || []).flatMap((a) =>
                      a.attributes.map((attr) => (
                        <span
                          key={s.slug + attr}
                          className="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-400 text-xs font-medium border border-sky-500/20"
                        >
                          {getAbilityNameUa(attr)} +{a.value} · {s.name}
                        </span>
                      ))
                    )
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {contentLoading && !translation ? (
                <LoadingText />
              ) : (
                <>
                  <InfoBlock title="Опис" content={t.desc || selectedRace.desc} />
                  <InfoBlock title="Бонуси характеристик" content={t.asi_desc || selectedRace.asi_desc} />
                  <InfoBlock title="Вік" content={t.age || selectedRace.age} />
                  <InfoBlock title="Світогляд" content={t.alignment || selectedRace.alignment} />
                  <InfoBlock title="Розмір" content={t.size || selectedRace.size} />
                  <InfoBlock title="Швидкість" content={t.speed_desc || selectedRace.speed_desc} />
                  <InfoBlock title="Мови" content={t.languages || selectedRace.languages} />
                  {selectedRace.vision && <InfoBlock title="Зір" content={t.vision || selectedRace.vision} />}
                  <InfoBlock title="Особливості" content={t.traits || selectedRace.traits} />
                </>
              )}
            </div>

            {selectedRace.subraces?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wider">Підраси</h3>
                <div className="space-y-3">
                  {selectedRace.subraces.map((s) => (
                    <div key={s.slug} className="bg-background/30 rounded-lg p-3 border border-border/30">
                      <p className="font-medium text-foreground">{s.name}</p>
                      {s.asi_desc && (
                        <div className="md-content text-xs text-emerald-400 mt-1">
                          <ReactMarkdown>{t[`sub_${s.slug}_asi`] || s.asi_desc}</ReactMarkdown>
                        </div>
                      )}
                      {s.traits && (
                        <div className="md-content text-xs text-muted-foreground mt-1">
                          <ReactMarkdown>{t[`sub_${s.slug}_traits`] || s.traits}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBlock({ title, content }) {
  if (!content) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
      <div className="md-content text-sm text-foreground/80">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}