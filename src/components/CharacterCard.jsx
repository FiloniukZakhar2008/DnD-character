import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

export default function CharacterCard({ character }) {
  return (
    <Link to={`/character/${character.id}`}>
      <Card className="group p-5 bg-card/60 border-border/60 hover:border-primary/50 hover:bg-card transition-all duration-300 cursor-pointer relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground leading-tight">{character.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Рівень {character.level}</p>
          </div>
          <span className="text-2xl font-display font-bold text-primary/80">{character.level}</span>
        </div>
        <div className="space-y-1.5 text-sm">
          <p className="text-foreground/90">
            <span className="text-muted-foreground">Клас:</span> {character.class_name}
          </p>
          <p className="text-foreground/90">
            <span className="text-muted-foreground">Раса:</span> {character.race_name}
            {character.subrace_name ? ` (${character.subrace_name})` : ''}
          </p>
          <p className="text-foreground/90">
            <span className="text-muted-foreground">HP:</span> {character.max_hp}
          </p>
        </div>
        <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition">
          Переглянути <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </Card>
    </Link>
  );
}