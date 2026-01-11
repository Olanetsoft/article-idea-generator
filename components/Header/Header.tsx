import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import {
  SunIcon,
  MoonIcon,
  StarIcon,
  ChevronDownIcon,
} from "@heroicons/react/solid";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { useTranslation } from "@/hooks/useTranslation";
import { tools } from "@/lib/tools-config";

export default function Header() {
  const { systemTheme, theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [mobileToolsExpanded, setMobileToolsExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (
        toolsDropdownRef.current &&
        !toolsDropdownRef.current.contains(event.target as Node)
      ) {
        setToolsDropdownOpen(false);
      }
    };
    if (mobileMenuOpen || toolsDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen, toolsDropdownOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
    setMobileToolsExpanded(false);
  }, [router.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const isActiveLink = (path: string) => {
    if (path === "/") {
      return router.pathname === "/";
    }
    return router.pathname.startsWith(path);
  };

  const navLinks = [
    { href: "/", label: t("header.home") },
    { href: "/faq", label: "FAQ" },
  ];

  const availableTools = tools.filter((tool) => tool.available);

  const renderThemeChanger = (isMobile = false) => {
    if (!mounted) return null;
    const currentTheme = theme === "system" ? systemTheme : theme;
    const baseClasses = isMobile
      ? "flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
      : "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors";

    if (currentTheme === "dark") {
      return (
        <button
          className={baseClasses}
          onClick={() => setTheme("light")}
          aria-label="Switch to light mode"
        >
          <SunIcon className="w-5 h-5 text-yellow-500" />
          {isMobile && (
            <span className="text-gray-700 dark:text-gray-300">Light Mode</span>
          )}
        </button>
      );
    }
    return (
      <button
        className={baseClasses}
        onClick={() => setTheme("dark")}
        aria-label="Switch to dark mode"
      >
        <MoonIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        {isMobile && (
          <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
        )}
      </button>
    );
  };

  return (
    <header
      ref={menuRef}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-sm"
          : "bg-white dark:bg-zinc-900"
      } border-b border-gray-200 dark:border-zinc-800`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition shrink-0"
            aria-label="Article Idea Generator - Home"
          >
            <svg
              className="w-8 h-8 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span className="font-bold text-lg text-gray-900 dark:text-white hidden sm:inline">
              Article Idea Generator
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActiveLink(link.href)
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                    : "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Tools Dropdown */}
            <div className="relative" ref={toolsDropdownRef}>
              <button
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActiveLink("/tools")
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                    : "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                }`}
                aria-expanded={toolsDropdownOpen}
                aria-haspopup="true"
              >
                {t("header.tools")}
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform duration-200 ${
                    toolsDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {toolsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 py-2 z-50">
                  <Link
                    href="/tools"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    All Tools
                  </Link>
                  <div className="border-t border-gray-200 dark:border-zinc-700 my-1" />
                  {availableTools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className={`block px-4 py-2 text-sm transition-colors ${
                        router.pathname === tool.href
                          ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {t(tool.nameKey)}
                    </Link>
                  ))}
                  {availableTools.length === 0 && (
                    <span className="block px-4 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
                      Coming soon...
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-2">
            {renderThemeChanger()}

            <a
              href="https://github.com/Olanetsoft/article-idea-generator/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Star on GitHub"
            >
              <StarIcon className="w-5 h-5 text-yellow-500" />
              <span className="font-medium text-sm">Star on GitHub</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-1">
            {renderThemeChanger()}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors active:scale-95"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <XIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-x-0 top-16 bottom-0 z-40 transform transition-all duration-300 ease-in-out ${
          mobileMenuOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/30 dark:bg-black/50 transition-opacity ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-zinc-900 shadow-xl transform transition-transform duration-300 ease-out overflow-y-auto ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Navigation Links */}
          <div className="py-3 px-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3.5 mx-2 rounded-xl font-medium transition-all ${
                  isActiveLink(link.href)
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-[0.98]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Tools Section - Collapsible */}
            <div className="mx-2 mt-1">
              <button
                onClick={() => setMobileToolsExpanded(!mobileToolsExpanded)}
                className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl font-medium transition-all ${
                  isActiveLink("/tools")
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-[0.98]"
                }`}
              >
                <span>{t("header.tools")}</span>
                <ChevronDownIcon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    mobileToolsExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Tool Sub-links */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  mobileToolsExpanded
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="py-2 pl-4 space-y-1">
                  <Link
                    href="/tools"
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all ${
                      router.pathname === "/tools"
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                    All Tools
                  </Link>
                  {availableTools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all ${
                        router.pathname === tool.href
                          ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                      {t(tool.nameKey)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-gray-200 dark:border-zinc-800" />

          {/* Theme & GitHub Section */}
          <div className="py-3 px-2">
            {/* Theme Toggle */}
            <div className="mx-2">
              {mounted && (
                <button
                  className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all active:scale-[0.98]"
                  onClick={() =>
                    setTheme(
                      (theme === "system" ? systemTheme : theme) === "dark"
                        ? "light"
                        : "dark"
                    )
                  }
                >
                  {(theme === "system" ? systemTheme : theme) === "dark" ? (
                    <>
                      <SunIcon className="w-5 h-5 text-yellow-500" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <MoonIcon className="w-5 h-5 text-gray-600" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* GitHub Link */}
            <a
              href="https://github.com/Olanetsoft/article-idea-generator/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 mx-2 px-4 py-3.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all active:scale-[0.98]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>Star on GitHub</span>
              <StarIcon className="w-5 h-5 text-yellow-500 ml-auto" />
            </a>
          </div>

          {/* CTA Button - Fixed at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white dark:from-zinc-900 dark:via-zinc-900 to-transparent pt-8">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Generate Ideas
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
