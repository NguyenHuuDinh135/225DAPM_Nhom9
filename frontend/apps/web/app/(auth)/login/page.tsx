"use client"

import { TreePine, Leaf } from "lucide-react"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh grid-cols-1 lg:grid-cols-2">
      {/* Left column - Visual branding (hidden on mobile) */}
      <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-green-700 via-emerald-600 to-teal-700">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Floating leaves decoration */}
        <div className="absolute top-20 left-16 opacity-20">
          <Leaf className="size-24 text-white rotate-[-30deg]" />
        </div>
        <div className="absolute bottom-32 right-20 opacity-15">
          <Leaf className="size-32 text-white rotate-[45deg]" />
        </div>
        <div className="absolute top-1/3 right-12 opacity-10">
          <TreePine className="size-40 text-white" />
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
          <div className="flex items-center justify-center size-28 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <TreePine className="size-14 text-white" />
          </div>

          <div className="space-y-4 max-w-md">
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
              Hệ thống Quản lý Cây xanh
            </h1>
            <p className="text-lg font-medium text-white/80 leading-relaxed">
              Thành phố Đà Nẵng
            </p>
            <div className="h-px w-16 bg-white/30 mx-auto" />
            <p className="text-sm text-white/60 leading-relaxed italic">
              Giám sát, bảo trì và phát triển hệ thống cây xanh đô thị hiện đại, thông minh và bền vững.
            </p>
          </div>
        </div>

        {/* Bottom attribution */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-xs text-white/40 font-medium">Nhóm 9 - 225DAPM - Đại học Bách khoa Đà Nẵng</p>
        </div>
      </div>

      {/* Right column - Login form */}
      <div className="flex flex-col items-center justify-center bg-background p-6 md:p-10">
        {/* Mobile logo (visible only on small screens) */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex items-center justify-center size-12 rounded-xl bg-green-600 shadow-lg shadow-green-600/20">
            <TreePine className="size-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-foreground tracking-tight">Quản lý Cây xanh</h2>
            <p className="text-xs text-muted-foreground font-medium">Đà Nẵng</p>
          </div>
        </div>

        <div className="w-full max-w-sm md:max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
