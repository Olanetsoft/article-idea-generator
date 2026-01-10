import Link from "next/link";
import { Space_Grotesk } from "@next/font/google";
import { Header, Footer, ErrorPageLayout } from "@/components";
import { useTranslation } from "@/hooks/useTranslation";

const spaceGrotesk = Space_Grotesk({
  weight: "700",
  display: "swap",
  subsets: ["latin"],
});

export default function Custom404(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center m-0 min-h-screen">
      <Header />

      <ErrorPageLayout
        statusCode={404}
        title={t("notFound.title")}
        description={t("notFound.metaDescription")}
        noindex={true}
        nofollow={false}
      >
        <div className="text-center max-w-lg">
          <h1
            className={`${spaceGrotesk.className} text-6xl sm:text-8xl font-bold text-indigo-500 mb-4`}
          >
            404
          </h1>
          <h2
            className={`${spaceGrotesk.className} text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-300 mb-4`}
          >
            {t("notFound.title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            {t("notFound.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {t("notFound.generateButton")}
            </Link>
            <Link
              href="/faq"
              className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-zinc-300 font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {t("notFound.faqButton")}
            </Link>
          </div>
        </div>
      </ErrorPageLayout>

      <Footer />
    </div>
  );
}
