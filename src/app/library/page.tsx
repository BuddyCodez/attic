"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Star, Calendar, User, TrendingUp, Heart, MessageCircle } from "lucide-react"
import { ThemeToggle } from "~/components/reusables/theme-toggle"
import { FilterBar } from "~/components/reusables/filters"
import { Pagination } from "~/components/reusables/pagination"
import Link from "next/link"
import Image from "next/image"
import Header from "~/components/reusables/header"

const generateBooks = () => {
    const genres = [
        "fiction",
        "non-fiction",
        "philosophy",
        "psychology",
        "science",
        "history",
        "biography",
        "self-help",
        "technology",
        "business",
        "art",
        "poetry",
        "mystery",
        "thriller",
        "romance",
        "fantasy",
        "sci-fi",
        "memoir",
        "health",
        "spirituality",
        "politics",
        "economics",
        "education",
        "travel",
    ]

    const authors = [
        "Morgan Housel",
        "James Clear",
        "Matt Haig",
        "Cal Newport",
        "Ryan Holiday",
        "Yuval Noah Harari",
        "Malcolm Gladwell",
        "Brené Brown",
        "Jordan Peterson",
        "Naval Ravikant",
        "Tim Ferriss",
        "Seth Godin",
        "Daniel Kahneman",
        "Nassim Nicholas Taleb",
        "Ray Dalio",
        "Angela Duckworth",
        "Carol Dweck",
        "Viktor Frankl",
        "Marcus Aurelius",
        "Seneca",
        "Epictetus",
        "Aristotle",
    ]

    const titles = [
        "The Psychology of Money",
        "Atomic Habits",
        "The Midnight Library",
        "Digital Minimalism",
        "The Obstacle Is the Way",
        "Sapiens",
        "Outliers",
        "Daring Greatly",
        "12 Rules for Life",
        "The Almanack",
        "The 4-Hour Workweek",
        "Purple Cow",
        "Thinking, Fast and Slow",
        "The Black Swan",
        "Principles",
        "Grit",
        "Mindset",
        "Man's Search for Meaning",
        "Meditations",
    ]

    const books = []
    const statuses = ["read", "currently-reading", "want-to-read"]

    for (let i = 0; i < 1247; i++) {
        const randomGenres = genres.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1)
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const daysAgo = Math.floor(Math.random() * 1095)
        const rating = status === "read" ? Math.floor(Math.random() * 5) + 1 : null
        const progress = status === "currently-reading" ? Math.floor(Math.random() * 90) + 10 : status === "read" ? 100 : 0

        books.push({
            id: i + 1,
            title: titles[Math.floor(Math.random() * titles.length)] + (i > 18 ? ` Vol. ${Math.floor(i / 19) + 1}` : ""),
            author: authors[Math.floor(Math.random() * authors.length)],
            status,
            rating,
            progress,
            genres: randomGenres,
            dateAdded: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
            dateFinished:
                status === "read" ? new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000) : null,
            pages: Math.floor(Math.random() * 400) + 100,
            notes: `Insightful exploration of ${randomGenres[0]} with practical applications. The author's perspective on ${randomGenres[1] || "human nature"} offers valuable insights for personal growth and understanding.`,
            likes: Math.floor(Math.random() * 200) + 5,
            comments: Math.floor(Math.random() * 30) + 1,
            views: Math.floor(Math.random() * 1000) + 50,
            cover:
                i < 5
                    ? `/book-cover-psychology-of-money.jpg`
                    : `/placeholder.svg?height=180&width=120&query=book cover ${randomGenres[0]}`,
        })
    }
    return books
}

export default function LibraryPage() {
    const allBooks = useMemo(() => generateBooks(), [])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [sortBy, setSortBy] = useState("recent")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 12

    const allGenres = useMemo(() => {
        const genres = new Set<string>()
        allBooks.forEach((book) => book.genres.forEach((genre) => genres.add(genre)))
        return Array.from(genres).sort()
    }, [allBooks])

    const filteredAndSortedBooks = useMemo(() => {
        const filtered = allBooks.filter((book) => {
            const matchesSearch =
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.genres.some((genre) => genre.toLowerCase().includes(searchTerm.toLowerCase()))

            const matchesGenres = selectedTags.length === 0 || selectedTags.some((genre) => book.genres.includes(genre))

            const matchesStatus = selectedStatus === "all" || book.status === selectedStatus

            return matchesSearch && matchesGenres && matchesStatus
        })

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "recent":
                    return b.dateAdded.getTime() - a.dateAdded.getTime()
                case "oldest":
                    return a.dateAdded.getTime() - b.dateAdded.getTime()
                case "rating":
                    return (b.rating || 0) - (a.rating || 0)
                case "title":
                    return a.title.localeCompare(b.title)
                case "author":
                    return a.author.localeCompare(b.author)
                case "popular":
                    return b.views - a.views
                default:
                    return 0
            }
        })

        return filtered
    }, [allBooks, searchTerm, selectedTags, selectedStatus, sortBy])

    const totalPages = Math.ceil(filteredAndSortedBooks.length / itemsPerPage)
    const paginatedBooks = filteredAndSortedBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleTagToggle = (tag: string) => {
        setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
        setCurrentPage(1)
    }

    const handleSearchChange = (term: string) => {
        setSearchTerm(term)
        setCurrentPage(1)
    }

    const handleSortChange = (sort: string) => {
        setSortBy(sort)
        setCurrentPage(1)
    }

    const sortOptions = [
        { value: "recent", label: "Recently Added" },
        { value: "oldest", label: "Oldest First" },
        { value: "rating", label: "Highest Rated" },
        { value: "title", label: "Title A-Z" },
        { value: "author", label: "Author A-Z" },
        { value: "popular", label: "Most Popular" },
    ]

    const statusCounts = useMemo(() => {
        return {
            all: allBooks.length,
            read: allBooks.filter((b) => b.status === "read").length,
            "currently-reading": allBooks.filter((b) => b.status === "currently-reading").length,
            "want-to-read": allBooks.filter((b) => b.status === "want-to-read").length,
        }
    }, [allBooks])

    const currentlyReading = allBooks.filter((book) => book.status === "currently-reading").slice(0, 3)
    const recentlyFinished = allBooks.filter((book) => book.status === "read").slice(0, 6)

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
                                {statusCounts.read.toLocaleString()} books read • {statusCounts["currently-reading"]} in progress
                            </span>
                            <div className="w-8 h-px bg-border"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Status Filter Tabs */}
            <section className="py-8 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-wrap gap-2 mb-6 justify-center">
                            {[
                                { key: "all", label: "All Books", count: statusCounts.all },
                                { key: "read", label: "Read", count: statusCounts.read },
                                { key: "currently-reading", label: "Currently Reading", count: statusCounts["currently-reading"] },
                                { key: "want-to-read", label: "Want to Read", count: statusCounts["want-to-read"] },
                            ].map((status) => (
                                <Button
                                    key={status.key}
                                    variant={selectedStatus === status.key ? "default" : "outline"}
                                    onClick={() => {
                                        setSelectedStatus(status.key)
                                        setCurrentPage(1)
                                    }}
                                    className="literary-accent"
                                >
                                    {status.label} ({status.count.toLocaleString()})
                                </Button>
                            ))}
                        </div>

                        {/* Filter Bar */}
                        <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-border">
                            <FilterBar
                                searchTerm={searchTerm}
                                onSearchChange={handleSearchChange}
                                selectedTags={selectedTags}
                                onTagToggle={handleTagToggle}
                                availableTags={allGenres}
                                sortBy={sortBy}
                                onSortChange={handleSortChange}
                                sortOptions={sortOptions}
                                totalCount={allBooks.length}
                                filteredCount={filteredAndSortedBooks.length}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Books Grid */}
            <section className="pb-16 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedBooks.map((book, index) => (
                                <Card key={book.id} className="paper-card hover-lift group p-2">
                                    <CardContent className="p-4">
                                        <div className="flex gap-4 mb-4">
                                            <Image
                                                src={book.cover || "/placeholder.svg"}
                                                alt={`${book.title} cover`}
                                                width={80}
                                                height={120}
                                                className="rounded shadow-sm flex-shrink-0 smooth-transition hover:scale-105"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg literary-heading font-bold text-primary mb-1 line-clamp-2 group-hover:text-accent smooth-transition">
                                                    {book.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground literary-body mb-2 flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {book.author}
                                                </p>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge
                                                        variant={
                                                            book.status === "read"
                                                                ? "default"
                                                                : book.status === "currently-reading"
                                                                    ? "secondary"
                                                                    : "outline"
                                                        }
                                                        className="text-xs literary-accent"
                                                    >
                                                        {book.status.replace("-", " ")}
                                                    </Badge>
                                                    {book.rating && (
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-3 w-3 ${i < book.rating! ? "text-yellow-500 fill-current" : "text-muted-foreground"
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {book.status === "currently-reading" && (
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs text-muted-foreground">
                                                            <span>{book.progress}% complete</span>
                                                        </div>
                                                        <div className="w-full bg-muted rounded-full h-1">
                                                            <div className="bg-primary h-1 rounded-full" style={{ width: `${book.progress}%` }}></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-sm literary-body text-muted-foreground mb-3 line-clamp-2">{book.notes}</p>

                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {book.genres.slice(0, 3).map((genre, genreIndex) => (
                                                <Badge
                                                    key={genreIndex}
                                                    variant="outline"
                                                    className="text-xs literary-accent cursor-pointer"
                                                    onClick={() => handleTagToggle(genre)}
                                                >
                                                    {genre}
                                                </Badge>
                                            ))}
                                            {book.genres.length > 3 && (
                                                <Badge variant="outline" className="text-xs literary-accent">
                                                    +{book.genres.length - 3}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3" />
                                                    {book.views}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Heart className="h-3 w-3" />
                                                    {book.likes}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageCircle className="h-3 w-3" />
                                                    {book.comments}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {book.dateAdded.toLocaleDateString()}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            totalItems={filteredAndSortedBooks.length}
                        />
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
