"use client";

import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import { DATA } from "@/data/resume";
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";
import { useRouter } from "next/navigation";

export function AppleStyleDock() {
  const router = useRouter();

  const handleNavigate = (href: string) => {
    if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      router.push(href);
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mb-4">
      <div className="pointer-events-auto relative">
        <Dock className="items-end pb-3 bg-background/50 border backdrop-blur-lg dark:bg-background/50">
          {DATA.navbar.map((item) => (
            <DockItem
              key={item.href}
              onClick={() => handleNavigate(item.href)}
              className="aspect-square rounded-full bg-muted"
            >
              <DockLabel>{item.label}</DockLabel>
              <DockIcon>
                <item.icon className={`h-full w-full text-muted-foreground transition-colors ${item.hoverColor}`} />
              </DockIcon>
            </DockItem>
          ))}
          {Object.entries(DATA.contact.social)
            .filter(([, social]) => social.navbar)
            .map(([name, social]) => (
              <DockItem
                key={name}
                onClick={() => handleNavigate(social.url)}
                className="aspect-square rounded-full bg-muted"
              >
                <DockLabel>{name}</DockLabel>
                <DockIcon>
                  <social.icon className={`h-full w-full text-muted-foreground transition-colors ${social.hoverColor}`} />
                </DockIcon>
              </DockItem>
            ))}
          <DockItem className="aspect-square rounded-full bg-muted">
            <DockLabel>Theme</DockLabel>
            <DockIcon>
              <AnimatedThemeToggler
                className="h-full w-full flex items-center justify-center text-muted-foreground [&>svg]:h-full [&>svg]:w-full"
                onClickCapture={(e) => {
                  const dockItem = (e.currentTarget as HTMLElement).closest('[role="button"]') as HTMLElement;
                  setTimeout(() => dockItem?.blur(), 0);
                }}
              />
            </DockIcon>
          </DockItem>
        </Dock>
      </div>
    </div>
  );
}
