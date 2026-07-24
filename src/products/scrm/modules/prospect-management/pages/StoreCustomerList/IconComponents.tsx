/**
 * 内联 SVG 图标组件
 * 单色线性风格，统一 14-16px，通过 currentColor 继承颜色
 * 不依赖 @ant-design/icons 或其他图标库
 */
import type { CSSProperties } from 'react';

interface IconProps {
  style?: CSSProperties;
  size?: number;
}

const defaultStyle = (size: number): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 0,
  width: size,
  height: size,
  flexShrink: 0,
});

/** 首页 */
export function NavHomeIcon({ style, size = 14 }: IconProps) {
  return (
    <span style={{ ...defaultStyle(size), ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </span>
  );
}

/** 预约/日历 */
export function NavCalendarIcon({ style, size = 14 }: IconProps) {
  return (
    <span style={{ ...defaultStyle(size), ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    </span>
  );
}

/** 品项/商品 */
export function NavShopIcon({ style, size = 14 }: IconProps) {
  return (
    <span style={{ ...defaultStyle(size), ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    </span>
  );
}

/** 收银/金钱 */
export function NavDollarIcon({ style, size = 14 }: IconProps) {
  return (
    <span style={{ ...defaultStyle(size), ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    </span>
  );
}

/** 门店人员/团队 */
export function NavTeamIcon({ style, size = 14 }: IconProps) {
  return (
    <span style={{ ...defaultStyle(size), ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    </span>
  );
}

/** 订单/文件 */
export function NavFileIcon({ style, size = 14 }: IconProps) {
  return (
    <span style={{ ...defaultStyle(size), ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    </span>
  );
}

/** 门店/建筑 */
export function NavStoreIcon({ style, size = 14 }: IconProps) {
  return (
    <span style={{ ...defaultStyle(size), ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </span>
  );
}

/** 客户/联系人 */
export function NavContactsIcon({ style, size = 14 }: IconProps) {
  return (
    <span style={{ ...defaultStyle(size), ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </span>
  );
}

/** 潜客管理/目标 */
export function NavServiceIcon({ style, size = 14 }: IconProps) {
  return (
    <span style={{ ...defaultStyle(size), ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    </span>
  );
}

/** 用户头像 */
export function UserIcon({ style, size = 16 }: IconProps) {
  return (
    <span style={{ ...defaultStyle(size), ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </span>
  );
}

/** 折叠菜单/更多 */
export function MenuIcon({ style, size = 16 }: IconProps) {
  return (
    <span style={{ ...defaultStyle(size), ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </span>
  );
}

/** 二维码 */
export function QrcodeIcon({ style, size = 16 }: IconProps) {
  return (
    <span style={{ ...defaultStyle(size), ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
        <line x1="14" y1="14" x2="14" y2="14.01"/>
        <line x1="18" y1="14" x2="18" y2="14.01"/>
        <line x1="14" y1="18" x2="14" y2="18.01"/>
        <line x1="18" y1="18" x2="18" y2="18.01"/>
        <line x1="18" y1="21" x2="21" y2="18"/>
        <line x1="14" y1="21" x2="21" y2="21"/>
      </svg>
    </span>
  );
}

/** 退出 */
export function LogoutIcon({ style, size = 16 }: IconProps) {
  return (
    <span style={{ ...defaultStyle(size), ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    </span>
  );
}

/** 操作下拉小箭头 */
export function CaretDownIcon({ style, size = 10 }: IconProps) {
  return (
    <span style={{ ...defaultStyle(size), ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </span>
  );
}

/** 关闭/折叠导航 */
export function FoldIcon({ style, size = 16 }: IconProps) {
  return (
    <span style={{ ...defaultStyle(size), ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </span>
  );
}
