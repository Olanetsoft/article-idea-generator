import { HeartIcon } from "@heroicons/react/solid";
import { useTranslation } from "../hooks/useTranslation";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="text-center border-t border-slate-200 dark:border-zinc-800 sm:h-15 sm:py-2 py-4 px-5 space-y-2 sm:mb-0 dark:bg-zinc-900 dark:text-zinc-300 w-full bg-white mt-auto">
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
          OpenAI
        </a>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        © {currentYear} Article Idea Generator. {t("footer.copyright")}
      </p>
    </footer>
  );
}
