"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BackButtonProps
  extends Omit<ButtonProps, "variant" | "size" | "asChild" | "type"> {
  href?: string;
  label?: React.ReactNode;
}

export const BackButton = React.forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ href, label = "Volver", className, onClick, ...props }, ref) => {
    const router = useRouter();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented && !href) {
        router.back();
      }
    };

    const content = (
      <>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {label}
      </>
    );

    if (href) {
      return (
        <Button
          ref={ref}
          asChild
          variant="ghost"
          size="sm"
          className={cn("-ml-2", className)}
          onClick={handleClick}
          {...props}
        >
          <Link href={href} className="inline-flex items-center">
            {content}
          </Link>
        </Button>
      );
    }

    return (
      <Button
        ref={ref}
        type="button"
        variant="ghost"
        size="sm"
        className={cn("-ml-2", className)}
        onClick={handleClick}
        {...props}
      >
        {content}
      </Button>
    );
  },
);
BackButton.displayName = "BackButton";
