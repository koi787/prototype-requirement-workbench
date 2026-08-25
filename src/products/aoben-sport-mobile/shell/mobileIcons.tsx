export type AobenIconName =
  | 'calendar'
  | 'bag'
  | 'order'
  | 'coupon'
  | 'training'
  | 'coin'
  | 'help'
  | 'gift'
  | 'code'
  | 'assessment'
  | 'recruitment'
  | 'promotion'
  | 'survey'
  | 'message'
  | 'settings'
  | 'home'
  | 'schedule'
  | 'scan';

interface MobileIconProps {
  name: AobenIconName;
  size?: number;
  className?: string;
}

export function MobileIcon({ name, size = 32, className }: MobileIconProps) {
  const common = {
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {name === 'calendar' && <><rect x="7" y="9" width="26" height="25" rx="5" {...common} /><path d="M12 6v7M28 6v7M8 16h24M14 23h.01M20 23h.01M26 23h.01M14 28h.01M20 28h.01" {...common} strokeWidth="2.4" /></>}
      {name === 'bag' && <><path d="M8 13h24v20H8z" {...common} /><path d="M14 13V9a6 6 0 0 1 12 0v4M14 22c2.7 2.8 9.3 2.8 12 0" {...common} /></>}
      {name === 'order' && <><path d="M8 12h24v21H8z" {...common} /><path d="M13 8h14M13 18h14M13 24h9M13 29h6" {...common} /></>}
      {name === 'coupon' && <><path d="M7 13a4 4 0 0 0 0 8v6a4 4 0 0 0 4 4h18a4 4 0 0 0 0-8v-6a4 4 0 0 0 0-8H11a4 4 0 0 0-4 4Z" {...common} /><path d="M21 13v14M24 17h.01M24 23h.01" {...common} /></>}
      {name === 'training' && <><circle cx="15" cy="14" r="5" {...common} /><path d="M7 31c1-6 4-9 8-9s7 3 8 9M25 24l4-4 4 4M29 20v11" {...common} /></>}
      {name === 'coin' && <><circle cx="20" cy="20" r="12" {...common} /><path d="M16 15c1.5-2 6.5-2 8 0M16 25c1.5 2 6.5 2 8 0M20 12v16M15 20h10" {...common} /></>}
      {name === 'help' && <><circle cx="20" cy="20" r="12" {...common} /><path d="M16.5 16a3.6 3.6 0 1 1 6.2 2.5c-1.5 1.5-2.7 2-2.7 4M20 27h.01" {...common} /></>}
      {name === 'gift' && <><rect x="7" y="15" width="26" height="18" rx="3" {...common} /><path d="M20 15v18M6 15h28v6H6zM20 15h-5a3.5 3.5 0 1 1 3.5-3.5V15ZM20 15h5a3.5 3.5 0 1 0-3.5-3.5V15Z" {...common} /></>}
      {name === 'code' && <><rect x="7" y="8" width="26" height="25" rx="5" {...common} /><path d="m15 20 4 4 7-8M13 14h8" {...common} /></>}
      {name === 'assessment' && <><path d="M7 27c0-5 4-9 9-9h8c5 0 9 4 9 9v4H7v-4Z" {...common} /><path d="M11 18c1-4 4-6 9-6s8 2 9 6M15 25h10" {...common} /></>}
      {name === 'recruitment' && <><path d="M8 16h24M11 16l3-6h12l3 6M9 16v16h22V16M16 23h8" {...common} /></>}
      {name === 'promotion' && <><path d="m8 21 20-8 4 4-20 8-4-4ZM12 25l3 7M28 13l2-5M31 23l3 3" {...common} /></>}
      {name === 'survey' && <><rect x="8" y="7" width="24" height="27" rx="4" {...common} /><path d="M14 14h12M14 20h8M14 27l3 3 7-7" {...common} /></>}
      {name === 'message' && <><circle cx="20" cy="20" r="12" {...common} /><path d="M14 16h12M14 21h12M14 26h6" {...common} /></>}
      {name === 'settings' && <><path d="m20 8 2 2 3-.5 1.5 2.6-1 2.5 2 2v3l-2 2 1 2.5-1.5 2.6-3-.5-2 2h-3l-2-2-3 .5-1.5-2.6 1-2.5-2-2v-3l2-2-1-2.5L11 9.5l3 .5 2-2h4Z" {...common} /><circle cx="20" cy="20" r="4" {...common} /></>}
      {name === 'home' && <><path d="m7 18 13-10 13 10v14H7V18Z" {...common} /><path d="M16 32v-8h8v8" {...common} /></>}
      {name === 'schedule' && <><rect x="8" y="9" width="24" height="24" rx="4" {...common} /><path d="M13 6v6M27 6v6M8 16h24M20 20v6l4 2" {...common} /></>}
      {name === 'scan' && <><path d="M13 8H9a1 1 0 0 0-1 1v4M27 8h4a1 1 0 0 1 1 1v4M13 32H9a1 1 0 0 1-1-1v-4M27 32h4a1 1 0 0 0 1-1v-4" {...common} /><path d="M13 20h14" {...common} /></>}
    </svg>
  );
}

export function ProfileAvatar() {
  return (
    <svg className="aoben-avatar-art" viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="avatar-bg" x1="8" y1="5" x2="92" y2="95" gradientUnits="userSpaceOnUse"><stop stopColor="#DDEAF3" /><stop offset="1" stopColor="#9EB9CA" /></linearGradient>
        <linearGradient id="avatar-shirt" x1="20" y1="80" x2="80" y2="98" gradientUnits="userSpaceOnUse"><stop stopColor="#587C9A" /><stop offset="1" stopColor="#2F4D68" /></linearGradient>
        <filter id="avatar-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.2" /></filter>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#avatar-bg)" />
      <circle cx="18" cy="19" r="18" fill="#F5D9C4" opacity=".35" filter="url(#avatar-soft)" />
      <path d="M16 100c2-19 15-30 34-30s32 11 34 30H16Z" fill="url(#avatar-shirt)" />
      <ellipse cx="50" cy="43" rx="19" ry="23" fill="#E6B28D" />
      <path d="M31 42c0-21 11-31 24-29 10 1 17 10 15 25-6-7-13-11-22-12-4 8-10 13-17 16Z" fill="#55463F" />
      <path d="M40 44h.01M60 44h.01" stroke="#35404A" strokeWidth="4" strokeLinecap="round" />
      <path d="M45 56c3 2 7 2 10 0" stroke="#9A5D54" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
