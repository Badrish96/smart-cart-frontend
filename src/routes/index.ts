/**
 * Centralised route definitions for SmartCart.
 * All app paths are derived from these helpers — never hardcode /${lang}/… in components.
 */

export const ROUTES = {
  /** Public */
  home: (lang: string) => `/${lang}/home`,
  products: (lang: string) => `/${lang}/products`,
  contact: (lang: string) => `/${lang}/contact`,
  productDetail: (lang: string, id: string) => `/${lang}/products/${id}`,

  /** Auth */
  login: (lang: string) => `/${lang}/login`,
  register: (lang: string) => `/${lang}/register`,
  forgotPassword: (lang: string) => `/${lang}/forgot-password`,
  resetPassword: (lang: string, token?: string) =>
    token
      ? `/${lang}/reset-password?token=${encodeURIComponent(token)}`
      : `/${lang}/reset-password`,

  /** Protected — user */
  profile: (lang: string) => `/${lang}/profile`,
  wishlist: (lang: string) => `/${lang}/wishlist`,
  cart: (lang: string) => `/${lang}/cart`,
  checkout: (lang: string) => `/${lang}/checkout`,
  orders: (lang: string) => `/${lang}/orders`,
  orderDetail: (lang: string, id: string) => `/${lang}/orders/${id}`,

  /** Protected — admin */
  adminDashboard: (lang: string) => `/${lang}/admin`,
  adminAddProduct: (lang: string) => `/${lang}/admin/add-product`,
  adminProducts: (lang: string) => `/${lang}/admin/products`,
  adminProfile: (lang: string) => `/${lang}/admin/profile`,
} as const

export type RouteKey = keyof typeof ROUTES
