import { useLocation } from "react-router-dom";
import SEO from "./SEO";
import type { SeoInput } from "../lib/seo";

const ROUTE_SEO: Array<{ test: RegExp; seo: SeoInput }> = [
  {
    test: /^\/$/,
    seo: {
      title: "Government AI Assistant Demo",
      description:
        "Explore CivIQ Demo workflows for resident support, service routing, and source-grounded city operations.",
      path: "/",
      keywords: ["government AI assistant", "civiq demo"],
    },
  },
  {
    test: /^\/demo$/,
    seo: {
      title: "Interactive Product Demo",
      description:
        "Run the CivIQ interactive demo for resident requests, service guidance, and municipal support workflows with WCAG-aligned accessibility practices.",
      path: "/demo",
      keywords: ["government chatbot demo", "municipal AI demo"],
    },
  },
  {
    test: /^\/demo\/311$/,
    seo: {
      title: "311 Service Demo",
      description:
        "See how CivIQ handles 311 requests with source-grounded answers, next-step routing, and escalation controls.",
      path: "/demo/311",
      keywords: ["311 chatbot", "311 service demo"],
    },
  },
  {
    test: /^\/demo\/utilities$/,
    seo: {
      title: "Utilities Workflow Demo",
      description:
        "Preview utility-service responses for billing, outages, and account guidance in a municipal AI assistant flow.",
      path: "/demo/utilities",
      keywords: ["utilities chatbot", "city utility support"],
    },
  },
  {
    test: /^\/demo\/services$/,
    seo: {
      title: "Services Hub Demo",
      description:
        "Navigate resident service categories, routing paths, and response content through the CivIQ demo experience.",
      path: "/demo/services",
      keywords: ["city services demo", "resident services AI"],
    },
  },
  {
    test: /^\/demo\/departments$/,
    seo: {
      title: "Departments Demo",
      description:
        "Explore department-level routing and resident guidance patterns across major municipal service teams.",
      path: "/demo/departments",
      keywords: ["municipal departments", "city service routing"],
    },
  },
  {
    test: /^\/demo\/(services\/permits|permits)$/,
    seo: {
      title: "Permits Workflow Demo",
      description:
        "Preview permit guidance, requirement intake, and routing behavior in the CivIQ resident support assistant.",
      path: "/demo/permits",
      keywords: ["permit chatbot", "permit workflow demo"],
    },
  },
  {
    test: /^\/demo\/accessibility$/,
    seo: {
      title: "Accessibility Statement",
      description:
        "Review the CivIQ demo accessibility approach, standards alignment, and issue-reporting workflow.",
      path: "/demo/accessibility",
      keywords: ["demo accessibility", "wcag accessibility statement"],
    },
  },
  {
    test: /^\/demo\/(privacy-policy|privacy)$/,
    seo: {
      title: "Privacy Policy",
      description:
        "Read the CivIQ demo privacy policy covering data handling, retention, and resident information protections.",
      path: "/demo/privacy-policy",
      keywords: ["privacy policy", "demo privacy"],
    },
  },
  {
    test: /^\/demo\/(terms-of-service|terms)$/,
    seo: {
      title: "Terms of Service",
      description:
        "Review CivIQ demo terms of service for permitted use, user responsibilities, and platform limitations.",
      path: "/demo/terms-of-service",
      keywords: ["terms of service", "demo terms"],
    },
  },
  {
    test: /^\/(command|ticket-board|backlog|documents|admin|auth)(\/|$)/,
    seo: {
      noindex: true,
    },
  },
  {
    test: /^\/demo\/(command|ticket-board|backlog|documents|admin|auth)(\/|$)/,
    seo: {
      noindex: true,
    },
  },
];

export default function RouteSEO() {
  const { pathname } = useLocation();
  const matched = ROUTE_SEO.find((entry) => entry.test.test(pathname))?.seo;
  return <SEO {...(matched || { path: pathname })} />;
}
