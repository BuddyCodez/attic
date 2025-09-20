
import { Suspense } from "react"
import Header from "~/components/reusables/header"
import { Books } from "~/components/server/books"

export default function LibraryPage() {

    return (
        <div className="min-h-screen bg-background ">
            {/* Header */}
            <Header />

            {/* Hero Section */}
            <section className="py-16 bg-background vintage-paper">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl literary-heading font-bold text-primary mb-6 text-balance">
                            The Library
                        </h1>
                        <p className="text-xl literary-body text-muted-foreground mb-8 text-pretty">
                            An ever-growing collection of books, thoughts, and literary adventures spanning countless genres and years
                            of reading.
                        </p>
                        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                            <div className="w-8 h-px bg-border"></div>
                            <span className="literary-accent">
                                statis
                                {/* {statusCounts.read.toLocaleString()} books read • {statusCounts["currently-reading"]} in progress */}
                            </span>
                            <div className="w-8 h-px bg-border"></div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Books Grid */}
            <section className="pb-16 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        {/* Books List */}
                        {/* Currently Reading */}
                        <h2 className="text-lg font-bold text-primary mb-4">Currently Reading</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Suspense fallback={<Books.Fallback />}>
                                <Books type="CURRENTLY_READING" />
                            </Suspense>
                        </div>
                        {/* Read */}
                        <h2 className="text-lg font-bold text-primary my-4">Read</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Suspense fallback={<Books.Fallback />}>
                                <Books type="READ" />
                            </Suspense>
                        </div>
                        {/* Want to Read */}
                        <h2 className="text-lg font-bold text-primary my-4">Want to Read</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Suspense fallback={<Books.Fallback />}>
                                <Books type="WANT_TO_READ" />
                            </Suspense>
                        </div>

                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-border bg-card/50 vintage-paper">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-muted-foreground literary-body">
                        © 2024 The Digital Attic. A space for endless curiosity and reflection.
                    </p>
                </div>
            </footer>
        </div>
    )
}
