import { INITIAL_CATEGORIES, INITIAL_UNITS } from '../mocks/mockData';
import type { JednostkaOdpowiedzialna, KategoriaUsterki } from '../types/domain';

const CATEGORIES_STORAGE_KEY = 'miejskie_oko_categories_v1';
const UNITS_STORAGE_KEY = 'miejskie_oko_units_v1';

// Symulacja opóźnienia sieciowego (np. 200 ms) ułatwiająca testowanie stanów ładowania
const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return [...fallback];
  }
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [...fallback];
  }
}

export const dictionaryService = {
  // ================= KATEGORIE USTEREK (AC-01)[cite: 4] =================

  async getCategories(): Promise<KategoriaUsterki[]> {
    await delay();
    return loadFromStorage<KategoriaUsterki>(
      CATEGORIES_STORAGE_KEY,
      INITIAL_CATEGORIES
    );
  },

  async createCategory(
    payload: Omit<KategoriaUsterki, 'czyAktywna'>
  ): Promise<KategoriaUsterki> {
    await delay();
    const list = loadFromStorage<KategoriaUsterki>(
      CATEGORIES_STORAGE_KEY,
      INITIAL_CATEGORIES
    );

    const normalizedCode = payload.kodKategorii.trim().toUpperCase();
    if (list.some((c) => c.kodKategorii === normalizedCode)) {
      throw new Error(`Kategoria o kodzie "${normalizedCode}" już istnieje.`);
    }

    const newCategory: KategoriaUsterki = {
      ...payload,
      kodKategorii: normalizedCode,
      czyAktywna: true, // Domyślna wartość z diagramu klas[cite: 6]
    };

    const updated = [newCategory, ...list];
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
    return newCategory;
  },

  async updateCategory(
    kodKategorii: string,
    payload: Omit<KategoriaUsterki, 'kodKategorii' | 'czyAktywna'>
  ): Promise<KategoriaUsterki> {
    await delay();
    const list = loadFromStorage<KategoriaUsterki>(
      CATEGORIES_STORAGE_KEY,
      INITIAL_CATEGORIES
    );

    const idx = list.findIndex((c) => c.kodKategorii === kodKategorii);
    if (idx === -1) {
      throw new Error('Nie znaleziono wskazanej kategorii.');
    }

    const updatedItem: KategoriaUsterki = {
      ...list[idx],
      ...payload,
    };

    list[idx] = updatedItem;
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(list));
    return updatedItem;
  },

  async toggleCategoryActive(kodKategorii: string): Promise<KategoriaUsterki> {
    await delay();
    const list = loadFromStorage<KategoriaUsterki>(
      CATEGORIES_STORAGE_KEY,
      INITIAL_CATEGORIES
    );

    const idx = list.findIndex((c) => c.kodKategorii === kodKategorii);
    if (idx === -1) {
      throw new Error('Nie znaleziono wskazanej kategorii.');
    }

    list[idx] = {
      ...list[idx],
      czyAktywna: !list[idx].czyAktywna,
    };

    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(list));
    return list[idx];
  },

  // ================= JEDNOSTKI ODPOWIEDZIALNE (AC-02)[cite: 4] =================

  async getUnits(): Promise<JednostkaOdpowiedzialna[]> {
    await delay();
    return loadFromStorage<JednostkaOdpowiedzialna>(
      UNITS_STORAGE_KEY,
      INITIAL_UNITS
    );
  },

  async createUnit(
    payload: Omit<JednostkaOdpowiedzialna, 'czyAktywna'>
  ): Promise<JednostkaOdpowiedzialna> {
    await delay();
    const list = loadFromStorage<JednostkaOdpowiedzialna>(
      UNITS_STORAGE_KEY,
      INITIAL_UNITS
    );

    const normalizedShort = payload.skrotNazwy.trim().toUpperCase();
    if (list.some((u) => u.skrotNazwy === normalizedShort)) {
      throw new Error(`Jednostka o skrócie "${normalizedShort}" już istnieje.`);
    }

    const newUnit: JednostkaOdpowiedzialna = {
      ...payload,
      skrotNazwy: normalizedShort,
      czyAktywna: true, // Domyślna wartość z diagramu klas[cite: 6]
    };

    const updated = [newUnit, ...list];
    localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(updated));
    return newUnit;
  },

  async updateUnit(
    skrotNazwy: string,
    payload: Omit<JednostkaOdpowiedzialna, 'skrotNazwy' | 'czyAktywna'>
  ): Promise<JednostkaOdpowiedzialna> {
    await delay();
    const list = loadFromStorage<JednostkaOdpowiedzialna>(
      UNITS_STORAGE_KEY,
      INITIAL_UNITS
    );

    const idx = list.findIndex((u) => u.skrotNazwy === skrotNazwy);
    if (idx === -1) {
      throw new Error('Nie znaleziono wskazanej jednostki.');
    }

    const updatedItem: JednostkaOdpowiedzialna = {
      ...list[idx],
      ...payload,
    };

    list[idx] = updatedItem;
    localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(list));
    return updatedItem;
  },

  async toggleUnitActive(skrotNazwy: string): Promise<JednostkaOdpowiedzialna> {
    await delay();
    const list = loadFromStorage<JednostkaOdpowiedzialna>(
      UNITS_STORAGE_KEY,
      INITIAL_UNITS
    );

    const idx = list.findIndex((u) => u.skrotNazwy === skrotNazwy);
    if (idx === -1) {
      throw new Error('Nie znaleziono wskazanej jednostki.');
    }

    list[idx] = {
      ...list[idx],
      czyAktywna: !list[idx].czyAktywna,
    };

    localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(list));
    return list[idx];
  },

  // ================= RESET BAZY (PRZYCISK Z PASKA NAWIGACJI)[cite: 7] =================

  async resetDatabase(): Promise<void> {
    await delay(150);
    localStorage.setItem(
      CATEGORIES_STORAGE_KEY,
      JSON.stringify(INITIAL_CATEGORIES)
    );
    localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(INITIAL_UNITS));
  },
};