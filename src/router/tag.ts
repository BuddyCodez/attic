import { ORPCError, os } from '@orpc/server';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

// Validation schemas
const CreateTagSchema = z.object({
    name: z.string().min(1).max(50),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

const UpdateTagSchema = CreateTagSchema.partial().extend({
    id: z.string(),
});

const TagSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    color: z.string().nullable(),
    createdAt: z.date(),
    _count: z.object({
        essays: z.number(),
        books: z.number(),
        quotes: z.number(),
        notes: z.number(),
        collections: z.number(),
    }).optional(),
});

const TagUsageSchema = z.object({
    tag: TagSchema,
    totalUsage: z.number(),
    usageBreakdown: z.object({
        essays: z.number(),
        books: z.number(),
        quotes: z.number(),
        notes: z.number(),
        collections: z.number(),
    }),
});

const TagListSchema = z.object({
    tags: z.array(TagSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

// Generate slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50);
}

// Create tag
export const createTag = os
    .input(CreateTagSchema)
    .output(TagSchema)
    .errors({
        VALIDATION_ERROR: {
            message: 'Invalid input data',
            status: 400,
        },
        NAME_EXISTS: {
            message: 'A tag with this name already exists',
            status: 409,
        },
    })
    .handler(async ({ input, errors }) => {
        const slug = generateSlug(input.name);

        // Check if name or slug already exists
        const existingTag = await prisma.tag.findFirst({
            where: {
                OR: [
                    { name: input.name },
                    { slug },
                ],
            },
        });

        if (existingTag) {
            throw errors.NAME_EXISTS();
        }

        try {
            const tag = await prisma.tag.create({
                data: {
                    name: input.name,
                    slug,
                    color: input.color || '#6366f1',
                },
                include: {
                    _count: {
                        select: {
                            essays: true,
                            books: true,
                            quotes: true,
                            notes: true,
                            collections: true,
                        },
                    },
                },
            });

            return tag;
        } catch (error) {
            throw errors.VALIDATION_ERROR();
        }
    });

// Get tag by ID or slug
export const getTag = os
    .input(z.object({
        identifier: z.string(), // Can be slug or ID
    }))
    .output(TagSchema.nullable())
    .handler(async ({ input }) => {
        const tag = await prisma.tag.findFirst({
            where: {
                OR: [
                    { slug: input.identifier },
                    { id: input.identifier },
                ],
            },
            include: {
                _count: {
                    select: {
                        essays: true,
                        books: true,
                        quotes: true,
                        notes: true,
                        collections: true,
                    },
                },
            },
        });

        return tag;
    });

// List tags with pagination and filtering
export const getTags = os
    .input(z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(20),
        search: z.string().optional(),
        sortBy: z.enum(['name', 'createdAt', 'usage']).default('name'),
        sortOrder: z.enum(['asc', 'desc']).default('asc'),
        includeUnused: z.boolean().default(true),
    }))
    .output(TagListSchema)
    .handler(async ({ input }) => {
        const skip = (input.page - 1) * input.limit;

        let where: any = {};

        if (input.search) {
            where.name = {
                contains: input.search,
                mode: 'insensitive',
            };
        }

        // If not including unused tags, filter them out
        if (!input.includeUnused) {
            where.OR = [
                { essays: { some: {} } },
                { books: { some: {} } },
                { quotes: { some: {} } },
                { notes: { some: {} } },
                { collections: { some: {} } },
            ];
        }

        let orderBy: any = {};
        if (input.sortBy === 'usage') {
            // For usage sorting, we'll handle it differently
            const tags = await prisma.tag.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            essays: true,
                            books: true,
                            quotes: true,
                            notes: true,
                            collections: true,
                        },
                    },
                },
            });

            // Sort by total usage
            const sortedTags = tags.sort((a, b) => {
                const aTotal = a._count.essays + a._count.books + a._count.quotes + a._count.notes + a._count.collections;
                const bTotal = b._count.essays + b._count.books + b._count.quotes + b._count.notes + b._count.collections;
                return input.sortOrder === 'desc' ? bTotal - aTotal : aTotal - bTotal;
            });

            const total = sortedTags.length;
            const paginatedTags = sortedTags.slice(skip, skip + input.limit);

            return {
                tags: paginatedTags,
                total,
                page: input.page,
                limit: input.limit,
                totalPages: Math.ceil(total / input.limit),
            };
        } else {
            orderBy[input.sortBy] = input.sortOrder;
        }

        const [tags, total] = await Promise.all([
            prisma.tag.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            essays: true,
                            books: true,
                            quotes: true,
                            notes: true,
                            collections: true,
                        },
                    },
                },
                orderBy,
                skip,
                take: input.limit,
            }),
            prisma.tag.count({ where }),
        ]);

        return {
            tags,
            total,
            page: input.page,
            limit: input.limit,
            totalPages: Math.ceil(total / input.limit),
        };
    });

// Update tag
export const updateTag = os
    .input(UpdateTagSchema)
    .output(TagSchema)
    .errors({
        NOT_FOUND: {
            message: 'Tag not found',
            status: 404,
        },
        NAME_EXISTS: {
            message: 'A tag with this name already exists',
            status: 409,
        },
    })
    .handler(async ({ input, errors }) => {
        const { id, ...updateData } = input;

        // Check if tag exists
        const existingTag = await prisma.tag.findUnique({
            where: { id },
        });

        if (!existingTag) {
            throw errors.NOT_FOUND();
        }

        // Generate new slug if name is being updated
        let newSlug = existingTag.slug;
        if (updateData.name && updateData.name !== existingTag.name) {
            newSlug = generateSlug(updateData.name);

            // Check if new name/slug already exists
            const nameExists = await prisma.tag.findFirst({
                where: {
                    AND: [
                        { id: { not: id } },
                        {
                            OR: [
                                { name: updateData.name },
                                { slug: newSlug },
                            ],
                        },
                    ],
                },
            });

            if (nameExists) {
                throw errors.NAME_EXISTS();
            }
        }

        const tag = await prisma.tag.update({
            where: { id },
            data: {
                ...updateData,
                slug: newSlug,
            },
            include: {
                _count: {
                    select: {
                        essays: true,
                        books: true,
                        quotes: true,
                        notes: true,
                        collections: true,
                    },
                },
            },
        });

        return tag;
    });

// Delete tag
export const deleteTag = os
    .input(z.object({
        id: z.string(),
    }))
    .output(z.object({
        success: z.boolean(),
        message: z.string(),
    }))
    .errors({
        NOT_FOUND: {
            message: 'Tag not found',
            status: 404,
        },
    })
    .handler(async ({ input, errors }) => {
        const existingTag = await prisma.tag.findUnique({
            where: { id: input.id },
        });

        if (!existingTag) {
            throw errors.NOT_FOUND();
        }

        await prisma.tag.delete({
            where: { id: input.id },
        });

        return {
            success: true,
            message: 'Tag deleted successfully',
        };
    });

// Get tag usage statistics
export const getTagUsage = os
    .input(z.object({
        tagId: z.string(),
    }))
    .output(TagUsageSchema.nullable())
    .handler(async ({ input }) => {
        const tag = await prisma.tag.findUnique({
            where: { id: input.tagId },
            include: {
                _count: {
                    select: {
                        essays: true,
                        books: true,
                        quotes: true,
                        notes: true,
                        collections: true,
                    },
                },
            },
        });

        if (!tag) return null;

        const totalUsage = tag._count.essays + tag._count.books + tag._count.quotes + tag._count.notes + tag._count.collections;

        return {
            tag,
            totalUsage,
            usageBreakdown: {
                essays: tag._count.essays,
                books: tag._count.books,
                quotes: tag._count.quotes,
                notes: tag._count.notes,
                collections: tag._count.collections,
            },
        };
    });

// Get most used tags
export const getMostUsedTags = os
    .input(z.object({
        limit: z.number().int().positive().max(50).default(10),
    }))
    .output(z.array(TagUsageSchema))
    .handler(async ({ input }) => {
        const tags = await prisma.tag.findMany({
            include: {
                _count: {
                    select: {
                        essays: true,
                        books: true,
                        quotes: true,
                        notes: true,
                        collections: true,
                    },
                },
            },
        });

        // Calculate total usage and sort
        const tagsWithUsage = tags.map(tag => {
            const totalUsage = tag._count.essays + tag._count.books + tag._count.quotes + tag._count.notes + tag._count.collections;
            return {
                tag,
                totalUsage,
                usageBreakdown: {
                    essays: tag._count.essays,
                    books: tag._count.books,
                    quotes: tag._count.quotes,
                    notes: tag._count.notes,
                    collections: tag._count.collections,
                },
            };
        }).filter(item => item.totalUsage > 0)
            .sort((a, b) => b.totalUsage - a.totalUsage)
            .slice(0, input.limit);

        return tagsWithUsage;
    });

// Get unused tags
export const getUnusedTags = os
    .input(z.object({
        limit: z.number().int().positive().max(50).default(10),
    }))
    .output(z.array(TagSchema))
    .handler(async ({ input }) => {
        const tags = await prisma.tag.findMany({
            where: {
                AND: [
                    { essays: { none: {} } },
                    { books: { none: {} } },
                    { quotes: { none: {} } },
                    { notes: { none: {} } },
                    { collections: { none: {} } },
                ],
            },
            include: {
                _count: {
                    select: {
                        essays: true,
                        books: true,
                        quotes: true,
                        notes: true,
                        collections: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: input.limit,
        });

        return tags;
    });

// Merge tags (move all content from source tag to target tag, then delete source)
export const mergeTags = os
    .input(z.object({
        sourceTagId: z.string(),
        targetTagId: z.string(),
    }))
    .output(z.object({
        success: z.boolean(),
        message: z.string(),
        mergedCount: z.object({
            essays: z.number(),
            books: z.number(),
            quotes: z.number(),
            notes: z.number(),
            collections: z.number(),
        }),
    }))
    .errors({
        SOURCE_NOT_FOUND: {
            message: 'Source tag not found',
            status: 404,
        },
        TARGET_NOT_FOUND: {
            message: 'Target tag not found',
            status: 404,
        },
        SAME_TAG: {
            message: 'Cannot merge a tag with itself',
            status: 400,
        },
    })
    .handler(async ({ input, errors }) => {
        if (input.sourceTagId === input.targetTagId) {
            throw errors.SAME_TAG();
        }

        const [sourceTag, targetTag] = await Promise.all([
            prisma.tag.findUnique({ where: { id: input.sourceTagId } }),
            prisma.tag.findUnique({ where: { id: input.targetTagId } }),
        ]);

        if (!sourceTag) {
            throw errors.SOURCE_NOT_FOUND();
        }

        if (!targetTag) {
            throw errors.TARGET_NOT_FOUND();
        }

        // Move all relationships from source to target
        const updates = await Promise.all([
            prisma.essayTag.updateMany({
                where: { tagId: input.sourceTagId },
                data: { tagId: input.targetTagId },
            }),
            prisma.bookTag.updateMany({
                where: { tagId: input.sourceTagId },
                data: { tagId: input.targetTagId },
            }),
            prisma.quoteTag.updateMany({
                where: { tagId: input.sourceTagId },
                data: { tagId: input.targetTagId },
            }),
            prisma.noteTag.updateMany({
                where: { tagId: input.sourceTagId },
                data: { tagId: input.targetTagId },
            }),
            prisma.collectionTag.updateMany({
                where: { tagId: input.sourceTagId },
                data: { tagId: input.targetTagId },
            }),
        ]);

        // Delete the source tag
        await prisma.tag.delete({
            where: { id: input.sourceTagId },
        });

        return {
            success: true,
            message: `Successfully merged "${sourceTag.name}" into "${targetTag.name}"`,
            mergedCount: {
                essays: updates[0].count,
                books: updates[1].count,
                quotes: updates[2].count,
                notes: updates[3].count,
                collections: updates[4].count,
            },
        };
    });