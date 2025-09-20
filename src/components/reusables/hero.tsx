interface HeroSectionProps {
    title?: string;
    description?: string;
    subtitle?: string;
}
const HeroSection = ({
    title = 'Welcome to My Digital Attic',
    description = 'A curated collection of my thoughts, notes, and curiosities across various domains.',
    subtitle = 'Where I store my notes and curiosities'
}: HeroSectionProps) => {
    return (
        <section className="relative  w-full flex items-center justify-center">
            {/* Background with grid pattern */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundColor: "transparent",
                    backgroundImage: `
              linear-gradient(to right, rgba(107, 76, 76, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(107, 76, 76, 0.08) 1px, transparent 1px)
            `,
                    backgroundSize: "24px 24px",
                    WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 20%, #000 40%, transparent 100%)",
                    maskImage: "radial-gradient(ellipse 80% 70% at 50% 20%, #000 40%, transparent 100%)",
                }}
            />

            {/* Content */}
            <div className="relative py-16 z-10 container mx-auto px-4 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary mb-8 text-balance leading-tight">
                        {title}
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-pretty max-w-2xl mx-auto">
                        {description}
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                        <div className="w-12 h-px bg-border"></div>
                        <span className="font-serif italic">
                            {subtitle}
                        </span>
                        <div className="w-12 h-px bg-border"></div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
