import React from 'react';

export type AdminTab = 'categories' | 'units';

interface NavbarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onResetDatabase: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onResetDatabase,
  isResetting,
}) => {
  return (
    <header className="bg-[#0052FF] text-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <span className="font-bold text-base tracking-tight">
            MiejskieOko <span className="font-normal opacity-80">| Panel Admina</span>
          </span>

          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              type="button"
              onClick={() => onSelectTab('categories')}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-white/20 text-white'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              Słownik Kategorii Usterek
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('units')}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition cursor-pointer ${
                activeTab === 'units'
                  ? 'bg-white/20 text-white'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              Jednostki Odpowiedzialne
            </button>
          </nav>
        </div>

        <button
          type="button"
          onClick={onResetDatabase}
          disabled={isResetting}
          className="bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-50 text-white text-sm font-semibold px-3.5 py-1.5 rounded-md shadow-xs transition cursor-pointer"
        >
          {isResetting ? 'Resetowanie...' : 'Reset Bazy'}
        </button>
      </div>
    </header>
  );
};