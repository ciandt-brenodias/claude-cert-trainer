interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 ${className}`}>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}
