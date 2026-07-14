const API_BASE = 'https://api.open5e.com/v1';

export async function fetchClasses() {
  const res = await fetch(`${API_BASE}/classes/?document__slug=srd&limit=50`);
  if (!res.ok) throw new Error('Не вдалося завантажити класи');
  const data = await res.json();
  return data.results;
}

export async function fetchClass(slug) {
  const res = await fetch(`${API_BASE}/classes/${slug}/`);
  if (!res.ok) throw new Error('Не вдалося завантажити клас');
  return res.json();
}

export async function fetchRaces() {
  const res = await fetch(`${API_BASE}/races/?document__slug=srd&limit=50`);
  if (!res.ok) throw new Error('Не вдалося завантажити раси');
  const data = await res.json();
  return data.results;
}

export async function fetchRace(slug) {
  const res = await fetch(`${API_BASE}/races/${slug}/`);
  if (!res.ok) throw new Error('Не вдалося завантажити расу');
  return res.json();
}