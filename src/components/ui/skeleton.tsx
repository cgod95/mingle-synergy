import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

function Skeleton({
  className,
  ...props
}: Omit<HTMLMotionProps<"div">, "ref">) {
  return (
    <motion.div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      {...props}
    />
  )
}

// Card skeleton for venue and user cards
function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}

// User avatar skeleton
function AvatarSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[160px]" />
      </div>
    </div>
  )
}

// List skeleton for matches/messages
function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Text skeleton for content loading
function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )} 
        />
      ))}
    </div>
  )
}

// Grid skeleton for venue/user grids
function GridSkeleton({ cols = 2, rows = 3 }: { cols?: number; rows?: number }) {
  return (
    <div 
      className="grid gap-4"
      style={{ 
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` 
      }}
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export { 
  Skeleton, 
  CardSkeleton, 
  AvatarSkeleton, 
  ListSkeleton, 
  TextSkeleton, 
  GridSkeleton 
}
