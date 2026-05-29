import { Link } from "react-router-dom";
import civiqGuideLogo from "../assets/civiq-guide.svg";
import primiqLogo from "../assets/PrimI-2.svg";

export default function CiviqFooter() {
  return (
    <footer className="py-16 md:py-20 bg-gradient-to-r from-[#072F4F] via-[#0B3C5D] to-[#7FA8C4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10 text-center">
          <Link
            to="/civiq"
            className="inline-flex justify-center hover:opacity-90 transition-opacity"
          >
            <img
              src={civiqGuideLogo}
              alt="CivIQ Guide"
              className="h-12 sm:h-14 w-auto"
            />
          </Link>
          <p className="mt-2 text-base text-gray-300">
            A structural intelligence layer for public systems and execution
            teams.
          </p>
          <a
            href="https://primiq.ai"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 text-[#D9E2EC] hover:text-white"
          >
            <img src={primiqLogo} alt="primIQ" className="h-6 w-auto" />
            <span className="text-sm font-semibold">Powered by primIQ</span>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 justify-items-start gap-6 sm:gap-8 md:gap-12 text-base sm:text-lg text-[#D9E2EC] text-left">
          <div className="col-start-1 row-start-1 md:col-auto md:row-auto">
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">
              Contact Us
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:info@civiqguide.com"
                  className="text-[#17A2B8] hover:text-[#7FE3F0]"
                >
                  info@civiqguide.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:sales@civiqguide.com"
                  className="text-[#17A2B8] hover:text-[#7FE3F0]"
                >
                  sales@civiqguide.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:partners@civiqguide.com"
                  className="text-[#17A2B8] hover:text-[#7FE3F0]"
                >
                  partners@civiqguide.com
                </a>
              </li>
            </ul>
          </div>

          <div className="col-start-2 row-start-1 md:col-auto md:row-auto">
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-white">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-white">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-white">
                  News
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/civiq" className="hover:text-white">
                  CivIQ Guide
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-start-1 row-start-2 md:col-auto md:row-auto">
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-white">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 text-center text-base sm:text-lg text-gray-500">
          © {new Date().getFullYear()} primIQ. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
