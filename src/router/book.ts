import { ORPCError, os } from '@orpc/server';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { BookStatus } from '@prisma/client';

// Validation schemas
const HighlightSchema = z.object({
    text: z.string(),
    page: z.number().int().positive(),
    note: z.string().optional(),
});

const CreateBookSchema = z.object({
    title: z.string().min(1).max(200),
    author: z.string().min(1).max(100),
    isbn: z.string().optional(),
    coverImage: z.string().url().optional(),
    description: z.string().max(2000).optional(),
    pages: z.number().int().positive().optional(),
    publishedYear: z.number().int().min(1).max(new Date().getFullYear()).optional(),
    language: z.string().default('en'),
    status: z.nativeEnum(BookStatus).default(BookStatus.WANT_TO_READ),
    notes: z.string().max(5000).optional(),
    tagIds: z.array(z.string()).optional(),
});

const UpdateBookSchema = CreateBookSchema.partial().extend({
    id: z.string(),
});

const UpdateReadingProgressSchema = z.object({
    id: z.string(),
    progress: z.number().int().min(0).max(100),
    status: z.nativeEnum(BookStatus).optional(),
    rating: z.number().int().min(1).max(5).optional(),
    notes: z.string().max(5000).optional(),
});

const AddHighlightSchema = z.object({
    bookId: z.string(),
    highlight: HighlightSchema,
});

const BookSchema = z.object({
    id: z.string(),
    title: z.string(),
    author: z.string(),
    isbn: z.string().nullable(),
    coverImage: z.string().nullable(),
    description: z.string().nullable(),
    pages: z.number().nullable(),
    publishedYear: z.number().nullable(),
    language: z.string(),
    status: z.nativeEnum(BookStatus),
    progress: z.number(),
    rating: z.number().nullable(),
    startedAt: z.date().nullable(),
    finishedAt: z.date().nullable(),
    notes: z.string().nullable(),
    highlights: z.any().nullable(), // JSON field
    createdAt: z.date(),
    updatedAt: z.date(),
    tags: z.array(z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        color: z.string().nullable(),
    })).optional(),
    quotes: z.array(z.object({
        id: z.string(),
        content: z.string(),
        page: z.number().nullable(),
        createdAt: z.date(),
    })).optional(),
});

const BookListSchema = z.object({
    books: z.array(BookSchema.omit({ highlights: true, quotes: true })),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

const ReadingStatsSchema = z.object({
    totalBooks: z.number(),
    booksRead: z.number(),
    currentlyReading: z.number(),
    wantToRead: z.number(),
    pagesRead: z.number(),
    averageRating: z.number().nullable(),
    booksThisYear: z.number(),
});

// Create book
export const createBook = os
    .input(CreateBookSchema)
    .output(BookSchema)
    .errors({
        VALIDATION_ERROR: {
            message: 'Invalid input data',
            status: 400,
        },
        ISBN_EXISTS: {
            message: 'A book with this ISBN already exists',
            status: 409,
        },
    })
    .handler(async ({ input, errors }) => {
        // Check if ISBN already exists
        if (input.isbn) {
            const existingBook = await prisma.book.findUnique({
                where: { isbn: input.isbn },
            });

            if (existingBook) {
                throw errors.ISBN_EXISTS();
            }
        }

        try {
            const book = await prisma.book.create({
                data: {
                    ...input,
                    tags: input.tagIds?.length ? {
                        create: input.tagIds.map(tagId => ({ tagId }))
                    } : undefined,
                },
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                    quotes: {
                        select: {
                            id: true,
                            content: true,
                            page: true,
                            createdAt: true,
                        },
                    },
                },
            });

            return {
                ...book,
                tags: book.tags.map(({ tag }) => tag),
            };
        } catch (error) {
            throw errors.VALIDATION_ERROR();
        }
    });

// Get book by ID
export const getBook = os
    .input(z.object({
        id: z.string(),
    }))
    .output(BookSchema.nullable())
    .handler(async ({ input }) => {
        const book = await prisma.book.findUnique({
            where: { id: input.id },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
                quotes: {
                    select: {
                        id: true,
                        content: true,
                        page: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!book) return null;

        return {
            ...book,
            tags: book.tags.map(({ tag }) => tag),
        };
    });

// List books with filtering and pagination
export const getBooks = os
    .input(z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
        status: z.nativeEnum(BookStatus).optional(),
        rating: z.number().int().min(1).max(5).optional(),
        tagId: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.enum(['title', 'author', 'rating', 'finishedAt', 'createdAt']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .output(BookListSchema)
    .handler(async ({ input }) => {
        const skip = (input.page - 1) * input.limit;

        const where = {
            AND: [
                input.status ? { status: input.status } : {},
                input.rating ? { rating: input.rating } : {},
                input.tagId ? {
                    tags: {
                        some: {
                            tagId: input.tagId,
                        },
                    },
                } : {},
                input.search ? {
                    OR: [
                        { title: { contains: input.search, mode: 'insensitive' as const } },
                        { author: { contains: input.search, mode: 'insensitive' as const } },
                        { description: { contains: input.search, mode: 'insensitive' as const } },
                    ],
                } : {},
            ],
        };

        const orderBy = { [input.sortBy]: input.sortOrder };

        const [books, total] = await Promise.all([
            prisma.book.findMany({
                where,
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
                orderBy,
                skip,
                take: input.limit,
            }),
            prisma.book.count({ where }),
        ]);

        return {
            books: books.map(book => ({
                ...book,
                tags: book.tags.map(({ tag }) => tag),
            })),
            total,
            page: input.page,
            limit: input.limit,
            totalPages: Math.ceil(total / input.limit),
        };
    });

// Update book
export const updateBook = os
    .input(UpdateBookSchema)
    .output(BookSchema)
    .errors({
        NOT_FOUND: {
            message: 'Book not found',
            status: 404,
        },
        ISBN_EXISTS: {
            message: 'A book with this ISBN already exists',
            status: 409,
        },
    })
    .handler(async ({ input, errors }) => {
        const { id, tagIds, ...updateData } = input;

        // Check if book exists
        const existingBook = await prisma.book.findUnique({
            where: { id },
        });

        if (!existingBook) {
            throw errors.NOT_FOUND();
        }

        // Check ISBN uniqueness if being updated
        if (updateData.isbn && updateData.isbn !== existingBook.isbn) {
            const isbnExists = await prisma.book.findUnique({
                where: { isbn: updateData.isbn },
            });

            if (isbnExists) {
                throw errors.ISBN_EXISTS();
            }
        }

        const book = await prisma.book.update({
            where: { id },
            data: {
                ...updateData,
                ...(tagIds !== undefined && {
                    tags: {
                        deleteMany: {},
                        create: tagIds.map(tagId => ({ tagId })),
                    },
                }),
            },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
                quotes: {
                    select: {
                        id: true,
                        content: true,
                        page: true,
                        createdAt: true,
                    },
                },
            },
        });

        return {
            ...book,
            tags: book.tags.map(({ tag }) => tag),
        };
    });

// Update reading progress and status
export const updateReadingProgress = os
    .input(UpdateReadingProgressSchema)
    .output(BookSchema)
    .errors({
        NOT_FOUND: {
            message: 'Book not found',
            status: 404,
        },
    })
    .handler(async ({ input, errors }) => {
        const existingBook = await prisma.book.findUnique({
            where: { id: input.id },
        });

        if (!existingBook) {
            throw errors.NOT_FOUND();
        }

        // Auto-update status and dates based on progress
        const updateData: any = {
            progress: input.progress,
            notes: input.notes,
            rating: input.rating,
        };

        // Set status based on progress if not explicitly provided
        if (input.status) {
            updateData.status = input.status;
        } else {
            if (input.progress === 0) {
                updateData.status = BookStatus.WANT_TO_READ;
            } else if (input.progress === 100) {
                updateData.status = BookStatus.READ;
            } else {
                updateData.status = BookStatus.CURRENTLY_READING;
            }
        }

        // Set startedAt when first making progress
        if (input.progress > 0 && !existingBook.startedAt) {
            updateData.startedAt = new Date();
        }

        // Set finishedAt when completed
        if (input.progress === 100 && !existingBook.finishedAt) {
            updateData.finishedAt = new Date();
        }

        // Clear finishedAt if progress goes back down
        if (input.progress < 100 && existingBook.finishedAt) {
            updateData.finishedAt = null;
        }

        const book = await prisma.book.update({
            where: { id: input.id },
            data: updateData,
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
                quotes: {
                    select: {
                        id: true,
                        content: true,
                        page: true,
                        createdAt: true,
                    },
                },
            },
        });

        return {
            ...book,
            tags: book.tags.map(({ tag }) => tag),
        };
    });

// Add highlight to book
export const addHighlight = os
    .input(AddHighlightSchema)
    .output(BookSchema)
    .errors({
        NOT_FOUND: {
            message: 'Book not found',
            status: 404,
        },
    })
    .handler(async ({ input, errors }) => {
        const existingBook = await prisma.book.findUnique({
            where: { id: input.bookId },
        });

        if (!existingBook) {
            throw errors.NOT_FOUND();
        }

        const currentHighlights = (existingBook.highlights as any[]) || [];
        const newHighlight = {
            ...input.highlight,
            id: Math.random().toString(36).substring(2, 15),
            createdAt: new Date().toISOString(),
        };

        const updatedHighlights = [...currentHighlights, newHighlight];

        const book = await prisma.book.update({
            where: { id: input.bookId },
            data: {
                highlights: updatedHighlights,
            },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
                quotes: {
                    select: {
                        id: true,
                        content: true,
                        page: true,
                        createdAt: true,
                    },
                },
            },
        });

        return {
            ...book,
            tags: book.tags.map(({ tag }) => tag),
        };
    });

// Get reading statistics
export const getReadingStats = os
    .input(z.object({
        year: z.number().int().optional(),
    }))
    .output(ReadingStatsSchema)
    .handler(async ({ input }) => {
        const currentYear = input.year || new Date().getFullYear();
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear + 1, 0, 1);

        const [totalBooks, booksRead, currentlyReading, wantToRead, booksThisYear, ratingsData] = await Promise.all([
            prisma.book.count(),
            prisma.book.count({ where: { status: BookStatus.READ } }),
            prisma.book.count({ where: { status: BookStatus.CURRENTLY_READING } }),
            prisma.book.count({ where: { status: BookStatus.WANT_TO_READ } }),
            prisma.book.count({
                where: {
                    finishedAt: {
                        gte: yearStart,
                        lt: yearEnd,
                    },
                },
            }),
            prisma.book.aggregate({
                _avg: { rating: true },
                _sum: { pages: true },
                where: { status: BookStatus.READ },
            }),
        ]);

        return {
            totalBooks,
            booksRead,
            currentlyReading,
            wantToRead,
            pagesRead: ratingsData._sum.pages || 0,
            averageRating: ratingsData._avg.rating,
            booksThisYear,
        };
    });

// Delete book
export const deleteBook = os
    .input(z.object({
        id: z.string(),
    }))
    .output(z.object({
        success: z.boolean(),
        message: z.string(),
    }))
    .errors({
        NOT_FOUND: {
            message: 'Book not found',
            status: 404,
        },
    })
    .handler(async ({ input, errors }) => {
        const existingBook = await prisma.book.findUnique({
            where: { id: input.id },
        });

        if (!existingBook) {
            throw errors.NOT_FOUND();
        }

        await prisma.book.delete({
            where: { id: input.id },
        });

        return {
            success: true,
            message: 'Book deleted successfully',
        };
    });