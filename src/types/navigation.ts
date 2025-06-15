// types/navigation.ts
/**
 * Navigation item structure
 */
export type NavItem = {
  name: string
  href?: string
  icon?: string
  subItems?: SubNavItem[]
  requiresAuth?: boolean
}

/**
 * Sub-navigation item
 */
export type SubNavItem = {
  name: string
  href: string
  icon?: string
  requiresAuth?: boolean
}

/**
 * Layout configuration
 */
export type LayoutConfig = {
  showHeader?: boolean
  showSidebar?: boolean
  showFooter?: boolean
  padded?: boolean
}