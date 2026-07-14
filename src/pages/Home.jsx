import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Characters } from '@/lib/localCharacters';
import { Plus, Swords, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CharacterCard from '@/components/CharacterCard';

export default function Home() {
  const [characters, setCharacters] = useState(null);

  useEffect(() => {
    Characters.list()
      .then(setCharacters)
      .catch(() => setCharacters([]));
  }, []);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />
        <div className="relative">
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-2">Майстерня героя</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">Твої персонажі</h1>
          <p className="text-muted-foreground max-w-lg">
            Створюй героїв для Dungeons &amp; Dragons, вибирай расу та клас, відстежуй здібності та прокачуй рівні.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/create">
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-semibold">
                <Plus className="w-4 h-4 mr-1.5" /> Створити персонажа
              </Button>
            </Link>
            <Link to="/reference">
              <Button variant="outline" className="border-border/60">
                <BookOpen className="w-4 h-4 mr-1.5" /> Довідник
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {characters === null ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : characters.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Swords className="w-8 h-8 text-primary/60" />
          </div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-1">Поки що порожньо</h3>
          <p className="text-muted-foreground mb-6">Створи свого першого героя, щоб почати пригоду.</p>
          <Link to="/create">
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-semibold">
              <Plus className="w-4 h-4 mr-1.5" /> Створити персонажа
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((c) => (
            <CharacterCard key={c.id} character={c} />
          ))}
        </div>
      )}
    </div>
  );
}