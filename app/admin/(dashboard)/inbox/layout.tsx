export default function InboxLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Override parent p-8 padding for full-bleed 3-column layout
    return (
        <div className="-m-8 h-[calc(100vh)] flex flex-col">
            {children}
        </div>
    )
}
