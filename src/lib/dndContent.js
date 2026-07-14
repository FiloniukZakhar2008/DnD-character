import { base44 } from '@/api/base44Client';

const TXT_PREFIX = 'dnd_txt_';
const IMG_PREFIX = 'dnd_img_';

function lsGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch {
    // ignore
  }
}

export async function translateBatch(texts, cacheKey) {
  const entries = Object.entries(texts).filter(([, v]) => v && String(v).trim());
  if (entries.length === 0) return {};

  const fullKey = TXT_PREFIX + cacheKey;
  const cached = lsGet(fullKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fall through
    }
  }

  try {
    const inputObj = Object.fromEntries(entries);
    const prompt = `Переклади наступні текстові поля Dungeons & Dragons 5e з англійської на українську мову. Збережи ВСЕ markdown-форматування (##, ###, **, *, таблиці з |). Перекладай ігрові терміни природно: "Ability Score Increase" → "Покращення характеристики", "Darkvision" → "Темне зір", "Saving throw" → "Рятівний кидок", "Hit Dice" → "Кістка здоров'я", "Proficiency Bonus" → "Бонус майстерності", "Level" → "Рівень", "Features" → "Здібності", "Damage" → "Шкода", "Armor Class" → "Клас броні", "advantage" → "перевага", "disadvantage" → "недолік", "bonus action" → "бонусну дію", "action" → "дію", "long rest" → "тривалий відпочинок", "short rest" → "короткий відпочинок", "saving throw" → "рятівний кидок". Поверни ТІЛЬКИ JSON-об'єкт з тими ж ключами та перекладеними значеннями, без зайвого тексту.

${JSON.stringify(inputObj, null, 2)}`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: Object.fromEntries(entries.map(([k]) => [k, { type: 'string' }])),
        required: entries.map(([k]) => k),
      },
    });

    const result = {};
    entries.forEach(([k]) => {
      result[k] = res[k] || texts[k];
    });
    lsSet(fullKey, JSON.stringify(result));
    return result;
  } catch (e) {
    return Object.fromEntries(entries);
  }
}

export async function getDndImage(slug, name, type) {
  const fullKey = IMG_PREFIX + slug;
  const cached = lsGet(fullKey);
  if (cached) return cached;

  try {
    const prompt =
      type === 'class'
        ? `Epic fantasy character art of a D&D ${name} adventurer, heroic pose, dramatic cinematic lighting, rich warm colors, digital painting, dark fantasy art style, highly detailed, no text, no watermark`
        : `Fantasy character portrait of a D&D ${name}, dramatic cinematic lighting, digital painting, dark fantasy art style, highly detailed, no text, no watermark`;
    const res = await base44.integrations.Core.GenerateImage({ prompt });
    const url = typeof res === 'string' ? res : res?.url;
    if (url) {
      lsSet(fullKey, url);
      return url;
    }
    return null;
  } catch (e) {
    return null;
  }
}