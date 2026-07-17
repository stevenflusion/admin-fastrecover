"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { User } from "@/lib/auth"
import { navDestinations, navGroupOrder } from "@/lib/nav"
import {
  GalleryVerticalEndIcon,
  LayoutDashboardIcon,
  Settings2Icon,
} from "lucide-react"

const topLevelIcons: Record<string, React.ReactNode> = {
  "/dashboard": <LayoutDashboardIcon />,
}

const groupIcons: Record<string, React.ReactNode> = {
  Settings: <Settings2Icon />,
}

function buildNavMain() {
  const items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    items?: { title: string; url: string }[]
  }[] = []

  for (const d of navDestinations) {
    if (d.group !== null) continue
    items.push({
      title: d.title,
      url: d.url,
      icon: topLevelIcons[d.url],
    })
  }

  for (const group of navGroupOrder) {
    const children = navDestinations.filter((d) => d.group === group)
    if (children.length === 0) continue
    items.push({
      title: group,
      url: "#",
      icon: groupIcons[group],
      items: children.map((c) => ({ title: c.title, url: c.url })),
    })
  }

  return items
}

const data = {
  teams: [
    {
      name: "SH Fast Recover",
      logo: <GalleryVerticalEndIcon />,
      plan: "Administrador",
    },
  ],
}

const FALLBACK_AVATAR = "/avatars/shadcn.jpg"

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: User | null
}) {
  const navMainItems = buildNavMain()

  const userProps = user
    ? {
        name: user.name_admin_users,
        email: user.email_admin_users,
        avatar: FALLBACK_AVATAR,
      }
    : {
        name: "Invitado",
        email: "",
        avatar: FALLBACK_AVATAR,
      }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userProps} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
