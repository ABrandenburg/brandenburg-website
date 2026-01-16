export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        {/* Spinner */}
        <div className="inline-block w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mb-4" />
        
        {/* Text */}
        <p className="text-text-muted font-medium">Loading...</p>
      </div>
    </div>
  )
}
