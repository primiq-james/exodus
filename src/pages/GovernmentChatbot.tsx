import { useEffect } from "react";
import { Link } from "react-router-dom";
import civiqGuideLogo from "../assets/civiq-guide.svg";

export default function GovernmentChatbot() {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionMeta = document.querySelector('meta[name="description"]');
    const previousDescription =
      descriptionMeta?.getAttribute("content") ?? null;

    document.title = "Government Chatbot | CivIQ Guide by primIQ";
    if (descriptionMeta) {
      descriptionMeta.setAttribute(
        "content",
        "Government chatbot software for agencies: CivIQ Guide delivers source-grounded answers, reduces call-center volume, and improves resident service.",
      );
    }

    return () => {
      document.title = previousTitle;
      if (descriptionMeta && previousDescription != null) {
        descriptionMeta.setAttribute("content", previousDescription);
      }
    };
  }, []);

  return (
    <section className="min-h-screen py-16 md:py-20 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center">
          <img
            src={civiqGuideLogo}
            alt="Government chatbot platform CivIQ Guide by primIQ"
            className="mx-auto h-20 sm:h-24 md:h-28 w-auto mb-6"
          />
          <h1 className="font-hero text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Government Chatbot for Faster Public Service
          </h1>
          <p className="text-gray-200 text-base sm:text-lg md:text-xl max-w-4xl mx-auto">
            A government chatbot helps residents get accurate answers instantly
            while reducing call-center pressure. CivIQ Guide is built for
            agencies that need source-grounded responses, auditability, and
            measurable service impact.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-purple-300/30 bg-purple-950/25 p-5 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Why Agencies Deploy CivIQ Guide
          </h2>
          <ul className="space-y-3 text-gray-200 text-sm sm:text-base list-disc pl-5">
            <li>
              24/7 government chatbot coverage for common service questions
            </li>
            <li>
              Source-grounded responses aligned to official agency content
            </li>
            <li>Call-center deflection that frees staff for complex cases</li>
            <li>Intent analytics that reveal service gaps and demand trends</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-center">
          <Link
            to="/solutions/civiq"
            className="w-full sm:w-auto inline-flex justify-center rounded-xl bg-purple-600 px-6 py-3 text-base font-semibold text-white hover:bg-purple-700 transition"
          >
            Explore CivIQ Guide
          </Link>
          <Link
            to="/contact"
            className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-purple-300/40 px-6 py-3 text-base font-semibold text-purple-100 hover:bg-purple-900/35 transition"
          >
            Request a Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
