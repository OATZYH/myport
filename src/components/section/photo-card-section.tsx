"use client";
import React, { useEffect, useRef } from "react";
import { photoCards as cards } from "@/data/photo";
import { BlurFade } from "@/components/magicui/blur-fade";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogDescription,
  MorphingDialogImage,
} from "@/components/ui/morphing-dialog";

function Card3D({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let rect: DOMRect;
    let centerX: number;
    let centerY: number;

    const animate = () => {
      const relativeX = lastMousePosition.current.x - centerX;
      const relativeY = lastMousePosition.current.y - centerY;
      card.style.transform = `perspective(1000px) rotateX(${-relativeY * 0.035}deg) rotateY(${relativeX * 0.035}deg) scale3d(1.025, 1.025, 1.025)`;
      card.style.boxShadow = "0 10px 35px rgba(0, 0, 0, 0.2)";
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseEnter = () => {
      rect = card.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
      card.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";
      animate();
    };

    const handleMouseLeave = () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
      card.style.boxShadow = "none";
      card.style.transition = "transform 0.5s ease, box-shadow 0.5s ease";
    };

    // Reset before the morphing dialog animation starts
    const handleMouseDown = () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
      card.style.boxShadow = "none";
      card.style.transition = "transform 0.15s ease, box-shadow 0.15s ease";
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);
    card.addEventListener("mousedown", handleMouseDown);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
      card.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return <div className="rounded-lg" ref={cardRef}>{children}</div>;
}

export function PhotoCard() {
  return (
    <div className="columns-2 gap-2 sm:columns-3">
      {cards.map((card, index) => (
        <BlurFade key={card.src} delay={0.25 + index * 0.05} inView>
          <MorphingDialog
            transition={{ type: "spring", bounce: 0.05, duration: 0.25 }}
          >
            <Card3D>
              <MorphingDialogTrigger
                style={{ borderRadius: "12px" }}
                className="group p-2 w-full mb-2"
              >
                <MorphingDialogImage
                  src={card.src}
                  alt={card.title}
                  className="size-full rounded-lg object-contain object-top"
                />
                <div className="flex grow px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <MorphingDialogTitle disableLayoutAnimation className="text-card-foreground text-sm text-left text-bold">
                    {card.title}
                  </MorphingDialogTitle>
                </div>
              </MorphingDialogTrigger>
            </Card3D>
            <MorphingDialogContainer>
              <MorphingDialogContent
                style={{ borderRadius: "24px" }}
                className="pointer-events-auto relative flex w-full max-w-125 h-full md:h-fit md:max-h-[90%] flex-col overflow-hidden border border-zinc-950/10 bg-white dark:bg-neutral-900"
              >
                <MorphingDialogImage
                  src={card.src}
                  alt={card.title}
                  className="w-full h-80 object-cover object-center"
                />
                <div className="p-4">
                  <MorphingDialogTitle className="font-medium text-neutral-700 dark:text-neutral-200 text-base">
                    {card.title}
                  </MorphingDialogTitle>
                  <MorphingDialogSubtitle disableLayoutAnimation className="text-neutral-600 dark:text-neutral-400 text-base">
                    {card.description}
                  </MorphingDialogSubtitle>
                  <MorphingDialogDescription
                    className="pt-4 text-card-foreground text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                    variants={{
                      initial: { opacity: 0, scale: 0.8, y: 100 },
                      animate: { opacity: 1, scale: 1, y: 0 },
                      exit: { opacity: 0, scale: 0.8, y: 100 },
                    }}
                    disableLayoutAnimation
                  >
                    {typeof card.content === "function"
                      ? card.content()
                      : card.content}
                  </MorphingDialogDescription>
                </div>
                <MorphingDialogClose className="text-zinc-50" />
              </MorphingDialogContent>
            </MorphingDialogContainer>
          </MorphingDialog>
        </BlurFade>
      ))}
    </div>
  );
}
