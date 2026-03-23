import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";

interface Props {
  title: string;
  href?: string;
  description: string;
  dates: string;
  tags: readonly string[];
  image?: string;
  video?: string;
  links?: readonly {
    icon: React.ReactNode;
    type: string;
    href: string;
  }[];
  className?: string;
}

export function ProjectCard({
  title,
  href,
  description,
  dates,
  tags,
  image,
  video,
  links,
  className,
}: Props) {
  return (
    <div className="relative rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-out h-full flex flex-col overflow-hidden border">
      <Link href={href || "#"} className={cn("block", className)}>
        <div className="flex h-50 items-center justify-center bg-background">
          {video ? (
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover object-top"
            />
          ) : image ? (
            <Image
              src={image}
              alt={title}
              width={500}
              height={300}
              className="max-h-full w-auto object-cover"
            />
          ) : (
            <div className="h-full w-full bg-muted rounded-lg" />
          )}
        </div>
      </Link>
      <Card className="border-none flex-1 flex flex-col rounded-xl relative -mt-3">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <time className="font-sans text-xs text-muted-foreground">{dates}</time>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 gap-2">
          <Markdown className="prose max-w-full text-pretty font-sans text-xs text-muted-foreground dark:prose-invert">
            {description}
          </Markdown>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-auto pt-2">
              {tags.map((tag) => (
                <Badge
                  className="px-1 py-0 text-[10px]"
                  variant="outline"
                  key={tag}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-row flex-wrap gap-2">
          {links && links.length > 0 &&
            links.map((link, idx) => (
              <Link href={link.href} key={idx} target="_blank">
                <Button size="sm" className="flex gap-2">
                  {link.icon}
                  {link.type}
                </Button>
              </Link>
            ))}
        </CardFooter>
      </Card>
    </div>
  );
}
