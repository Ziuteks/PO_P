import { useCallback, useEffect, useState } from 'react';
import { type AdminTab, Navbar } from './components/Navbar';
import { CategoriesManager } from './components/CategoriesManager';
import { UnitsManager } from './components/UnitsManager';
import { dictionaryService } from './services/dictionaryService';
import type { JednostkaOdpowiedzialna, KategoriaUsterki } from './types/domain';

export function App() {
  const [activeTab, setActiveTab] = useState<AdminTab>('categories');
  const [categories, setCategories] = useState<KategoriaUsterki[]>([]);
  const [units, setUnits] = useState<JednostkaOdpowiedzialna[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const loadAllData = useCallback(async () => {
    const [fetchedCategories, fetchedUnits] = await Promise.all([
      dictionaryService.getCategories(),
      dictionaryService.getUnits(),
    ]);
    setCategories(fetchedCategories);
    setUnits(fetchedUnits);
  }, []);

  useEffect(() => {
    loadAllData().finally(() => setIsLoading(false));
  }, [loadAllData]);

  const handleResetDatabase = async () => {
    setIsResetting(true);
    try {
      await dictionaryService.resetDatabase();
      await loadAllData();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900">
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onResetDatabase={handleResetDatabase}
        isResetting={isResetting}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-sm text-slate-500">
            Ładowanie danych słownikowych...
          </div>
        ) : activeTab === 'categories' ? (
          <CategoriesManager
            categories={categories}
            onRefresh={loadAllData}
          />
        ) : (
          <UnitsManager units={units} onRefresh={loadAllData} />
        )}
      </main>
    </div>
  );
}

export default App;