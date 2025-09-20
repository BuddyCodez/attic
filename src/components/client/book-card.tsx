"use client"

import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Star, User } from "lucide-react";
import { BookDetailsModal } from "./book-details-modal";

interface BookCardProps {
    book: any; // Using any for now, should be properly typed later
}

export const bookStatuses = {
    WANT_TO_READ: "Want to Read",
    CURRENTLY_READING: "Currently Reading",
    READ: "Read",
    DNF: "Did Not Finish",
};

export default function BookCard({ book }: BookCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setIsModalOpen(true)}
            >
                <CardContent className="p-3">
                    <div className="space-y-2">
                        <h3 className="font-medium text-sm leading-tight line-clamp-2">
                            {book.title}
                        </h3>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{book.author}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <Badge
                                variant={
                                    book.status === "READ"
                                        ? "default"
                                        : book.status === "CURRENTLY_READING"
                                            ? "secondary"
                                            : "outline"
                                }
                                className="text-xs px-1.5 py-0.5"
                            >
                                {bookStatuses[book.status]}
                            </Badge>

                            {book.rating && (
                                <div className="flex items-center">
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                    <span className="text-xs ml-1">{book.rating}</span>
                                </div>
                            )}
                        </div>

                        {book.status === "CURRENTLY_READING" && (
                            <div className="space-y-1">
                                {
                                    !book.progress ? (
                                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                            About to start
                                        </Badge>
                                    ) : (
                                        <>
                                            <div className="text-xs text-muted-foreground text-right">
                                                {book?.progress || 0}%
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-1">
                                                <div
                                                    className="bg-primary h-1 rounded-full transition-all"
                                                    style={{ width: `${book.progress}%` }}
                                                />
                                            </div>
                                        </>
                                    )

                                }
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <BookDetailsModal
                book={book}
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </>
    );
}