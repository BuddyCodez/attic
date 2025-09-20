import React from 'react'
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { BookOpen, FileText, Quote, Search } from "lucide-react"
import { Button } from "~/components/ui/button";
import Image from "next/image";
import { client } from "~/lib/orpc";
import { isDefinedError, safe } from "@orpc/server";
import { PublishStatus, BookStatus } from "@prisma/client";
import { Skeleton } from '../ui/skeleton';
export async function FeaturedCurios() {
 
    const [essaysError, essaysData] = await safe(client.essay.getEssays({
        page: 1,
        limit: 1,
        status: PublishStatus.PUBLISHED
    }));

    const [booksError, booksData] = await safe(client.book.getBooks({
        page: 1,
        limit: 1,
        status: BookStatus.CURRENTLY_READING
    }));

    const [quoteError, quoteData] = await safe(client.quote.getRandomQuote({}));

    const [statsError, statsData] = await safe(client.book.getReadingStats({}));

  
    // Get the data or fallback to null
    const latestEssay = !isDefinedError(essaysError) ? essaysData?.essays?.[0] || null : null;
    const currentlyReading = !isDefinedError(booksError) ? booksData?.books?.[0] || null : null;
    const randomQuote = !isDefinedError(quoteError) ? quoteData : null;
    const readingStats = !isDefinedError(statsError) ? statsData : null;


    const formatDate = (date: Date) => {
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h3 className="text-3xl literary-heading font-bold text-primary mb-4 ">Featured Curios</h3>
                    <p className="literary-body text-muted-foreground max-w-2xl mx-auto stagger-1">
                        The most interesting items I&apos;ve recently placed in the attic
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Latest Essay Card - Real data */}
                    <Card className="paper-card hover-lift group p-2  stagger-1">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between mb-3">
                                <FileText className="h-6 w-6 text-primary smooth-transition" />
                                <Badge variant="secondary" className="text-xs literary-accent">
                                    Latest Essay
                                </Badge>
                            </div>
                            <CardTitle className="text-2xl literary-heading group-hover:text-primary smooth-transition mb-2">
                                {latestEssay?.title || 'Welcome to My Digital Attic'}
                            </CardTitle>
                            <div className="text-xs text-muted-foreground mb-3 literary-body">
                                Published {latestEssay ? formatDate(latestEssay.publishedAt) : 'recently'}
                                {latestEssay?.readTime && ` • ${latestEssay.readTime} min read`}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <CardDescription className="text-base leading-relaxed literary-body">
                                {latestEssay?.excerpt || latestEssay?.subtitle ||
                                    'A place to collect thoughts, ideas, and discoveries. My digital attic where curious minds can explore the collection of essays, books, quotes, and notes that have shaped my thinking over time.'
                                }
                            </CardDescription>
                            {latestEssay?.tags && latestEssay.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {latestEssay.tags.slice(0, 3).map((tag: any) => (
                                        <Badge key={tag.id} variant="outline" className="text-xs literary-accent">
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                className="p-0 h-auto text-primary px-2 font-medium literary-accent smooth-transition"
                            >
                                Continue reading →
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Currently Reading Card - Real data */}
                    <Card className="paper-card hover-lift group p-2  stagger-2">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between mb-3">
                                <BookOpen className="h-6 w-6 text-primary smooth-transition" />
                                <Badge variant="secondary" className="text-xs literary-accent">
                                    {currentlyReading ? 'Reading Now' : 'Reading List'}
                                </Badge>
                            </div>
                            <CardTitle className="text-2xl literary-heading group-hover:text-primary smooth-transition mb-2">
                                {currentlyReading.title || 'My Reading Journey'}
                            </CardTitle>
                            <div className="text-sm text-muted-foreground mb-3 literary-body">
                                {currentlyReading.author ? `by ${currentlyReading.author}` : 'Building my digital library'}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-4 mb-4">
                                {currentlyReading?.coverImage && (
                                    <Image
                                        src={currentlyReading.coverImage}
                                        alt={`${currentlyReading.title} book cover`}
                                        width={100}
                                        height={150}
                                        className="rounded shadow-md flex-shrink-0 smooth-transition hover:scale-105"
                                    />
                                )}
                                <div className="flex-1 space-y-3">
                                    <CardDescription className="text-sm leading-relaxed literary-body">
                                        {currentlyReading.notes || currentlyReading?.description ||
                                            'Track reading progress, save highlights, and collect thoughts from the books that shape my understanding of the world.'
                                        }
                                    </CardDescription>
                                    {currentlyReading && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-muted-foreground literary-accent">
                                                <span>Progress</span>
                                                <span>{currentlyReading.progress}% complete</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-primary h-2 rounded-full progress-bar relative"
                                                    style={{ width: `${currentlyReading.progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-muted-foreground literary-body">
                                                {currentlyReading.startedAt && `Started ${formatDate(currentlyReading.startedAt)}`}
                                                {currentlyReading.rating && ` • Rated ${currentlyReading.rating}/5 stars`}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                className="p-0 h-auto text-primary px-2 font-medium literary-accent smooth-transition"
                            >
                                {currentlyReading ? 'View my notes →' : 'Explore library →'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quote Card - Real data */}
                    <Card className="paper-card hover-lift group p-2  stagger-3">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between mb-3">
                                <Quote className="h-6 w-6 text-primary smooth-transition" />
                                <Badge variant="secondary" className="text-xs literary-accent">
                                    From the Jar
                                </Badge>
                            </div>
                            <CardTitle className="text-xl literary-heading group-hover:text-primary smooth-transition mb-2">
                                Today&apos;s Reflection
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <blockquote className="text-lg italic text-foreground leading-relaxed mb-4 border-l-4 border-primary/20 pl-4 literary-accent">
                                &quot;{randomQuote?.content || 'The unexamined life is not worth living.'}&quot;
                            </blockquote>
                            <cite className="text-sm text-muted-foreground block mb-4 literary-body">
                                — {randomQuote?.author || 'Socrates'}
                                {randomQuote?.source && `, ${randomQuote.source}`}
                            </cite>
                            <CardDescription className="text-sm leading-relaxed literary-body">
                                {randomQuote?.context ||
                                    'A reminder to always question, always learn, and always seek deeper understanding of ourselves and the world around us.'
                                }
                            </CardDescription>
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border literary-accent">
                                <span>Added to collection</span>
                                <span>{randomQuote ? formatDate(randomQuote.createdAt) : 'Recently'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Explore Collection Card - Real stats */}
                    <Card className="paper-card aged-paper hover-lift group border-primary/20 p-2  stagger-4">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between mb-3">
                                <Search className="h-6 w-6 text-primary smooth-transition" />
                                <Badge variant="default" className="text-xs literary-accent">
                                    Explore
                                </Badge>
                            </div>
                            <CardTitle className="text-2xl literary-heading group-hover:text-primary smooth-transition mb-2">
                                Browse the Full Collection
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <CardDescription className="text-base leading-relaxed mb-4 literary-body">
                                Dive into my complete digital attic—{readingStats ? 'years' : 'a growing collection'} of collected thoughts, book summaries, favorite quotes, and
                                random discoveries that have shaped my thinking.
                            </CardDescription>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground literary-body">Books Read</span>
                                    <span className="font-medium literary-accent">{readingStats?.booksRead || '0'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground literary-body">Currently Reading</span>
                                    <span className="font-medium literary-accent">{readingStats?.currentlyReading || '0'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground literary-body">Want to Read</span>
                                    <span className="font-medium literary-accent">{readingStats?.wantToRead || '0'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground literary-body">This Year</span>
                                    <span className="font-medium literary-accent">{readingStats?.booksThisYear || '0'}</span>
                                </div>
                                {readingStats?.pagesRead && readingStats.pagesRead > 0 && (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground literary-body">Pages Read</span>
                                            <span className="font-medium literary-accent">{readingStats.pagesRead.toLocaleString()}</span>
                                        </div>
                                        {readingStats.averageRating && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground literary-body">Avg. Rating</span>
                                                <span className="font-medium literary-accent">{readingStats.averageRating.toFixed(1)}/5</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <Button className="w-full mt-4 literary-accent smooth-transition hover:scale-105" size="default">
                                Start Exploring the Attic
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}

// Simple shimmer fallback
export const FeaturedCuriosFallback = () => {
    console.log("🔄 FeaturedCuriosFallback shimmer rendering...");

    return (
        <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h3 className="text-3xl literary-heading font-bold text-primary mb-4 ">Featured Curios</h3>
                    <p className="literary-body text-muted-foreground max-w-2xl mx-auto  stagger-1">
                        The most interesting items I&apos;ve recently placed in the attic
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Latest Essay Card Skeleton */}
                    <Card className="paper-card hover-lift group p-2 slide-up stagger-1">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between mb-3">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-7 w-4/5 mb-2" />
                            <Skeleton className="h-4 w-40" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-4/6" />
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Skeleton className="h-5 w-12 rounded-full" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-14 rounded-full" />
                            </div>
                            <Skeleton className="h-5 w-32" />
                        </CardContent>
                    </Card>

                    {/* Currently Reading Card Skeleton */}
                    <Card className="paper-card hover-lift group p-2 slide-up stagger-2">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between mb-3">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-5 w-24 rounded-full" />
                            </div>
                            <Skeleton className="h-7 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-4 mb-4">
                                <Skeleton className="w-[100px] h-[150px] rounded shadow-md flex-shrink-0" />
                                <div className="flex-1 space-y-3">
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-5/6" />
                                        <Skeleton className="h-3 w-4/6" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-3 w-12" />
                                            <Skeleton className="h-3 w-10" />
                                        </div>
                                        <Skeleton className="w-full h-2 rounded-full" />
                                        <Skeleton className="h-3 w-40" />
                                    </div>
                                </div>
                            </div>
                            <Skeleton className="h-5 w-32" />
                        </CardContent>
                    </Card>

                    {/* Quote Card Skeleton */}
                    <Card className="paper-card hover-lift group p-2 slide-up stagger-3">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between mb-3">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-5 w-24 rounded-full" />
                            </div>
                            <Skeleton className="h-6 w-40 mb-2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="border-l-4 border-primary/20 pl-4 space-y-2">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-5/6" />
                                <Skeleton className="h-5 w-4/6" />
                            </div>
                            <Skeleton className="h-4 w-48" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Explore Collection Card Skeleton */}
                    <Card className="paper-card aged-paper hover-lift group border-primary/20 p-2 slide-up stagger-4">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between mb-3">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-7 w-56 mb-2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 mb-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-4/6" />
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-3 w-8" />
                                    </div>
                                ))}
                            </div>
                            <Skeleton className="w-full h-10 mt-4 rounded-md" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}