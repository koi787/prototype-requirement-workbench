export interface AobenAccountDisplay {
  username: string;
  avatarSrc: string;
}

/** Stable product-layer account display fixture; it is not vendor identity data. */
export const AOBEN_ACCOUNT_FIXTURE: AobenAccountDisplay = {
  username: '奥本用户',
  avatarSrc: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" rx="32" fill="%23DDEAF3"/%3E%3Ccircle cx="32" cy="27" r="12" fill="%23E6B28D"/%3E%3Cpath d="M19 27c1-12 8-18 15-18 9 0 14 7 13 18-4-5-9-8-15-8-3 4-7 7-13 8Z" fill="%2355463F"/%3E%3Cpath d="M12 64c2-13 10-20 20-20s18 7 20 20H12Z" fill="%23587C9A"/%3E%3C/svg%3E',
};
