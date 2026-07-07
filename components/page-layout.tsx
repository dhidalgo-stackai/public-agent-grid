import { cn } from "@/lib/utils";

export const pageContainerClass = "w-full max-w-[1400px] mx-auto px-14";
export const pageContentScrollClass = "flex flex-1 flex-col overflow-y-auto py-4";
export const pageContentInnerClass =
  "w-full max-w-[1400px] mx-auto px-14 space-y-10 pb-8";

interface PageHeaderProps {
  children: React.ReactNode;
  subRow?: React.ReactNode;
  isScrolledDown?: boolean;
  titleRowClassName?: string;
  className?: string;
}

export function PageHeader({
  children,
  subRow,
  isScrolledDown,
  titleRowClassName = "flex items-center justify-between",
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex shrink-0 flex-col gap-4 border-b border-border py-5 transition-colors",
        isScrolledDown ? "" : "border-transparent",
        className
      )}
    >
      <div className={pageContainerClass}>
        <div className={cn(titleRowClassName, subRow && "mb-5")}>
          {children}
        </div>
        {subRow}
      </div>
    </header>
  );
}
