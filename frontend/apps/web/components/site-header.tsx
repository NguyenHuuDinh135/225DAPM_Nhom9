"use client"

import NextLink from "next/link"
import { Login01Icon, DashboardCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { siteConfig } from "@/lib/config"
import { GitHubLink } from "@/components/github-link"
import { Icons } from "@/components/icons"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { ModeSwitcher } from "@/components/mode-switcher"
import { SiteConfig } from "@/components/site-config"
import { Separator } from "@workspace/ui/components/separator"
import { Button } from "@workspace/ui/components/button"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/hooks/use-auth"

export function SiteHeader() {
  const { user, isLoading } = useAuth()
  const isLoggedIn = !!user

  return (
    <header className="sticky top-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-7xl glass rounded-2xl">
      <div className="container-wrapper px-6">
        <div className="flex h-16 items-center gap-4">
          <MobileNav items={siteConfig.navItems} className="flex lg:hidden" />
          <Button asChild variant="ghost" size="icon" className="hidden size-8 lg:flex">
            <NextLink href="/">
              <Icons.logo className="size-5" />
              <span className="sr-only">{siteConfig.name}</span>
            </NextLink>
          </Button>
          <MainNav items={siteConfig.navItems} className="hidden lg:flex" />
          <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
            <ModeSwitcher />
            <div className="flex items-center gap-2">
              <Separator orientation="vertical" className="h-4" />
              {!isLoading && (
                isLoggedIn ? (
                  <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
                      <NextLink href={user.role === "GiamDoc" ? "/giamdoc" : user.role === "DoiTruong" ? "/doitruong" : "/nhanvien"}>
                        <HugeiconsIcon icon={DashboardCircleIcon} className="size-4" />
                        <span className="hidden sm:inline">Quản trị</span>
                      </NextLink>
                    </Button>
                    <UserNav user={{
                      name: user.name || user.email,
                      email: user.email,
                      avatar: "",
                      role: user.role
                    }} />
                  </div>
                ) : (
                  <Button asChild size="sm" className="h-8 rounded-lg px-4">
                    <NextLink href="/login" className="flex items-center gap-1.5">
                      <HugeiconsIcon icon={Login01Icon} className="size-4" />
                      <span>Đăng nhập</span>
                    </NextLink>
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
