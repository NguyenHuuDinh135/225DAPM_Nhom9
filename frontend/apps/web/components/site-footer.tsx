import { siteConfig } from "@/lib/config"

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background z-20">
      <div className="container mx-auto px-4 xl:px-6">
        <div className="flex flex-col md:flex-row h-auto md:h-14 py-4 md:py-0 items-center justify-between text-xs sm:text-sm text-muted-foreground">
          <div className="text-center md:text-left mb-2 md:mb-0">
            &copy; {currentYear} {siteConfig.name}
          </div>
          
          <div className="text-center md:text-right">
            Thiết kế và xây dựng bởi{" "}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              Đại học Sư phạm Kỹ thuật Đà Nẵng
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
