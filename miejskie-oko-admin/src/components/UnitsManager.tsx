import React, { useState } from 'react';
import {
  CheckCircle2,
  Edit2,
  Mail,
  Phone,
  Plus,
  Power,
  X,
} from 'lucide-react';
import type { JednostkaOdpowiedzialna } from '../types/domain';
import { dictionaryService } from '../services/dictionaryService';

interface UnitsManagerProps {
  units: JednostkaOdpowiedzialna[];
  onRefresh: () => Promise<void>;
}

interface UnitFormState {
  skrotNazwy: string;
  nazwaJednostki: string;
  emailKontaktowy: string;
  telefonAlarmowy: string;
}

const EMPTY_FORM: UnitFormState = {
  skrotNazwy: '',
  nazwaJednostki: '',
  emailKontaktowy: '',
  telefonAlarmowy: '',
};

export const UnitsManager: React.FC<UnitsManagerProps> = ({
  units,
  onRefresh,
}) => {
  const [editingShortName, setEditingShortName] = useState<string | null>(null);
  const [form, setForm] = useState<UnitFormState>(EMPTY_FORM);
  const [showInactive, setShowInactive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEditMode = editingShortName !== null;

  const isFormValid =
    form.skrotNazwy.trim().length >= 2 &&
    form.nazwaJednostki.trim().length >= 3;

  const handleEditClick = (unit: JednostkaOdpowiedzialna) => {
    setErrorMsg(null);
    setEditingShortName(unit.skrotNazwy);
    setForm({
      skrotNazwy: unit.skrotNazwy,
      nazwaJednostki: unit.nazwaJednostki,
      emailKontaktowy: unit.emailKontaktowy ?? '',
      telefonAlarmowy: unit.telefonAlarmowy ?? '',
    });
  };

  const handleCancelEdit = () => {
    setEditingShortName(null);
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
        nazwaJednostki: form.nazwaJednostki.trim(),
        emailKontaktowy: form.emailKontaktowy.trim() || undefined,
        telefonAlarmowy: form.telefonAlarmowy.trim() || undefined,
      };

      if (isEditMode && editingShortName) {
        await dictionaryService.updateUnit(editingShortName, payload);
      } else {
        await dictionaryService.createUnit({
          skrotNazwy: form.skrotNazwy,
          ...payload,
        });
      }

      setEditingShortName(null);
      setForm(EMPTY_FORM);
      await onRefresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Wystąpił błąd zapisu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (skrotNazwy: string) => {
    setErrorMsg(null);
    try {
      await dictionaryService.toggleUnitActive(skrotNazwy);
      await onRefresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Nie udało się zmienić statusu.'
      );
    }
  };

  const visibleUnits = showInactive
    ? units
    : units.filter((u) => u.czyAktywna);

  return (
    <div className="space-y-6">
      {/* Karta formularza */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode
              ? `Edytuj jednostkę: ${editingShortName}`
              : 'Dodaj nową jednostkę odpowiedzialną'}
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
            {/* skrotNazwy */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Skrót nazwy (ID) *
              </label>
              <input
                type="text"
                disabled={isEditMode}
                value={form.skrotNazwy}
                onChange={(e) =>
                  setForm({
                    ...form,
                    skrotNazwy: e.target.value.toUpperCase(),
                  })
                }
                placeholder="np. ZDIUM"
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            {/* nazwaJednostki */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Pełna nazwa jednostki *
              </label>
              <input
                type="text"
                value={form.nazwaJednostki}
                onChange={(e) =>
                  setForm({ ...form, nazwaJednostki: e.target.value })
                }
                placeholder="np. Zarząd Dróg i Utrzymania Miasta"
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* emailKontaktowy */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                E-mail kontaktowy
              </label>
              <input
                type="email"
                value={form.emailKontaktowy}
                onChange={(e) =>
                  setForm({ ...form, emailKontaktowy: e.target.value })
                }
                placeholder="np. zgloszenia@zdium.wroc.pl"
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent"
              />
            </div>

            {/* telefonAlarmowy */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Telefon alarmowy
              </label>
              <input
                type="text"
                value={form.telefonAlarmowy}
                onChange={(e) =>
                  setForm({ ...form, telefonAlarmowy: e.target.value })
                }
                placeholder="np. 71 372 00 10 lub 994"
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent"
              />
            </div>
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
                : 'Dodaj jednostkę'}
            </button>
          </div>
        </form>
      </section>

      {/* Karta listy jednostek */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Wykaz jednostek odpowiedzialnych ({visibleUnits.length})
            </h2>
            <p className="text-xs text-slate-500">
              Jednostki aktywne mogą być przypisywane przez Dyspozytora do
              zgłoszeń oraz do kont Pracowników Obsługi.
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
                <th className="py-3 px-3">Skrót</th>
                <th className="py-3 px-3">Nazwa jednostki</th>
                <th className="py-3 px-3">E-mail kontaktowy</th>
                <th className="py-3 px-3">Telefon alarmowy</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {visibleUnits.map((unit) => (
                <tr
                  key={unit.skrotNazwy}
                  className={`transition ${
                    unit.czyAktywna ? 'hover:bg-slate-50' : 'bg-slate-50/60 opacity-65'
                  }`}
                >
                  <td className="py-3.5 px-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                    {unit.skrotNazwy}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-900">
                    {unit.nazwaJednostki}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">
                    {unit.emailKontaktowy ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {unit.emailKontaktowy}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                    {unit.telefonAlarmowy ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {unit.telefonAlarmowy}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {unit.czyAktywna ? (
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
                      onClick={() => handleEditClick(unit)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edytuj
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(unit.skrotNazwy)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition cursor-pointer ${
                        unit.czyAktywna
                          ? 'text-red-700 border-red-200 bg-red-50 hover:bg-red-100'
                          : 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {unit.czyAktywna ? 'Dezaktywuj' : 'Aktywuj'}
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