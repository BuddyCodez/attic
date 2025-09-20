import Link from 'next/link'
import React from 'react'
import { ThemeToggle } from './theme-toggle';
interface HeaderProps {
    title?: string;
}
export default function Header({ title = "Udit's Attic" }: HeaderProps) {
    const LinkClass = "text-muted-foreground hover:text-primary bg-white/10 backdrop-blur-xl border border-white/10 rounded-md px-2 py-1 transition-all";
    return (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 ">
            <div className="container mx-auto px-4 py-4">
                <nav className="flex items-center justify-between">
                    <h1 className="text-2xl font-serif font-bold text-primary">{title}</h1>
                    <div className="hidden md:flex items-center space-x-2">
                        <Link href="/shelves" className={LinkClass}>
                            Shelves
                        </Link>
                        <Link href="/library" className={LinkClass}>
                            Library
                        </Link>
                        <Link href="/quotes" className={LinkClass}>
                            Quotes
                        </Link>
                        <Link href="#about" className={LinkClass}>
                            About This Attic
                        </Link>
                        <ThemeToggle />
                    </div>
                </nav>
            </div>
        </header>
    )
}
