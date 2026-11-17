export enum RodzajMediow { //czepia się tego enum bo nie ma go w JS a musi być kompatybilne z JS
  ENERGIA_ELEKTRYCZNA = 'ENERGIA_ELEKTRYCZNA',
  WODOCIAGI_I_KANALIZACJA = 'WODOCIAGI_I_KANALIZACJA',
  CIEPLOWNICTWO = 'CIEPLOWNICTWO',
  OSWIETLENIE_ULICZNE = 'OSWIETLENIE_ULICZNE',
  INFRASTRUKTURA_DROGOWA = 'INFRASTRUKTURA_DROGOWA',
  INNE = 'INNE',
}

export const RODZAJ_MEDIOW_LABELS: Record<RodzajMediow, string> = {
  [RodzajMediow.ENERGIA_ELEKTRYCZNA]: 'Energia elektryczna',
  [RodzajMediow.WODOCIAGI_I_KANALIZACJA]: 'Wodociągi i kanalizacja',
  [RodzajMediow.CIEPLOWNICTWO]: 'Ciepłownictwo',
  [RodzajMediow.OSWIETLENIE_ULICZNE]: 'Oświetlenie uliczne',
  [RodzajMediow.INFRASTRUKTURA_DROGOWA]: 'Infrastruktura drogowa',
  [RodzajMediow.INNE]: 'Inne',
};

// Klasa KategoriaUsterki z pakietu "Obsługa zgłoszeń"[cite: 3, 6]
export interface KategoriaUsterki {
  kodKategorii: string; // {id}[cite: 3, 6]
  nazwa: string; //[cite: 3, 6]
  opis?: string; // [0..1][cite: 3, 6]
  punktyBazowePriorytetu: number; //[cite: 3, 6]
  czyZagrozenieBezpieczenstwa: boolean; //[cite: 3, 6]
  powiazanyRodzajMediow?: RodzajMediow | null; // [0..1][cite: 3, 6]
  czyAktywna: boolean; // domyślnie true[cite: 6]
}

// Klasa JednostkaOdpowiedzialna z pakietu "Obsługa zgłoszeń"[cite: 3, 6]
export interface JednostkaOdpowiedzialna {
  skrotNazwy: string; // {id}[cite: 3, 6]
  nazwaJednostki: string; //[cite: 3, 6]
  emailKontaktowy?: string; // [0..1][cite: 3, 6]
  telefonAlarmowy?: string; // [0..1][cite: 3, 6]
  czyAktywna: boolean; // domyślnie true[cite: 6]
}