import { useTheme } from '../context/ThemeContext';
import { useState, useRef, useEffect } from 'react';

const ThemeSelector = () => {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // DaisyUI v3.0+ theme names
  const themes = [
    { name: "light", display: "Light" },
    { name: "dark", display: "Dark" },
    { name: "cupcake", display: "Cupcake" },
    { name: "bumblebee", display: "Bumblebee" },
    { name: "emerald", display: "Emerald" },
    { name: "corporate", display: "Corporate" },
    { name: "synthwave", display: "Synthwave" },
    { name: "retro", display: "Retro" },
    { name: "cyberpunk", display: "Cyberpunk" },
    { name: "valentine", display: "Valentine" },
    { name: "halloween", display: "Halloween" },
    { name: "garden", display: "Garden" },
    { name: "forest", display: "Forest" },
    { name: "aqua", display: "Aqua" },
    { name: "lofi", display: "Lofi" },
    { name: "pastel", display: "Pastel" },
    { name: "fantasy", display: "Fantasy" },
    { name: "wireframe", display: "Wireframe" },
    { name: "black", display: "Black" },
    { name: "luxury", display: "Luxury" },
    { name: "dracula", display: "Dracula" },
    { name: "cmyk", display: "CMYK" },
    { name: "autumn", display: "Autumn" },
    { name: "business", display: "Business" },
    { name: "acid", display: "Acid" },
    { name: "lemonade", display: "Lemonade" },
    { name: "night", display: "Night" },
    { name: "coffee", display: "Coffee" },
    { name: "winter", display: "Winter" }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="btn btn-ghost gap-1 normal-case"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
        </svg>
        <span className="hidden md:inline">Theme</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-box bg-base-200 shadow-lg z-50">
          <div className="p-2 max-h-96 overflow-y-auto">
            {themes.map((t) => (
              <button
                key={t.name}
                className={`flex w-full items-center px-4 py-2 text-sm rounded-btn hover:bg-base-300 ${
                  theme === t.name ? 'bg-base-300' : ''
                }`}
                onClick={() => {
                  toggleTheme(t.name);
                  setIsOpen(false);
                  // Force CSS variable update
                  document.documentElement.setAttribute('data-theme', t.name);
                }}
              >
                <div 
                  className="w-3 h-3 rounded-full mr-3" 
                  style={{ 
                    backgroundColor: `hsl(var(--${t.name}-color))`,
                    border: '1px solid hsl(var(--bc)/0.2)'
                  }}
                />
                <span>{t.display}</span>
                {theme === t.name && (
                  <span className="ml-auto">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;