import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon, StarIcon } from "@heroicons/react/solid";

const Header = () => {
  const { systemTheme, theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderThemeChanger = () => {
    if (!mounted) return null;
    const currentTheme = theme === "system" ? systemTheme : theme;

    if (currentTheme === "dark") {
      return (
        <SunIcon
          className="w-6 h-6 text-yellow-500 "
          role="button"
          onClick={() => setTheme("light")}
        />
      );
    } else {
      return (
        <MoonIcon
          className="w-6 h-6 text-gray-900 "
          role="button"
          onClick={() => setTheme("dark")}
        />
      );
    }
  };

  return (
    <header className=" flex w-full p-5 py-3 justify-between text-sm text-gray-800 border-b border-zinc-200 dark:border-zinc-800">
      {/*left section*/}
      <div className="flex space-x-4 items-center">{renderThemeChanger()}</div>

      {/*right section*/}
      <div className="flex space-x-4 items-center select-none">
        <span className="font-bold font-sansSerif dark:text-gray-100">
          <a
            href="https://github.com/Olanetsoft/article-idea-generator/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1"
          >
            <span>Star</span>{" "}
            <StarIcon
              className="w-5 h-5 text-yellow-400 "
              onClick={() => setTheme("light")}
            />
            <span>on GitHub</span>
          </a>
        </span>
        <a
          href="https://github.com/Olanetsoft/article-idea-generator/"
          target="_blank"
          rel="noreferrer"
        >
          <p className="sr-only">GitHub</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="fill-black-600 dark:fill-zinc-200 group-hover:fill-slate-700"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </a>
      </div>
    </header>
  );
};

export default Header;
