import React from 'react'
import { isDefinedError, safe } from "@orpc/server";
import { client } from '~/lib/orpc'
import BookCard from "~/components/client/book-card";
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface BookProps {
    limit?: number;
    offset?: number;
    type?: 'WANT_TO_READ' | 'CURRENTLY_READING' | 'READ' | 'DNF' | null;
}

export const bookStatuses = {
    WANT_TO_READ: "Want to Read",
    CURRENTLY_READING: "Currently Reading",
    READ: "Read",
    DNF: "Did Not Finish",
};

export async function Books({ limit = 10, offset = 0, type }: BookProps) {
    const { data: booksData, error: booksError } = await safe(client.book.getBooks({
        limit,
        page: Math.floor(offset / limit) + 1,
        status: type || undefined,
    }));

    if (booksError || !booksData) {
        return <div>Error loading books</div>;
    }

    return (
        <>
            {booksData.books.map((book) => (
                <BookCard key={book.id} book={book} />
            ))}
        </>


    );
}

export const BooksFallback = () => {
    return (
        <>
            {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-32 w-full rounded-lg" />
            ))}
        </>
    );
}


Books.Fallback = BooksFallback;