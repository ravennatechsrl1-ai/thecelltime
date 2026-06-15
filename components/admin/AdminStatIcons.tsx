const defaultClass = "h-5 w-5";

type IconProps = { className?: string };

/** Dashboard grid */
export function IconDashboard({ className = defaultClass }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </svg>
  );
}

/** Euro currency — total revenue */
export function IconRevenue({ className = defaultClass }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0" />
      <path d="M8 10.5h4m-4 3h4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

/** Shopping bag — orders sold */
export function IconOrders({ className = defaultClass }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5" />
      <path d="M2.25 10.5h19.5l-1.264 12c-.07.665-.594 1.193-1.261 1.193H4.775c-.667 0-1.191-.528-1.261-1.193L2.25 10.5z" />
      <path d="M8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

/** Bar chart — average order value */
export function IconAvgOrder({ className = defaultClass }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 13.125v6.75A1.125 1.125 0 004.125 21h2.25A1.125 1.125 0 007.5 19.875v-6.75A1.125 1.125 0 006.375 12h-2.25A1.125 1.125 0 003 13.125z" />
      <path d="M9.75 8.625v11.25A1.125 1.125 0 0010.875 21h2.25A1.125 1.125 0 0014.25 19.875V8.625A1.125 1.125 0 0013.125 7.5h-2.25A1.125 1.125 0 009.75 8.625z" />
      <path d="M16.5 4.125v15.75A1.125 1.125 0 0017.625 21h2.25A1.125 1.125 0 0021 19.875V4.125A1.125 1.125 0 0019.875 3h-2.25A1.125 1.125 0 0016.5 4.125z" />
    </svg>
  );
}

/** Smartphone — products in shop */
export function IconProducts({ className = defaultClass }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5.25" y="2.25" width="13.5" height="19.5" rx="2.25" />
      <path d="M9.75 18.75h4.5" />
    </svg>
  );
}

/** Archive box — units in stock */
export function IconStock({ className = defaultClass }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5" />
      <path d="M10.5 11.25h3" />
      <path d="M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

/** User group — customers */
export function IconCustomers({ className = defaultClass }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

/** Wrench — active repairs */
export function IconRepair({ className = defaultClass }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.952.759l-7.26 7.26a2.25 2.25 0 01-3.182-3.182l7.26-7.26c.688-.688.85-1.876.759-2.952a4.5 4.5 0 016.299-4.049z" />
      <path d="M15.75 8.25l-3 3" />
    </svg>
  );
}

/** Tag / percent — promotions */
export function IconPromotion({ className = defaultClass }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 14l6-6" />
      <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
      <path d="M3 7.5l3-3 4.5 4.5M13.5 13.5L18 18l3-3" />
    </svg>
  );
}

/** Plus circle — add product */
export function IconAddProduct({ className = defaultClass }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 9v6m3-3H9" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
