import React, { useState, useEffect } from 'react';
import { fetchClasses, fetchRaces } from '@/lib/dndApi';
import { parseClassTable } from '@/lib/dndUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BookOpen, Users } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Reference() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">Довідник</h1>
        <p className="text-muted-foreground">
          Уся інформація про класи та раси D&amp;D 5e SRD — здібності, рівні, бонуси.
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

function ClassesPanel() {
  const [classes, setClasses] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchClasses()
      .then((list) => {
        setClasses(list);
        if (list.length > 0) setSelected(list[0].slug);
      })
      .catch(() => setClasses([]));
  }, []);

  const selectedClass = classes?.find((c) => c.slug === selected);
  const tableData = parseClassTable(selectedClass?.table);

  if (!classes)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );

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
              <p className="font-medium text-foreground text-sm">{c.name}</p>
              <span className="text-xs text-muted-foreground">{c.hit_dice}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-card/40 border border-border/40 rounded-2xl p-5 sm:p-6">
        {selectedClass && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">{selectedClass.name}</h2>
              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                <span className="px-2 py-1 rounded-md bg-accent/60 text-foreground/80">
                  Кістка HP: {selectedClass.hit_dice}
                </span>
                <span className="px-2 py-1 rounded-md bg-accent/60 text-foreground/80">
                  Збереження: {selectedClass.prof_saving_throws}
                </span>
                <span className="px-2 py-1 rounded-md bg-accent/60 text-foreground/80">
                  Броня: {selectedClass.prof_armor}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="bg-background/30 rounded-lg p-3 border border-border/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">HP на 1 рівні</p>
                  <p className="text-sm text-foreground/90">{selectedClass.hp_at_1st_level}</p>
                </div>
                <div className="bg-background/30 rounded-lg p-3 border border-border/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">HP на вищих рівнях</p>
                  <p className="text-sm text-foreground/90">{selectedClass.hp_at_higher_levels}</p>
                </div>
                <div className="bg-background/30 rounded-lg p-3 border border-border/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Зброя</p>
                  <p className="text-sm text-foreground/90">{selectedClass.prof_weapons}</p>
                </div>
                <div className="bg-background/30 rounded-lg p-3 border border-border/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Навички</p>
                  <p className="text-sm text-foreground/90">{selectedClass.prof_skills}</p>
                </div>
                <div className="bg-background/30 rounded-lg p-3 border border-border/30 sm:col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Спорядження</p>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap">{selectedClass.equipment}</p>
                </div>
                <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/20 sm:col-span-2">
                  <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">
                    Покращення характеристик (ASI)
                  </p>
                  <p className="text-sm text-foreground/90">
                    На рівнях 4, 8, 12, 16 та 19 можна збільшити одну характеристику на 2, або дві на 1 (макс. 20).
                    {selectedClass.spellcasting_ability && (
                      <span className="block mt-1 text-foreground/80">
                        ⚡ Магія: ключова характеристика — {selectedClass.spellcasting_ability}.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {tableData.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wider">
                  Таблиця прогресії
                </h3>
                <div className="overflow-x-auto -mx-2 rounded-lg border border-border/30">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/40 bg-background/40">
                        {Object.keys(tableData[0]).map((h) => (
                          <th
                            key={h}
                            className="text-left px-3 py-2 text-muted-foreground font-medium whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, i) => (
                        <tr key={i} className="border-b border-border/20 hover:bg-background/30">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-3 py-2 text-foreground/80 whitespace-nowrap">
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wider">Опис класу</h3>
              <div className="md-content max-h-[400px] overflow-y-auto pr-2">
                <ReactMarkdown>{selectedClass.desc}</ReactMarkdown>
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

  useEffect(() => {
    fetchRaces()
      .then((list) => {
        setRaces(list);
        if (list.length > 0) setSelected(list[0].slug);
      })
      .catch(() => setRaces([]));
  }, []);

  const selectedRace = races?.find((r) => r.slug === selected);

  if (!races)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );

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
            <p className="font-medium text-foreground text-sm">{r.name}</p>
            <p className="text-xs text-muted-foreground">
              {r.size_raw} • {r.speed?.walk} ft
            </p>
          </button>
        ))}
      </div>

      <div className="bg-card/40 border border-border/40 rounded-2xl p-5 sm:p-6">
        {selectedRace && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">{selectedRace.name}</h2>
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
                        {attr} +{a.value}
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
                          {attr} +{a.value} · {s.name}
                        </span>
                      ))
                    )
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <InfoBlock title="Бонуси характеристик" content={selectedRace.asi_desc} />
              <InfoBlock title="Вік" content={selectedRace.age} />
              <InfoBlock title="Світогляд" content={selectedRace.alignment} />
              <InfoBlock title="Розмір" content={selectedRace.size} />
              <InfoBlock title="Швидкість" content={selectedRace.speed_desc} />
              <InfoBlock title="Мови" content={selectedRace.languages} />
              {selectedRace.vision && <InfoBlock title="Зір" content={selectedRace.vision} />}
              <InfoBlock title="Особливості" content={selectedRace.traits} />
            </div>

            {selectedRace.subraces?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wider">Підраси</h3>
                <div className="space-y-3">
                  {selectedRace.subraces.map((s) => (
                    <div key={s.slug} className="bg-background/30 rounded-lg p-3 border border-border/30">
                      <p className="font-medium text-foreground">{s.name}</p>
                      {s.asi_desc && (
                        <p className="text-xs text-emerald-400 mt-1">{cleanMd(s.asi_desc)}</p>
                      )}
                      {s.traits && <p className="text-xs text-muted-foreground mt-1">{cleanMd(s.traits)}</p>}
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

function cleanMd(str) {
  return str?.replace(/\*\*\*/g, '').replace(/\*\*/g, '').replace(/\*/g, '') || '';
}