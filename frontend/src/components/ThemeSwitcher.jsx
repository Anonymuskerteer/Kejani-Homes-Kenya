import { useTheme } from '../contexts/ThemeProvider';
import { Sun, Moon } from 'lucide-react'; // Using lucide-react for icons

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // We need to install lucide-react first. I will do this in a later step.
  // For now, I will use text as placeholders.

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-dark dark:text-light bg-foreground dark:bg-dark-foreground hover:bg-border dark:hover:bg-dark-border transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
