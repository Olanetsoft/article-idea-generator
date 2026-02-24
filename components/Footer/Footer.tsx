import Link from "next/link";
import { HeartIcon, CogIcon } from "@heroicons/react/solid";
import { useTranslation } from "@/hooks/useTranslation";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  const openCookieSettings = () => {
    // Clear consent to re-show the banner
    if (typeof window !== "undefined") {
      localStorage.removeItem("cookie-consent");
      window.location.reload();
    }
  };

  return (
    <footer className="text-center border-t border-slate-200 dark:border-dark-border sm:h-auto sm:py-3 py-4 px-5 space-y-2 sm:mb-0 dark:bg-black dark:text-zinc-300 w-full bg-white mt-auto">
      <div className="flex w-fit flex-wrap items-center justify-center gap-1 text-center m-auto">
        <span className="flex w-fit items-center gap-2">
          <span>{t("footer.builtWith")} </span>
          <HeartIcon className="w-6 h-6 text-red-500" aria-label="love" />
        </span>
        - {t("footer.poweredBy")}{" "}
        <a
          href="https://openai.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold hover:underline underline-offset-2"
        >
          AI
        </a>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span>© {currentYear} Article Idea Generator.</span>
        <Link
          href="/privacy"
          className="hover:text-violet-600 dark:hover:text-violet-400 hover:underline"
        >
          Privacy Policy
        </Link>
        <button
          onClick={openCookieSettings}
          className="flex items-center gap-1 hover:text-violet-600 dark:hover:text-violet-400 hover:underline"
        >
          <CogIcon className="w-3 h-3" />
          Cookie Settings
        </button>
      </div>
    </footer>
  );
}
