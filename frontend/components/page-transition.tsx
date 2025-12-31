"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [isTransitioning, setIsTransitioning] = useState(false)

    // Trigger animation on pathname change
    useEffect(() => {
        setIsTransitioning(true)
        const timeout = setTimeout(() => setIsTransitioning(false), 300) // Match animation duration
        return () => clearTimeout(timeout)
    }, [pathname])

    return (
        <div key={pathname} className="animate-fade-in w-full h-full">
            {children}
        </div>
    )
}
