import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Plus,
  Power,
  X,
} from 'lucide-react';
import {
  type KategoriaUsterki,
  RODZAJ_MEDIOW_LABELS,
  RodzajMediow,
} from '../types/domain';
import { dictionaryService } from '../services/dictionaryService';

interface CategoriesManagerProps {
  categories: KategoriaUsterki[];
  onRefresh: () => Promise<void>;
}

interface CategoryFormState {
  kodKategorii: string;
  nazwa: string;
  opis: string;
  punktyBazowePriorytetu: number;
  czyZagrozenieBezpieczenstwa: boolean;
  powiazanyRodzajMediow: RodzajMediow | '';
}

const EMPTY_FORM: CategoryFormState = {
  kodKategorii: '',
  nazwa: '',
  opis: '',
  punktyBazowePriorytetu: 10,
  czyZagrozenieBezpieczenstwa: false,
  powiazanyRodzajMediow: '',
};

export const CategoriesManager: React.FC<CategoriesManagerProps> = ({
  categories,
  onRefresh,
}) => {
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM);
  const [showInactive, setShowInactive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEditMode = editingCode !== null;

  const isFormValid =
    form.kodKategorii.trim().length >= 2 &&
    form.nazwa.trim().length >= 3 &&
    form.punktyBazowePriorytetu >= 0;

  const handleEditClick = (cat: KategoriaUsterki) => {
    setErrorMsg(null);
    setEditingCode(cat.kodKategorii);
    setForm({
      kodKategorii: cat.kodKategorii,
      nazwa: cat.nazwa,
      opis: cat.opis ?? '',
      punktyBazowePriorytetu: cat.punktyBazowePriorytetu,
      czyZagrozenieBezpieczenstwa: cat.czyZagrozenieBezpieczenstwa,
      powiazanyRodzajMediow: cat.powiazanyRodzajMediow ?? '',
    });
  };

  const handleCancelEdit = () => {
    setEditingCode(null);
    setForm(EMPTY_FORM);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        nazwa: form.nazwa.trim(),
        opis: form.opis.trim() || undefined,
        punktyBazowePriorytetu: Number(form.punktyBazowePriorytetu),
        czyZagrozenieBezpieczenstwa: form.czyZagrozenieBezpieczenstwa,
        powiazanyRodzajMediow:
          form.powiazanyRodzajMediow === '' ? null : form.powiazanyRodzajMediow,
      };

      if (isEditMode && editingCode) {
        await dictionaryService.updateCategory(editingCode, payload);
      } else {
        await dictionaryService.createCategory({
          kodKategorii: form.kodKategorii,
          ...payload,
        });
      }

      setEditingCode(null);
      setForm(EMPTY_FORM);
      await onRefresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Wystąpił błąd zapisu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (kodKategorii: string) => {
    setErrorMsg(null);
    try {
      await dictionaryService.toggleCategoryActive(kodKategorii);
      await onRefresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Nie udało się zmienić statusu.'
      );
    }
  };

  const visibleCategories = showInactive
    ? categories
    : categories.filter((c) => c.czyAktywna);

  return (
    <div className="space-y-6">
      {/* Karta formularza – styl wzorowany na załączonym zdjęciu[cite: 7] */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode
              ? `Edytuj kategorię: ${editingCode}`
              : 'Dodaj nową kategorię usterki'}
          </h1>
          {isEditMode && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
              Anuluj edycję
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* kodKategorii */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Kod kategorii *
              </label>
              <input
                type="text"
                disabled={isEditMode}
                value={form.kodKategorii}
                onChange={(e) =>
                  setForm({
                    ...form,
                    kodKategorii: e.target.value.toUpperCase(),
                  })
                }
                placeholder="np. OSW-LAT"
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            {/* nazwa */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Nazwa kategorii *
              </label>
              <input
                type="text"
                value={form.nazwa}
                onChange={(e) => setForm({ ...form, nazwa: e.target.value })}
                placeholder="np. Awaria oświetlenia ulicznego"
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* punktyBazowePriorytetu */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Punkty bazowe priorytetu *
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.punktyBazowePriorytetu}
                onChange={(e) =>
                  setForm({
                    ...form,
                    punktyBazowePriorytetu: Number(e.target.value),
                  })
                }
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent"
              />
            </div>

            {/* powiazanyRodzajMediow */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Powiązany rodzaj mediów (Opcjonalne)
              </label>
              <select
                value={form.powiazanyRodzajMediow}
                onChange={(e) =>
                  setForm({
                    ...form,
                    powiazanyRodzajMediow: e.target.value as RodzajMediow | '',
                  })
                }
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent"
              >
                <option value="">Brak powiązania z mediami</option>
                {Object.values(RodzajMediow).map((medium) => (
                  <option key={medium} value={medium}>
                    {RODZAJ_MEDIOW_LABELS[medium]} ({medium})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* opis */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Opis kategorii (Opcjonalne)
            </label>
            <textarea
              rows={2}
              value={form.opis}
              onChange={(e) => setForm({ ...form, opis: e.target.value })}
              placeholder="Krótka instrukcja lub zakres problemów obejmowanych przez kategorię..."
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent"
            />
          </div>

          {/* czyZagrozenieBezpieczenstwa */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <span className="block text-sm font-semibold text-slate-800">
                Flaga zagrożenia bezpieczeństwa
              </span>
              <span className="text-xs text-slate-500">
                Automatycznie podnosi sugerowany priorytet zgłoszeń w tej
                kategorii.
              </span>
            </div>
            <input
              type="checkbox"
              checked={form.czyZagrozenieBezpieczenstwa}
              onChange={(e) =>
                setForm({
                  ...form,
                  czyZagrozenieBezpieczenstwa: e.target.checked,
                })
              }
              className="h-5 w-5 rounded border-slate-300 text-[#0052FF] focus:ring-[#0052FF] cursor-pointer"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="inline-flex items-center gap-2 bg-[#1E293B] hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting
                ? 'Zapisywanie...'
                : isEditMode
                ? 'Zapisz zmiany'
                : 'Dodaj kategorię'}
            </button>
          </div>
        </form>
      </section>

      {/* Karta listy kategorii */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Słownik kategorii usterek ({visibleCategories.length})
            </h2>
            <p className="text-xs text-slate-500">
              Dezaktywowane kategorie nie wyświetlają się mieszkańcom w
              formularzu zgłoszenia, ale pozostają w historii systemu.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-slate-300 text-[#0052FF] focus:ring-[#0052FF]"
            />
            Pokaż nieaktywne
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-3">Kod</th>
                <th className="py-3 px-3">Nazwa i opis</th>
                <th className="py-3 px-3">Priorytet bazowy</th>
                <th className="py-3 px-3">Zagrożenie</th>
                <th className="py-3 px-3">Powiązane medium</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {visibleCategories.map((cat) => (
                <tr
                  key={cat.kodKategorii}
                  className={`transition ${
                    cat.czyAktywna ? 'hover:bg-slate-50' : 'bg-slate-50/60 opacity-65'
                  }`}
                >
                  <td className="py-3.5 px-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                    {cat.kodKategorii}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-900">
                      {cat.nazwa}
                    </div>
                    {cat.opis && (
                      <div className="text-xs text-slate-500 line-clamp-1">
                        {cat.opis}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">
                    +{cat.punktyBazowePriorytetu} pkt
                  </td>
                  <td className="py-3.5 px-3">
                    {cat.czyZagrozenieBezpieczenstwa ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Tak
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Nie</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-xs text-slate-700">
                    {cat.powiazanyRodzajMediow
                      ? RODZAJ_MEDIOW_LABELS[cat.powiazanyRodzajMediow]
                      : '—'}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {cat.czyAktywna ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Aktywna
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                        Nieaktywna
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right whitespace-nowrap space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEditClick(cat)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edytuj
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(cat.kodKategorii)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition cursor-pointer ${
                        cat.czyAktywna
                          ? 'text-red-700 border-red-200 bg-red-50 hover:bg-red-100'
                          : 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {cat.czyAktywna ? 'Dezaktywuj' : 'Aktywuj'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};