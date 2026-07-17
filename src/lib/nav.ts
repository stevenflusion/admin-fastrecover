/**
 * Single source of truth for admin-panel routes.
 */

export type NavDestination = {
  title: string
  url: string
  group: string | null
}

export const navDestinations: NavDestination[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    group: null,
  },
  {
    title: "Leads",
    url: "/dashboard/leads",
    group: null,
  },
  {
    title: "Tema",
    url: "/dashboard/settings/tema",
    group: "Settings",
  },
]

export const navGroupOrder: string[] = [
  "Settings",
]
