import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { applySeo, pageFromPath } from "../lib/seo";

export function Seo() {
  const { pathname } = useLocation();
  const { locale } = useI18n();

  useEffect(() => {
    applySeo(pageFromPath(pathname), locale);
  }, [pathname, locale]);

  return null;
}
