export function OpenNavigationButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="problem-nav-toggle" aria-label="Open navigation menu" onClick={onClick}>
      <MenuIcon />
    </button>
  );
}

export function ShowSidebarButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="sidebar-show-toggle inline" aria-label="Show sidebar" title="Show sidebar" onClick={onClick}>
      <PanelOpenIcon />
    </button>
  );
}

export function PanelOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9 4v16" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="m12 9 3 3-3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PanelCloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9 4v16" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="m16 9-3 3 3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
