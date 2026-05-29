export type DemoFormDoc = {
  title: string;
  path: string;
  type: "PDF" | "DOCX" | "XLSX";
  group: "Building" | "Trade Permits" | "Planning" | "Supporting Docs";
};

export const DEMO_FORM_DOCS: DemoFormDoc[] = [
  {
    title: "Residential Application",
    path: "/demo-docs/forms/palo_verde_residential_application.pdf",
    type: "PDF",
    group: "Building",
  },
  {
    title: "Commercial Application",
    path: "/demo-docs/forms/palo_verde_commercial_application.pdf",
    type: "PDF",
    group: "Building",
  },
  {
    title: "Demolition Application",
    path: "/demo-docs/forms/palo_verde_demolition_application.pdf",
    type: "PDF",
    group: "Building",
  },
  {
    title: "Building Permit Application",
    path: "/demo-docs/forms/palo_verde_building_permit_application.docx",
    type: "DOCX",
    group: "Building",
  },
  {
    title: "Electrical Permit",
    path: "/demo-docs/forms/palo_verde_electrical_permit.pdf",
    type: "PDF",
    group: "Trade Permits",
  },
  {
    title: "Plumbing Permit",
    path: "/demo-docs/forms/palo_verde_plumbing_permit.pdf",
    type: "PDF",
    group: "Trade Permits",
  },
  {
    title: "Mechanical Permit",
    path: "/demo-docs/forms/palo_verde_mechanical_permit.pdf",
    type: "PDF",
    group: "Trade Permits",
  },
  {
    title: "Variance Application",
    path: "/demo-docs/forms/palo_verde_variance_application.pdf",
    type: "PDF",
    group: "Planning",
  },
  {
    title: "Plat Vacation Application",
    path: "/demo-docs/forms/palo_verde_plat_vacation_application.pdf",
    type: "PDF",
    group: "Planning",
  },
  {
    title: "Small Project Fill Application",
    path: "/demo-docs/forms/palo_verde_small_project_fill_application.pdf",
    type: "PDF",
    group: "Planning",
  },
  {
    title: "Plan Revision Request",
    path: "/demo-docs/forms/palo_verde_plan_revision_request.pdf",
    type: "PDF",
    group: "Supporting Docs",
  },
  {
    title: "Deferred Submittal Application",
    path: "/demo-docs/forms/palo_verde_deferred_submittal_application.pdf",
    type: "PDF",
    group: "Supporting Docs",
  },
  {
    title: "Agent Authorization Form",
    path: "/demo-docs/forms/palo_verde_agent_authorization_form.pdf",
    type: "PDF",
    group: "Supporting Docs",
  },
  {
    title: "Special Inspection Statement",
    path: "/demo-docs/forms/palo_verde_special_inspection_statement.pdf",
    type: "PDF",
    group: "Supporting Docs",
  },
  {
    title: "Temporary Certificate of Occupancy Request",
    path: "/demo-docs/forms/palo_verde_temporary_certificate_of_occupancy_request.pdf",
    type: "PDF",
    group: "Supporting Docs",
  },
  {
    title: "Alternate Compliance Request",
    path: "/demo-docs/forms/palo_verde_alternate_compliance_request.pdf",
    type: "PDF",
    group: "Supporting Docs",
  },
  {
    title: "Permit Fee Calculator",
    path: "/demo-docs/forms/palo_verde_permit_fee_calculator.xlsx",
    type: "XLSX",
    group: "Supporting Docs",
  },
];
