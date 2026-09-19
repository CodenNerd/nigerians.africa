import type { NavIconId } from "@/lib/nav-mega";

const size = "h-4 w-4 shrink-0";

export function NavIcon({ id, className = size }: { id: NavIconId; className?: string }) {
  const props = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (id) {
    case "person":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
        </svg>
      );
    case "building":
      return (
        <svg {...props}>
          <path d="M4 20h16M6 20V6l6-3 6 3v14M10 10h.01M14 10h.01M10 14h.01M14 14h.01" />
        </svg>
      );
    case "map":
      return (
        <svg {...props}>
          <path d="M9 4l-5 2v14l5-2 6 2 5-2V4l-5 2-6-2zM9 4v14M15 6v14" />
        </svg>
      );
    case "money":
      return (
        <svg {...props}>
          <rect x="3" y="6" width="18" height="12" rx="1.5" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M7 10v4M17 10v4" />
        </svg>
      );
    case "alert":
      return (
        <svg {...props}>
          <path d="M12 4l9 16H3L12 4z" />
          <path d="M12 10v4M12 17h.01" />
        </svg>
      );
    case "hammer":
      return (
        <svg {...props}>
          <path d="M14 5l5 5-3 1-4-4 2-2zM10 9l-6 10 3 1 6-10" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...props}>
          <path d="M13 3L5 14h7l-1 7 8-11h-7l1-7z" />
        </svg>
      );
    case "document":
      return (
        <svg {...props}>
          <path d="M7 3h7l4 4v14H7V3z" />
          <path d="M14 3v4h4M9 12h6M9 16h6" />
        </svg>
      );
    case "eye":
      return (
        <svg {...props}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case "org":
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="2.5" />
          <circle cx="16" cy="8" r="2.5" />
          <circle cx="12" cy="16" r="2.5" />
          <path d="M9.5 9.5l1.5 4M14.5 9.5l-1.5 4" />
        </svg>
      );
    case "ballot":
      return (
        <svg {...props}>
          <rect x="5" y="3" width="14" height="18" rx="1.5" />
          <path d="M9 9h6M9 13h6M9 17h3" />
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="6" />
          <path d="M16 16l4 4" />
        </svg>
      );
    default:
      return null;
  }
}
