const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-fade-in">
      {/* Status badge skeleton */}
      <div className="h-6 w-20 skeleton mb-4"></div>
      
      {/* Title skeleton */}
      <div className="h-6 skeleton mb-2"></div>
      <div className="h-6 skeleton w-3/4 mb-4"></div>
      
      {/* Category skeleton */}
      <div className="h-4 skeleton w-32 mb-6"></div>
      
      {/* Odds skeleton */}
      <div className="mb-4">
        <div className="h-4 skeleton w-24 mb-2"></div>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="h-6 skeleton mb-1"></div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="skeleton h-2.5 rounded-full w-1/2"></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="h-6 skeleton mb-1"></div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="skeleton h-2.5 rounded-full w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pool and time skeleton */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div>
          <div className="h-3 skeleton w-16 mb-1"></div>
          <div className="h-5 skeleton w-24"></div>
        </div>
        <div>
          <div className="h-3 skeleton w-20 mb-1"></div>
          <div className="h-5 skeleton w-16"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;

