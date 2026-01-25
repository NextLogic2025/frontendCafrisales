import React from 'react'
import { cn } from '@/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'line' | 'circle' | 'rect' | 'card'
  width?: string | number
  height?: string | number
}

const variantDefaults = {
  line: { height: '1rem' },
  circle: { width: '2.5rem', height: '2.5rem' },
  rect: { height: '5rem' },
  card: { height: '12.5rem' },
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'line', width, height, className, style, ...props }, ref) => {
    const defaultSize = variantDefaults[variant]

    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-neutral-200',
          variant === 'line' && 'rounded-md',
          variant === 'circle' && 'rounded-full',
          (variant === 'rect' || variant === 'card') && 'rounded-xl',
          className
        )}
        style={{
          width: width || defaultSize.width || '100%',
          height: height || defaultSize.height,
          ...style,
        }}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

export const SkeletonCard = ({ className }: { className?: string }) => {
  return (
    <div className={cn('space-y-3 p-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="line" width="70%" height={16} />
          <Skeleton variant="line" width="50%" height={12} />
        </div>
      </div>
      <Skeleton variant="rect" height={120} />
      <div className="space-y-2">
        <Skeleton variant="line" width="100%" />
        <Skeleton variant="line" width="90%" />
        <Skeleton variant="line" width="80%" />
      </div>
    </div>
  )
}
