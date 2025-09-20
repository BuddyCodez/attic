import { ORPCError, os } from '@orpc/server';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

// Validation schemas
const CreateQuoteSchema = z.object({
    content: z.string().min(1).max(2000),
    author: z.string().max(100).optional(),
    source: z.string().max(200).optional(),
    context: z.string().max(1000).optional(),
    page: z.number().int().positive().optional(),
    bookId: z.string().optional(),
    tagIds: z.array(z.string()).optional(),
});

const UpdateQuoteSchema = CreateQuoteSchema.partial().extend({
    id: z.string(),
});

const QuoteSchema = z.object({
    id: z.string(),
    content: z.string(),
    author: z.string().nullable(),
    source: z.string().nullable(),
    context: z.string().nullable(),
    page: z.number().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    book: z.object({
        id: z.string(),
        title: z.string(),
        author: z.string(),
    }).nullable().optional(),
    tags: z.array(z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        color: z.string().nullable(),
    })).optional(),
});

const QuoteListSchema = z.object({
    quotes: z.array(QuoteSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

// Create quote
export const createQuote = os
    .input(CreateQuoteSchema)
    .output(QuoteSchema)
    .errors({
        VALIDATION_ERROR: {
            message: 'Invalid input data',
            status: 400,
        },
        BOOK_NOT_FOUND: {
            message: 'Referenced book not found',
            status: 404,
        },
    })
    .handler(async ({ input, errors }) => {
        // Validate book exists if provided
        if (input.bookId) {
            const book = await prisma.book.findUnique({
                where: { id: input.bookId },
            });

            if (!book) {
                throw errors.BOOK_NOT_FOUND();
            }
        }

        try {
            const quote = await prisma.quote.create({
                data: {
                    content: input.content,
                    author: input.author,
                    source: input.source,
                    context: input.context,
                    page: input.page,
                    bookId: input.bookId,
                    tags: input.tagIds?.length ? {
                        create: input.tagIds.map(tagId => ({ tagId }))
                    } : undefined,
                },
                include: {
                    book: {
                        select: {
                            id: true,
                            title: true,
                            author: true,
                        },
                    },
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
            });

            return {
                ...quote,
                tags: quote.tags.map(({ tag }) => tag),
            };
        } catch (error) {
            throw errors.VALIDATION_ERROR();
        }
    });

// Get quote by ID
export const getQuote = os
    .input(z.object({
        id: z.string(),
    }))
    .output(QuoteSchema.nullable())
    .handler(async ({ input }) => {
        const quote = await prisma.quote.findUnique({
            where: { id: input.id },
            include: {
                book: {
                    select: {
                        id: true,
                        title: true,
                        author: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        if (!quote) return null;

        return {
            ...quote,
            tags: quote.tags.map(({ tag }) => tag),
        };
    });

// List quotes with filtering and pagination
export const getQuotes = os
    .input(z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
        bookId: z.string().optional(),
        author: z.string().optional(),
        tagId: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.enum(['createdAt', 'author', 'source']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .output(QuoteListSchema)
    .handler(async ({ input }) => {
        const skip = (input.page - 1) * input.limit;

        const where = {
            AND: [
                input.bookId ? { bookId: input.bookId } : {},
                input.author ? { author: { contains: input.author, mode: 'insensitive' as const } } : {},
                input.tagId ? {
                    tags: {
                        some: {
                            tagId: input.tagId,
                        },
                    },
                } : {},
                input.search ? {
                    OR: [
                        { content: { contains: input.search, mode: 'insensitive' as const } },
                        { author: { contains: input.search, mode: 'insensitive' as const } },
                        { source: { contains: input.search, mode: 'insensitive' as const } },
                        { context: { contains: input.search, mode: 'insensitive' as const } },
                    ],
                } : {},
            ],
        };

        const orderBy = { [input.sortBy]: input.sortOrder };

        const [quotes, total] = await Promise.all([
            prisma.quote.findMany({
                where,
                include: {
                    book: {
                        select: {
                            id: true,
                            title: true,
                            author: true,
                        },
                    },
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
            prisma.quote.count({ where }),
        ]);

        return {
            quotes: quotes.map(quote => ({
                ...quote,
                tags: quote.tags.map(({ tag }) => tag),
            })),
            total,
            page: input.page,
            limit: input.limit,
            totalPages: Math.ceil(total / input.limit),
        };
    });

// Update quote
export const updateQuote = os
    .input(UpdateQuoteSchema)
    .output(QuoteSchema)
    .errors({
        NOT_FOUND: {
            message: 'Quote not found',
            status: 404,
        },
        BOOK_NOT_FOUND: {
            message: 'Referenced book not found',
            status: 404,
        },
    })
    .handler(async ({ input, errors }) => {
        const { id, tagIds, ...updateData } = input;

        // Check if quote exists
        const existingQuote = await prisma.quote.findUnique({
            where: { id },
        });

        if (!existingQuote) {
            throw errors.NOT_FOUND();
        }

        // Validate book exists if provided
        if (updateData.bookId) {
            const book = await prisma.book.findUnique({
                where: { id: updateData.bookId },
            });

            if (!book) {
                throw errors.BOOK_NOT_FOUND();
            }
        }

        const quote = await prisma.quote.update({
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
                book: {
                    select: {
                        id: true,
                        title: true,
                        author: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        return {
            ...quote,
            tags: quote.tags.map(({ tag }) => tag),
        };
    });

// Delete quote
export const deleteQuote = os
    .input(z.object({
        id: z.string(),
    }))
    .output(z.object({
        success: z.boolean(),
        message: z.string(),
    }))
    .errors({
        NOT_FOUND: {
            message: 'Quote not found',
            status: 404,
        },
    })
    .handler(async ({ input, errors }) => {
        const existingQuote = await prisma.quote.findUnique({
            where: { id: input.id },
        });

        if (!existingQuote) {
            throw errors.NOT_FOUND();
        }

        await prisma.quote.delete({
            where: { id: input.id },
        });

        return {
            success: true,
            message: 'Quote deleted successfully',
        };
    });

// Get quotes by book
export const getQuotesByBook = os
    .input(z.object({
        bookId: z.string(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
    }))
    .output(QuoteListSchema)
    .handler(async ({ input }) => {
        const skip = (input.page - 1) * input.limit;

        const where = { bookId: input.bookId };

        const [quotes, total] = await Promise.all([
            prisma.quote.findMany({
                where,
                include: {
                    book: {
                        select: {
                            id: true,
                            title: true,
                            author: true,
                        },
                    },
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
                orderBy: { page: 'asc' },
                skip,
                take: input.limit,
            }),
            prisma.quote.count({ where }),
        ]);

        return {
            quotes: quotes.map(quote => ({
                ...quote,
                tags: quote.tags.map(({ tag }) => tag),
            })),
            total,
            page: input.page,
            limit: input.limit,
            totalPages: Math.ceil(total / input.limit),
        };
    });

// Get quotes by tag
export const getQuotesByTag = os
    .input(z.object({
        tagSlug: z.string(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
    }))
    .output(QuoteListSchema)
    .handler(async ({ input }) => {
        const skip = (input.page - 1) * input.limit;

        const tag = await prisma.tag.findUnique({
            where: { slug: input.tagSlug },
        });

        if (!tag) {
            return {
                quotes: [],
                total: 0,
                page: input.page,
                limit: input.limit,
                totalPages: 0,
            };
        }

        const where = {
            tags: {
                some: {
                    tagId: tag.id,
                },
            },
        };

        const [quotes, total] = await Promise.all([
            prisma.quote.findMany({
                where,
                include: {
                    book: {
                        select: {
                            id: true,
                            title: true,
                            author: true,
                        },
                    },
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: input.limit,
            }),
            prisma.quote.count({ where }),
        ]);

        return {
            quotes: quotes.map(quote => ({
                ...quote,
                tags: quote.tags.map(({ tag }) => tag),
            })),
            total,
            page: input.page,
            limit: input.limit,
            totalPages: Math.ceil(total / input.limit),
        };
    });

// Get random quote (for daily inspiration)
export const getRandomQuote = os
    .input(z.object({
        tagId: z.string().optional(),
    }))
    .output(QuoteSchema.nullable())
    .handler(async ({ input }) => {
        const where = input.tagId ? {
            tags: {
                some: {
                    tagId: input.tagId,
                },
            },
        } : {};

        const count = await prisma.quote.count({ where });

        if (count === 0) return null;

        const skip = Math.floor(Math.random() * count);

        const quote = await prisma.quote.findFirst({
            where,
            include: {
                book: {
                    select: {
                        id: true,
                        title: true,
                        author: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
            skip,
        });

        if (!quote) return null;

        return {
            ...quote,
            tags: quote.tags.map(({ tag }) => tag),
        };
    });