// src/main.tsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import DemoLayout from "./components/DemoLayout";
import RouteSEO from "./components/RouteSEO";
import DemoHome from "./pages/demo/Home";
import ServicesDemo from "./pages/demo/Services";
import DepartmentsDemo from "./pages/demo/Departments";
import DepartmentPage from "./pages/demo/departments/DepartmentPage";
import NewsDemo from "./pages/demo/News";
import ContactDemo from "./pages/demo/Contact";
import PrivacyDemo from "./pages/demo/Privacy";
import TermsDemo from "./pages/demo/Terms";
import AccessibilityDemo from "./pages/demo/Accessibility";
import LegalNoticesDemo from "./pages/demo/LegalNotices";
import RecordsRetentionDemo from "./pages/demo/RecordsRetention";
import PermitsDemo from "./pages/demo/Permits";
import PaymentsDemo from "./pages/demo/Payments";
import ReportDemo from "./pages/demo/Report";
import ParkingDemo from "./pages/demo/Parking";
import UtilitiesDemo from "./pages/demo/Utilities";
import ThreeOneOneDemo from "./pages/demo/311";
import AboutDemo from "./pages/demo/About";
import FaqDemo from "./pages/demo/Faq";
import OpenDataDemo from "./pages/demo/OpenData";
import ConnectAppDemo from "./pages/demo/ConnectApp";
import CouncilDemo from "./pages/demo/Council";
import DemoAuthCallback from "./pages/demo/AuthCallback";
import DemoAction from "./pages/demo/Action";
import AboutDemoAlt from "./pages/demo/AboutDemo";
import ContactDemoAlt from "./pages/demo/ContactDemo";
import NewsDemoAlt from "./pages/demo/Newsdemo";
import ThreeOneOneAlt from "./pages/demo/ThreeOneOne";
import FormsDemo from "./pages/demo/Forms";
import ExodusAdmin from "./pages/demo/ExodusAdmin";
import AdminLogin from "./pages/demo/AdminLogin";
import Command from "./pages/demo/Command";
import Documents from "./pages/demo/Documents";
import Backlog from "./pages/demo/Backlog";
import Department311Demo from "./pages/demo/Department311";
import ResidentHubDemo from "./pages/demo/Resident";
import ResidentHouseholdDemo from "./pages/demo/resident/Household";
import ResidentGettingHomeDemo from "./pages/demo/resident/GettingHome";
import ResidentUtilitiesDemo from "./pages/demo/resident/Utilities";
import ResidentTrashRecyclingAndCompostingDemo from "./pages/demo/resident/TrashRecyclingAndComposting";
import ResidentSeniorServicesHubDemo from "./pages/demo/resident/SeniorServicesHub";
import ResidentGardeningAndHomeImprovementsDemo from "./pages/demo/resident/GardeningAndHomeImprovements";
import ResidentPetsAndAdoptionDemo from "./pages/demo/resident/PetsAndAdoption";
import ResidentNeighborhoodsDemo from "./pages/demo/resident/Neighborhoods";
import ResidentCrime from "./pages/demo/resident/Crime";
import ResidentCourts from "./pages/demo/resident/Courts";
import ResidentFireSafety from "./pages/demo/resident/FireSafety";
import ResidentEmergencyPreparedness from "./pages/demo/resident/EmergencyPreparedness";
import ResidentPublicSafetyEmployment from "./pages/demo/resident/PublicSafetyEmployment";
import ResidentArtsAndLeisure from "./pages/demo/resident/ArtsAndLeisure";
import ResidentHealth from "./pages/demo/resident/Health";
import ResidentAnimals from "./pages/demo/resident/Animals";
import ResidentPublicHealth from "./pages/demo/resident/PublicHealth";
import ResidentPublicSafety from "./pages/demo/resident/PublicSafety";
import ResidentEducation from "./pages/demo/resident/Education";
import ResidentLibraries from "./pages/demo/resident/Libraries";
import ResidentFamilies from "./pages/demo/resident/Families";
import ResidentNeighborhoodCommunity from "./pages/demo/resident/NeighborhoodCommunity";

import "./index.css";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const targetId = hash.replace("#", "");
    // Wait for route content to render before resolving anchor targets.
    window.setTimeout(() => {
      const target = document.getElementById(targetId);
      if (!target) return;
      const y = target.getBoundingClientRect().top + window.scrollY - 112;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }, 0);
  }, [pathname, hash]);

  return null;
}

function RootRedirect() {
  const host = window.location.hostname.toLowerCase();
  if (host === "admin.civiqguide.com") {
    return <Navigate to="/admin/login" replace />;
  }
  if (host === "board.civiqguide.com") {
    return <Navigate to="/command" replace />;
  }
  return <Navigate to="/demo" replace />;
}

// Main App component for consistent export (fixes Vite Fast Refresh warning)
function App() {
  return (
    <BrowserRouter>
      <RouteSEO />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/auth" element={<DemoAuthCallback />} />
        <Route path="/command" element={<Command />} />
        <Route path="/ticket-board" element={<Navigate to="/command" replace />} />
        <Route path="/backlog" element={<Backlog />} />
        <Route path="/documents" element={<Documents />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ExodusAdmin />} />

        <Route path="/demo" element={<DemoLayout />}>
          <Route index element={<DemoHome />} />
          <Route path="services" element={<ServicesDemo />} />
          <Route path="department/311" element={<Department311Demo />} />
          <Route path="resident" element={<ResidentHubDemo />} />
          <Route
            path="resident/household"
            element={<ResidentHouseholdDemo />}
          />
          <Route
            path="resident/getting-home"
            element={<ResidentGettingHomeDemo />}
          />
          <Route
            path="resident/utilities"
            element={<ResidentUtilitiesDemo />}
          />
          <Route
            path="resident/trash-recycling-and-composting"
            element={<ResidentTrashRecyclingAndCompostingDemo />}
          />
          <Route
            path="resident/senior-services-hub"
            element={<ResidentSeniorServicesHubDemo />}
          />
          <Route
            path="resident/gardening-and-home-improvements"
            element={<ResidentGardeningAndHomeImprovementsDemo />}
          />
          <Route
            path="resident/pets-and-adoption"
            element={<ResidentPetsAndAdoptionDemo />}
          />
          <Route
            path="resident/neighborhoods"
            element={<ResidentNeighborhoodsDemo />}
          />
          <Route path="departments" element={<DepartmentsDemo />} />
          <Route
            path="departments/:departmentSlug"
            element={<DepartmentPage />}
          />
          <Route path="news" element={<NewsDemo />} />
          <Route path="contact" element={<ContactDemo />} />
          <Route path="privacy" element={<PrivacyDemo />} />
          <Route path="privacy-policy" element={<PrivacyDemo />} />
          <Route path="records-retention" element={<RecordsRetentionDemo />} />
          <Route path="legal-notices" element={<LegalNoticesDemo />} />
          <Route path="terms" element={<TermsDemo />} />
          <Route path="terms-of-service" element={<TermsDemo />} />
          <Route path="accessibility" element={<AccessibilityDemo />} />
          <Route path="utilities" element={<UtilitiesDemo />} />
          <Route path="311" element={<ThreeOneOneDemo />} />
          <Route path="permits" element={<PermitsDemo />} />
          <Route path="about" element={<AboutDemo />} />
          <Route path="about-demo" element={<AboutDemoAlt />} />
          <Route path="faq" element={<FaqDemo />} />
          <Route path="contact-demo" element={<ContactDemoAlt />} />
          <Route path="newsdemo" element={<NewsDemoAlt />} />
          <Route path="three-one-one" element={<ThreeOneOneAlt />} />
          <Route path="open-data" element={<OpenDataDemo />} />
          <Route path="connect-app" element={<ConnectAppDemo />} />
          <Route path="council" element={<CouncilDemo />} />
          <Route path="auth" element={<DemoAuthCallback />} />
          <Route path="action" element={<DemoAction />} />
          <Route path="forms" element={<FormsDemo />} />
          <Route path="command" element={<Command />} />
          <Route
            path="ticket-board"
            element={<Navigate to="/demo/command" replace />}
          />
          <Route path="documents" element={<Documents />} />
          <Route path="backlog" element={<Backlog />} />
          <Route path="admin-login" element={<AdminLogin />} />
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin" element={<ExodusAdmin />} />

          {/* Service detail pages */}
          <Route path="services/permits" element={<PermitsDemo />} />
          <Route path="services/payments" element={<PaymentsDemo />} />
          <Route path="services/report" element={<ReportDemo />} />
          <Route path="services/parking" element={<ParkingDemo />} />

          {/* Resident pages */}
          <Route path="resident/health" element={<ResidentHealth />} />
          <Route path="resident/animals" element={<ResidentAnimals />} />
          <Route
            path="resident/public-health"
            element={<ResidentPublicHealth />}
          />
          <Route
            path="resident/public-safety"
            element={<ResidentPublicSafety />}
          />
          <Route path="resident/education" element={<ResidentEducation />} />
          <Route path="resident/libraries" element={<ResidentLibraries />} />
          <Route path="resident/families" element={<ResidentFamilies />} />
          <Route
            path="resident/neighborhood-community"
            element={<ResidentNeighborhoodCommunity />}
          />
          <Route path="resident/crime" element={<ResidentCrime />} />
          <Route path="resident/courts" element={<ResidentCourts />} />
          <Route path="resident/fire-safety" element={<ResidentFireSafety />} />
          <Route
            path="resident/emergency-preparedness"
            element={<ResidentEmergencyPreparedness />}
          />
          <Route
            path="resident/public-safety-employment"
            element={<ResidentPublicSafetyEmployment />}
          />
          <Route
            path="resident/arts-and-leisure"
            element={<ResidentArtsAndLeisure />}
          />
        </Route>

        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);

// Required for Vite React Fast Refresh
export default App;
