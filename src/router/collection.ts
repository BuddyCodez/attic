import { ORPCError, os } from '@orpc/server';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ContentType } from '@prisma/client';

// Validation schemas
const CreateCollectionSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    coverImage: z.string().url().optional(),
    isPublic: z.boolean().default(true),
    tagIds: z.array(z.string()).optional(),
});

const UpdateCollectionSchema = CreateCollectionSchema.partial().extend({
    id: z.string(),
});

const AddItemSchema = z.object({
    collectionId: z.string(),
    contentType: z.nativeEnum(ContentType),
    contentId: z.string(),
    note: z.string().max(500).optional(),
    order: z.number().int().optional(),
});

const CollectionItemSchema = z.object({
    id: z.string(),
    contentType: z.nativeEnum(ContentType),
    contentId: z.string(),
    order: z.number(),
    note: z.string().nullable(),
    createdAt: z.date(),
    content: z.any(), // This will be populated based on contentType
});

const CollectionSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    coverImage: z.string().nullable(),
    isPublic: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    items: z.array(CollectionItemSchema).optional(),
    tags: z.array(z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        color: z.string().nullable(),
    })).optional(),
    _count: z.object({
        items: z.number(),
    }).optional(),
});

const CollectionListSchema = z.object({
    collections: z.array(CollectionSchema.omit({ items: true })),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

// Helper function to fetch content based on type
async function fetchContentByType(contentType: ContentType, contentId: string) {
    switch (contentType) {
        case ContentType.ESSAY:
            return await prisma.essay.findUnique({
                where: { id: contentId },
                select: {
                    id: true,
                    title: true,
                    subtitle: true,
                    excerpt: true,
                    publishedAt: true,
                    readTime: true,
                    coverImage: true,
                    slug: true,
                },
            });
        case ContentType.BOOK:
            return await prisma.book.findUnique({
                where: { id: contentId },
                select: {
                    id: true,
                    title: true,
                    author: true,
                    coverImage: true,
                    description: true,
                    status: true,
                    rating: true,
                    pages: true,
                },
            });
        case ContentType.QUOTE:
            return await prisma.quote.findUnique({
                where: { id: contentId },
                select: {
                    id: true,
                    content: true,
                    author: true,
                    source: true,
                    book: {
                        select: {
                            title: true,
                            author: true,
                        },
                    },
                },
            });
        case ContentType.NOTE:
            return await prisma.note.findUnique({
                where: { id: contentId },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    status: true,
                    createdAt: true,
                },
            });
        case ContentType.COLLECTION:
            return await prisma.collection.findUnique({
                where: { id: contentId },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    coverImage: true,
                    isPublic: true,
                    _count: {
                        select: {
                            items: true,
                        },
                    },
                },
            });
        default:
            return null;
    }
}

// Create collection
export const createCollection = os
    .input(CreateCollectionSchema)
    .output(CollectionSchema)
    .errors({
        VALIDATION_ERROR: {
            message: 'Invalid input data',
            status: 400,
        },
    })
    .handler(async ({ input, errors }) => {
        try {
            const collection = await prisma.collection.create({
                data: {
                    name: input.name,
                    description: input.description,
                    coverImage: input.coverImage,
                    isPublic: input.isPublic,
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
                    _count: {
                        select: {
                            items: true,
                        },
                    },
                },
            });

            return {
                ...collection,
                tags: collection.tags.map(({ tag }) => tag),
            };
        } catch (error) {
            throw errors.VALIDATION_ERROR();
        }
    });

// Get collection by ID with all items
export const getCollection = os
    .input(z.object({
        id: z.string(),
        includeItems: z.boolean().default(true),
    }))
    .output(CollectionSchema.nullable())
    .handler(async ({ input }) => {
        const collection = await prisma.collection.findUnique({
            where: { id: input.id },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
                items: input.includeItems ? {
                    orderBy: { order: 'asc' },
                } : false,
                _count: {
                    select: {
                        items: true,
                    },
                },
            },
        });

        if (!collection) return null;

        let itemsWithContent = [];

        if (input.includeItems && collection.items) {
            // Fetch content for each item
            itemsWithContent = await Promise.all(
                collection.items.map(async (item) => {
                    const content = await fetchContentByType(item.contentType, item.contentId);
                    return {
                        ...item,
                        content,
                    };
                })
            );
        }

        return {
            ...collection,
            tags: collection.tags.map(({ tag }) => tag),
            items: itemsWithContent,
        };
    });

// List collections with pagination and filtering
export const getCollections = os
    .input(z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
        isPublic: z.boolean().optional(),
        tagId: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('updatedAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .output(CollectionListSchema)
    .handler(async ({ input }) => {
        const skip = (input.page - 1) * input.limit;

        const where = {
            AND: [
                input.isPublic !== undefined ? { isPublic: input.isPublic } : {},
                input.tagId ? {
                    tags: {
                        some: {
                            tagId: input.tagId,
                        },
                    },
                } : {},
                input.search ? {
                    OR: [
                        { name: { contains: input.search, mode: 'insensitive' as const } },
                        { description: { contains: input.search, mode: 'insensitive' as const } },
                    ],
                } : {},
            ],
        };

        const orderBy = { [input.sortBy]: input.sortOrder };

        const [collections, total] = await Promise.all([
            prisma.collection.findMany({
                where,
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                    _count: {
                        select: {
                            items: true,
                        },
                    },
                },
                orderBy,
                skip,
                take: input.limit,
            }),
            prisma.collection.count({ where }),
        ]);

        return {
            collections: collections.map(collection => ({
                ...collection,
                tags: collection.tags.map(({ tag }) => tag),
            })),
            total,
            page: input.page,
            limit: input.limit,
            totalPages: Math.ceil(total / input.limit),
        };
    });

// Update collection
export const updateCollection = os
    .input(UpdateCollectionSchema)
    .output(CollectionSchema)
    .errors({
        NOT_FOUND: {
            message: 'Collection not found',
            status: 404,
        },
    })
    .handler(async ({ input, errors }) => {
        const { id, tagIds, ...updateData } = input;

        // Check if collection exists
        const existingCollection = await prisma.collection.findUnique({
            where: { id },
        });

        if (!existingCollection) {
            throw errors.NOT_FOUND();
        }

        const collection = await prisma.collection.update({
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
                _count: {
                    select: {
                        items: true,
                    },
                },
            },
        });

        return {
            ...collection,
            tags: collection.tags.map(({ tag }) => tag),
        };
    });

// Add item to collection
export const addItemToCollection = os
    .input(AddItemSchema)
    .output(z.object({
        success: z.boolean(),
        message: z.string(),
        item: CollectionItemSchema,
    }))
    .errors({
        COLLECTION_NOT_FOUND: {
            message: 'Collection not found',
            status: 404,
        },
        CONTENT_NOT_FOUND: {
            message: 'Content not found',
            status: 404,
        },
        ITEM_EXISTS: {
            message: 'Item already exists in collection',
            status: 409,
        },
    })
    .handler(async ({ input, errors }) => {
        // Check if collection exists
        const collection = await prisma.collection.findUnique({
            where: { id: input.collectionId },
        });

        if (!collection) {
            throw errors.COLLECTION_NOT_FOUND();
        }

        // Check if content exists
        const content = await fetchContentByType(input.contentType, input.contentId);
        if (!content) {
            throw errors.CONTENT_NOT_FOUND();
        }

        // Check if item already exists in collection
        const existingItem = await prisma.collectionItem.findUnique({
            where: {
                collectionId_contentId_contentType: {
                    collectionId: input.collectionId,
                    contentId: input.contentId,
                    contentType: input.contentType,
                },
            },
        });

        if (existingItem) {
            throw errors.ITEM_EXISTS();
        }

        // Get the next order if not provided
        let order = input.order;
        if (order === undefined) {
            const lastItem = await prisma.collectionItem.findFirst({
                where: { collectionId: input.collectionId },
                orderBy: { order: 'desc' },
            });
            order = (lastItem?.order || 0) + 1;
        }

        const item = await prisma.collectionItem.create({
            data: {
                collectionId: input.collectionId,
                contentType: input.contentType,
                contentId: input.contentId,
                note: input.note,
                order,
            },
        });

        return {
            success: true,
            message: 'Item added to collection successfully',
            item: {
                ...item,
                content,
            },
        };
    });

// Remove item from collection
export const removeItemFromCollection = os
    .input(z.object({
        itemId: z.string(),
    }))
    .output(z.object({
        success: z.boolean(),
        message: z.string(),
    }))
    .errors({
        NOT_FOUND: {
            message: 'Item not found in collection',
            status: 404,
        },
    })
    .handler(async ({ input, errors }) => {
        const existingItem = await prisma.collectionItem.findUnique({
            where: { id: input.itemId },
        });

        if (!existingItem) {
            throw errors.NOT_FOUND();
        }

        await prisma.collectionItem.delete({
            where: { id: input.itemId },
        });

        return {
            success: true,
            message: 'Item removed from collection successfully',
        };
    });

// Reorder items in collection
export const reorderCollectionItems = os
    .input(z.object({
        collectionId: z.string(),
        items: z.array(z.object({
            itemId: z.string(),
            order: z.number().int(),
        })),
    }))
    .output(z.object({
        success: z.boolean(),
        message: z.string(),
    }))
    .errors({
        COLLECTION_NOT_FOUND: {
            message: 'Collection not found',
            status: 404,
        },
    })
    .handler(async ({ input, errors }) => {
        // Check if collection exists
        const collection = await prisma.collection.findUnique({
            where: { id: input.collectionId },
        });

        if (!collection) {
            throw errors.COLLECTION_NOT_FOUND();
        }

        // Update order for each item
        await Promise.all(
            input.items.map(item =>
                prisma.collectionItem.update({
                    where: { id: item.itemId },
                    data: { order: item.order },
                })
            )
        );

        return {
            success: true,
            message: 'Items reordered successfully',
        };
    });

// Delete collection
export const deleteCollection = os
    .input(z.object({
        id: z.string(),
    }))
    .output(z.object({
        success: z.boolean(),
        message: z.string(),
    }))
    .errors({
        NOT_FOUND: {
            message: 'Collection not found',
            status: 404,
        },
    })
    .handler(async ({ input, errors }) => {
        const existingCollection = await prisma.collection.findUnique({
            where: { id: input.id },
        });

        if (!existingCollection) {
            throw errors.NOT_FOUND();
        }

        await prisma.collection.delete({
            where: { id: input.id },
        });

        return {
            success: true,
            message: 'Collection deleted successfully',
        };
    });

// Get collections by tag
export const getCollectionsByTag = os
    .input(z.object({
        tagSlug: z.string(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
    }))
    .output(CollectionListSchema)
    .handler(async ({ input }) => {
        const skip = (input.page - 1) * input.limit;

        const tag = await prisma.tag.findUnique({
            where: { slug: input.tagSlug },
        });

        if (!tag) {
            return {
                collections: [],
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

        const [collections, total] = await Promise.all([
            prisma.collection.findMany({
                where,
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                    _count: {
                        select: {
                            items: true,
                        },
                    },
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: input.limit,
            }),
            prisma.collection.count({ where }),
        ]);

        return {
            collections: collections.map(collection => ({
                ...collection,
                tags: collection.tags.map(({ tag }) => tag),
            })),
            total,
            page: input.page,
            limit: input.limit,
            totalPages: Math.ceil(total / input.limit),
        };
    });