// src/components/DemoLayout.tsx
import { useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function DemoLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const demoRouteOrder = useMemo(
    () => [
      "/demo",
      "/demo/services",
      "/demo/departments",
      "/demo/news",
      "/demo/contact",
      "/demo/privacy",
      "/demo/records-retention",
      "/demo/terms",
      "/demo/accessibility",
      "/demo/utilities",
      "/demo/311",
      "/demo/about",
      "/demo/faq",
      "/demo/open-data",
      "/demo/connect-app",
      "/demo/council",
      "/demo/forms",
      "/demo/services/permits",
      "/demo/services/payments",
      "/demo/services/report",
      "/demo/services/parking",
      "/demo/department/311",
      "/demo/resident",
      "/demo/resident/household",
      "/demo/resident/getting-home",
      "/demo/resident/utilities",
      "/demo/resident/health",
      "/demo/resident/animals",
      "/demo/resident/public-health",
      "/demo/resident/public-safety",
      "/demo/resident/trash-recycling-and-composting",
      "/demo/resident/gardening-and-home-improvements",
      "/demo/resident/pets-and-adoption",
      "/demo/resident/neighborhoods",
      "/demo/resident/neighborhood-community",
      "/demo/resident/families",
      "/demo/resident/education",
      "/demo/resident/libraries",
      "/demo/resident/senior-services-hub",
      "/demo/resident/crime",
      "/demo/resident/courts",
      "/demo/resident/fire-safety",
      "/demo/resident/emergency-preparedness",
      "/demo/resident/public-safety-employment",
      "/demo/resident/arts-and-leisure",
      "/demo/backlog",
    ],
    [],
  );

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return (
        target.isContentEditable ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT"
      );
    };

    const applySavedContrast = () => {
      const saved = window.localStorage.getItem("pv_contrast");
      if (saved === "high") {
        document.documentElement.setAttribute("data-pv-contrast", "high");
      } else {
        document.documentElement.removeAttribute("data-pv-contrast");
      }
    };

    const toggleContrast = () => {
      const isHigh =
        document.documentElement.getAttribute("data-pv-contrast") === "high";
      if (isHigh) {
        document.documentElement.removeAttribute("data-pv-contrast");
        window.localStorage.removeItem("pv_contrast");
      } else {
        document.documentElement.setAttribute("data-pv-contrast", "high");
        window.localStorage.setItem("pv_contrast", "high");
      }
    };

    applySavedContrast();

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      if (event.key.toLowerCase() === "h") {
        event.preventDefault();
        navigate("/demo");
        return;
      }

      // Accessibility: toggle high-contrast mode.
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        toggleContrast();
        return;
      }

      if (!event.altKey) return;

      const index = demoRouteOrder.indexOf(location.pathname);
      if (index === -1) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        const nextPath =
          demoRouteOrder[Math.min(index + 1, demoRouteOrder.length - 1)];
        if (nextPath && nextPath !== location.pathname) {
          navigate(nextPath);
        }
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        const prevPath = demoRouteOrder[Math.max(index - 1, 0)];
        if (prevPath && prevPath !== location.pathname) {
          navigate(prevPath);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [demoRouteOrder, location.pathname, navigate]);

  return (
    <div className="min-h-screen">
      <a
        href="#pv-main-content"
        className="pv-skip-link"
        onClick={(event) => {
          event.preventDefault();
          const root =
            document.getElementById("root") || document.documentElement;
          const header = root.querySelector("header");
          const target =
            header?.nextElementSibling ||
            root.querySelector("main") ||
            root.querySelector('[role="main"]') ||
            root.querySelector("section") ||
            root.querySelector("h1, h2");
          if (!target) return;

          const el = target as HTMLElement;
          const needsTabIndex =
            !el.hasAttribute("tabindex") &&
            el.tabIndex < 0 &&
            el.tagName !== "A" &&
            el.tagName !== "BUTTON";

          if (needsTabIndex) {
            el.setAttribute("tabindex", "-1");
          }

          el.scrollIntoView({ block: "start" });
          el.focus({ preventScroll: true });
        }}
      >
        Skip to main content
      </a>

      <div id="pv-main-content">
        <Outlet />
      </div>
    </div>
  );
}
