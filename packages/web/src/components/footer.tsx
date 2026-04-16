import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const appVersion = import.meta.env.VITE_APP_VERSION || "";

export function Footer() {
  const { t } = useTranslation();
  const location = useLocation();
  const [copyright, setCopyright] = useState<string>(t("layout.copyright"));

  // Check if we're on an auth page (login, register, reset-password)
  const isAuthPage = ["/login", "/register", "/reset-password"].includes(
    location.pathname
  );

  useEffect(() => {
    const savedContent = localStorage.getItem("skitbit-content");
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        if (parsed.footer?.copyright) {
          setCopyright(parsed.footer.copyright);
        }
      } catch (error) {
        console.error("Error parsing saved content:", error);
      }
    }
  }, [t]);

  return (
    <footer
      className={cn(
        "w-full border-t py-3 sm:py-6",
        isAuthPage
          ? "border-white/10 bg-background/40 backdrop-blur-sm"
          : "border-border bg-background"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-2 sm:gap-4 text-xs sm:flex-row">
          <div className="flex items-center gap-2 sm:gap-3">
            <p
              className={cn(
                "text-[10px] sm:text-xs",
                isAuthPage ? "text-white/70" : "text-foreground/70"
              )}
            >
              {copyright}
            </p>
            {appVersion && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium",
                  isAuthPage
                    ? "bg-white/10 text-white/60"
                    : "bg-muted text-muted-foreground"
                )}
              >
                v{appVersion}
              </span>
            )}
          </div>
          <div className="flex flex-row items-center gap-3 sm:gap-6">
            <a
              href="/revisions"
              className={cn(
                "transition-colors text-[10px] sm:text-xs",
                isAuthPage
                  ? "hover:text-lime-300 text-white/70"
                  : "hover:text-primary text-foreground/70"
              )}
            >
              {t("layout.footer.revisionPolicy")}
            </a>
            <a
              href="/t&c"
              className={cn(
                "transition-colors text-[10px] sm:text-xs",
                isAuthPage
                  ? "hover:text-lime-300 text-white/70"
                  : "hover:text-primary text-foreground/70"
              )}
            >
              {t("layout.footer.termsAndConditions")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

