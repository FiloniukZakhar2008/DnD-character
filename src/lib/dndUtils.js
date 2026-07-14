export function parseClassTable(tableMarkdown) {
  if (!tableMarkdown) return [];
  const lines = tableMarkdown.trim().split('\n').filter((l) => l.trim());
  if (lines.length < 3) return [];

  const parseLine = (line) => {
    const cells = line.split('|').map((c) => c.trim());
    if (cells[0] === '') cells.shift();
    if (cells[cells.length - 1] === '') cells.pop();
    return cells;
  };

  const headers = parseLine(lines[0]);
  const dataLines = lines.slice(2);

  return dataLines.map((line) => {
    const cells = parseLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] || '';
    });
    return row;
  });
}

export function extractLevel(levelStr) {
  if (!levelStr) return 0;
  const match = levelStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export function getLevelRow(tableData, level) {
  return tableData.find((r) => extractLevel(r['Level']) === level);
}

export function getFeaturesUpToLevel(tableData, level) {
  return tableData.filter((r) => {
    const lvl = extractLevel(r['Level']);
    return lvl > 0 && lvl <= level;
  });
}

export function getFeaturesAtLevel(tableData, level) {
  const row = getLevelRow(tableData, level);
  if (!row) return [];
  const featuresStr = row['Features'] || '';
  return featuresStr
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);
}

export function abilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

export function proficiencyBonus(level) {
  return Math.floor((level - 1) / 4) + 2;
}

export function parseHitDice(hitDiceStr) {
  if (!hitDiceStr) return null;
  const match = hitDiceStr.match(/(\d+)d(\d+)/);
  if (!match) return null;
  return { count: parseInt(match[1], 10), sides: parseInt(match[2], 10) };
}

export function averageHitDie(sides) {
  return Math.floor(sides / 2) + 1;
}

export function parseHpAtFirstLevel(hpStr) {
  if (!hpStr) return 10;
  const match = hpStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 10;
}

const ASI_MAP = {
  Strength: 'strength',
  Dexterity: 'dexterity',
  Constitution: 'constitution',
  Intelligence: 'intelligence',
  Wisdom: 'wisdom',
  Charisma: 'charisma',
};

export function applyRacialASI(baseScores, raceData, subraceData) {
  const result = { ...baseScores };

  const applyASI = (asiArray) => {
    if (!asiArray) return;
    asiArray.forEach((asi) => {
      if (asi.attributes) {
        asi.attributes.forEach((attr) => {
          const key = ASI_MAP[attr];
          if (key) result[key] = (result[key] || 0) + (asi.value || 0);
        });
      }
    });
  };

  if (raceData?.asi) applyASI(raceData.asi);
  if (subraceData?.asi) applyASI(subraceData.asi);

  return result;
}

export function getRacialBonuses(baseScores, raceData, subraceData) {
  const totals = applyRacialASI(baseScores, raceData, subraceData);
  const bonuses = {};
  Object.keys(baseScores).forEach((key) => {
    bonuses[key] = (totals[key] || 0) - (baseScores[key] || 0);
  });
  return bonuses;
}

export const ABILITY_NAMES = {
  strength: 'Сила',
  dexterity: 'Спритність',
  constitution: 'Витривалість',
  intelligence: 'Інтелект',
  wisdom: 'Мудрість',
  charisma: 'Харизма',
};

export const ABILITY_SHORT = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
};

export const ABILITIES = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
];