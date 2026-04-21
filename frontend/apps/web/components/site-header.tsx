import Link from "next/link"
import { Login01Icon } from "@hugeicons/core-free-icons"
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
import { NavUser } from "@/components/nav-user"

export function SiteHeader() {
  const isLoggedIn = false

  const mockUser = {
    name: "Dinh",
    email: "dinh@student.ute.udn.vn",
    avatar: "https://github.com/shadcn.png",
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="container-wrapper px-6 group-has-data-[slot=designer]/layout:max-w-none 3xl:fixed:px-0">
        <div className="flex h-(--header-height) items-center **:data-[slot=separator]:h-4! group-has-data-[slot=designer]/layout:fixed:max-w-none 3xl:fixed:container">
          <MobileNav items={siteConfig.navItems} className="flex lg:hidden" />
          <Button asChild variant="ghost" size="icon" className="hidden size-8 lg:flex">
            <Link href="/">
              <Icons.logo className="size-5" />
              <span className="sr-only">{siteConfig.name}</span>
            </Link>
          </Button>
          <MainNav items={siteConfig.navItems} className="hidden lg:flex" />
          <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
            <Separator orientation="vertical" className="ml-2 hidden lg:block" />
            <GitHubLink />
            <Separator orientation="vertical" className="hidden group-has-data-[slot=designer]/layout:hidden 3xl:flex" />
            <SiteConfig className="hidden 3xl:flex 3xl:group-has-data-[slot=designer]/layout:hidden" />
            <Separator orientation="vertical" />
            <ModeSwitcher />
            <div className="flex items-center gap-2 group-has-data-[slot=designer]/layout:hidden">
              <Separator orientation="vertical" />
              {isLoggedIn ? (
                <NavUser user={mockUser} />
              ) : (
                <Button asChild size="sm" className="h-[31px] rounded-lg">
                  <Link href="/login" className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Login01Icon} className="size-4" />
                    <span>Đăng nhập</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
