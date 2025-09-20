"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "~/components/ui/drawer";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
    Star,
    Calendar,
    User,
    BookOpen,
    Clock,
    Target,
    Quote,
    ExternalLink,
    BookmarkPlus
} from "lucide-react";
import Image from "next/image";
import { useMediaQuery } from "~/lib/use-media-query";

interface Book {
    id: string;
    title: string;
    author: string;
    description: string | null;
    coverImage: string | null;
    isbn: string | null;
    pages: number | null;
    publishedYear: number | null;
    status: string;
    progress: number;
    rating: number | null;
    notes: string | null;
    highlights: any;
    startedAt: Date | null;
    finishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

interface BookDetailsModalProps {
    book: Book;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const bookStatuses = {
    WANT_TO_READ: "Want to Read",
    CURRENTLY_READING: "Currently Reading",
    READ: "Read",
    DNF: "Did Not Finish",
};

export function BookDetailsModal({ book, isOpen, onOpenChange }: BookDetailsModalProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const handleClose = () => onOpenChange(false);

    const formatDate = (date: Date | null) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "READ": return "default";
            case "CURRENTLY_READING": return "secondary";
            case "WANT_TO_READ": return "outline";
            case "DNF": return "destructive";
            default: return "outline";
        }
    };

    const BookDetailsContent = () => (
        <div className="space-y-6 max-h-[80vh] overflow-y-auto scroll-container">
            {/* Header with cover and basic info */}
            <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <Image
                        src={book.coverImage || "/placeholder.svg"}
                        alt={`${book.title} cover`}
                        width={150}
                        height={225}
                        className="rounded-lg shadow-lg"
                    />
                </div>

                <div className="flex-1 space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold literary-heading text-primary mb-2">
                            {book.title}
                        </h2>
                        <p className="text-lg text-muted-foreground literary-body flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {book.author}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant={getStatusColor(book.status)} className="literary-accent">
                            {bookStatuses[book.status as keyof typeof bookStatuses]}
                        </Badge>

                        {book.rating && (
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < book.rating! ? "text-yellow-500 fill-current" : "text-muted-foreground"
                                            }`}
                                    />
                                ))}
                                <span className="text-sm text-muted-foreground ml-1">
                                    ({book.rating}/5)
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Progress bar for currently reading books */}
                    {book.status === "CURRENTLY_READING" && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Reading Progress</span>
                                <span>{book.progress}% complete</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${book.progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Separator />

            {/* Book details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {book.pages && (
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Pages:</span>
                        <span>{book.pages}</span>
                    </div>
                )}

                {book.publishedYear && (
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Published:</span>
                        <span>{book.publishedYear}</span>
                    </div>
                )}

                {book.isbn && (
                    <div className="flex items-center gap-2">
                        <BookmarkPlus className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">ISBN:</span>
                        <span className="font-mono text-xs">{book.isbn}</span>
                    </div>
                )}

                {book.startedAt && (
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Started:</span>
                        <span>{formatDate(book.startedAt)}</span>
                    </div>
                )}

                {book.finishedAt && (
                    <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Finished:</span>
                        <span>{formatDate(book.finishedAt)}</span>
                    </div>
                )}
            </div>

            {/* Description */}
            {book.description && (
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold literary-heading">Description</h3>
                    <p className="text-muted-foreground literary-body leading-relaxed">
                        {book.description}
                    </p>
                </div>
            )}

            {/* Notes */}
            {book.notes && (
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold literary-heading">My Notes</h3>
                    <Card className="bg-muted/50">
                        <CardContent className="p-4">
                            <p className="text-muted-foreground literary-body leading-relaxed whitespace-pre-wrap">
                                {book.notes}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Highlights */}
            {book.highlights && Array.isArray(book.highlights) && book.highlights.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold literary-heading flex items-center gap-2">
                        <Quote className="h-5 w-5" />
                        Highlights & Notes
                    </h3>
                    <div className="space-y-3">
                        {book.highlights.map((highlight: any, index: number) => (
                            <Card key={index} className="bg-muted/50">
                                <CardContent className="p-4">
                                    <blockquote className="text-foreground literary-body italic border-l-4 border-primary/20 pl-4 mb-2">
                                        "{highlight.text}"
                                    </blockquote>
                                    {highlight.note && (
                                        <p className="text-sm text-muted-foreground">
                                            <strong>My note:</strong> {highlight.note}
                                        </p>
                                    )}
                                    {highlight.page && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Page {highlight.page}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button variant="outline" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View on Goodreads
                </Button>
            </div>
        </div>
    );

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="sr-only">Book Details</DialogTitle>
                    </DialogHeader>
                    <BookDetailsContent />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={isOpen} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[90vh] overflow-hidden">
                <DrawerHeader className="pb-4">
                    <DrawerTitle className="sr-only">Book Details</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-4">
                    <BookDetailsContent />
                </div>
            </DrawerContent>
        </Drawer>
    );
}

// Hook for triggering the modal
export function useBookModal() {
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const openModal = (book: Book) => {
        setSelectedBook(book);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        // Delay clearing the book to allow for closing animation
        setTimeout(() => setSelectedBook(null), 300);
    };

    return {
        selectedBook,
        isOpen,
        openModal,
        closeModal,
        BookModal: selectedBook ? (
            <BookDetailsModal
                book={selectedBook}
                isOpen={isOpen}
                onOpenChange={setIsOpen}
            />
        ) : null
    };
}