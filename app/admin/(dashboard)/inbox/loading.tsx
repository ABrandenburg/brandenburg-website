export default function InboxLoading() {
    return (
        <div className="flex h-full">
            {/* Contact list skeleton */}
            <div className="w-80 border-r border-slate-200 bg-white">
                <div className="p-4 border-b border-slate-200">
                    <div className="h-9 bg-slate-100 rounded-md animate-pulse" />
                </div>
                <div className="p-2 space-y-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                            <div className="h-10 w-10 rounded-full bg-slate-100 animate-pulse flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3" />
                                <div className="h-3 bg-slate-100 rounded animate-pulse w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Thread skeleton */}
            <div className="flex-1 flex items-center justify-center bg-slate-50">
                <p className="text-slate-400 text-sm">Select a conversation</p>
            </div>

            {/* Details skeleton */}
            <div className="w-80 border-l border-slate-200 bg-white hidden xl:block">
                <div className="p-4 space-y-4">
                    <div className="h-6 bg-slate-100 rounded animate-pulse w-1/2" />
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                    </div>
                </div>
            </div>
        </div>
    )
}
