// Category chips shown in the results filter. Values must be exact event_category enums
// the backend stores (app/search/facets.py); labels are just the display text.
export interface CategoryOption {
  value: string;
  label: string;
}

export const CATEGORY_FILTERS: CategoryOption[] = [
  { value: "liquidation", label: "Liquidation" },
  { value: "receivership", label: "Receivership" },
  { value: "company_removal", label: "Removal" },
  { value: "land", label: "Land" },
  { value: "appointment", label: "Appointment" },
  { value: "bankruptcy", label: "Bankruptcy" },
];
