const HeroSection = () => {
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
                        Welcome to My Digital Attic
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-pretty max-w-2xl mx-auto">
                        A curated collection of my thoughts, reads, and discoveries.
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                        <div className="w-12 h-px bg-border"></div>
                        <span className="font-serif italic">Where I store my notes and curiosities</span>
                        <div className="w-12 h-px bg-border"></div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
