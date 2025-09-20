import { ORPCError, os } from '@orpc/server';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { PublishStatus } from '@prisma/client';

// Validation schemas
const CreateEssaySchema = z.object({
    title: z.string().min(1).max(200),
    subtitle: z.string().max(500).optional(),
    content: z.string().min(1),
    excerpt: z.string().max(500).optional(),
    readTime: z.number().int().positive().optional(),
    coverImage: z.string().url().optional(),
    status: z.nativeEnum(PublishStatus).default(PublishStatus.PUBLISHED),
    tagIds: z.array(z.string()).optional(),
});

const UpdateEssaySchema = CreateEssaySchema.partial().extend({
    id: z.string(),
});

const EssaySchema = z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    subtitle: z.string().nullable(),
    content: z.string(),
    excerpt: z.string().nullable(),
    readTime: z.number().nullable(),
    coverImage: z.string().nullable(),
    status: z.nativeEnum(PublishStatus),
    publishedAt: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
    tags: z.array(z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        color: z.string().nullable(),
    })).optional(),
});

const EssayListSchema = z.object({
    essays: z.array(EssaySchema.omit({ content: true })),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

// Generate slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50);
}

// Create essay
export const createEssay = os
    .input(CreateEssaySchema)
    .output(EssaySchema)
    .errors({
        VALIDATION_ERROR: {
            message: 'Invalid input data',
            status: 400,
        },
        SLUG_EXISTS: {
            message: 'An essay with this title already exists',
            status: 409,
        },
    })
    .handler(async ({ input, errors }) => {
        const slug = generateSlug(input.title);

        // Check if slug already exists
        const existingEssay = await prisma.essay.findUnique({
            where: { slug },
        });

        if (existingEssay) {
            throw errors.SLUG_EXISTS();
        }

        try {
            const essay = await prisma.essay.create({
                data: {
                    title: input.title,
                    subtitle: input.subtitle,
                    content: input.content,
                    excerpt: input.excerpt,
                    readTime: input.readTime,
                    coverImage: input.coverImage,
                    status: input.status,
                    slug,
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
                },
            });

            return {
                ...essay,
                tags: essay.tags.map(({ tag }) => tag),
            };
        } catch (error) {
            throw errors.VALIDATION_ERROR();
        }
    });

// Get essay by slug or ID
export const getEssay = os
    .input(z.object({
        identifier: z.string(), // Can be slug or ID
    }))
    .output(EssaySchema.nullable())
    .handler(async ({ input }) => {
        const essay = await prisma.essay.findFirst({
            where: {
                OR: [
                    { slug: input.identifier },
                    { id: input.identifier },
                ],
            },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        if (!essay) return null;

        return {
            ...essay,
            tags: essay.tags.map(({ tag }) => tag),
        };
    });

// List essays with pagination and filtering
export const getEssays = os
    .input(z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
        status: z.nativeEnum(PublishStatus).optional(),
        tagId: z.string().optional(),
        search: z.string().optional(),
    }))
    .output(EssayListSchema)
    .handler(async ({ input }) => {
        const skip = (input.page - 1) * input.limit;

        const where = {
            AND: [
                input.status ? { status: input.status } : {},
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
                        { subtitle: { contains: input.search, mode: 'insensitive' as const } },
                        { excerpt: { contains: input.search, mode: 'insensitive' as const } },
                    ],
                } : {},
            ],
        };

        const [essays, total] = await Promise.all([
            prisma.essay.findMany({
                where,
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
                orderBy: { publishedAt: 'desc' },
                skip,
                take: input.limit,
            }),
            prisma.essay.count({ where }),
        ]);

        return {
            essays: essays.map(essay => ({
                ...essay,
                tags: essay.tags.map(({ tag }) => tag),
            })),
            total,
            page: input.page,
            limit: input.limit,
            totalPages: Math.ceil(total / input.limit),
        };
    });

// Update essay
export const updateEssay = os
    .input(UpdateEssaySchema)
    .output(EssaySchema)
    .errors({
        NOT_FOUND: {
            message: 'Essay not found',
            status: 404,
        },
        SLUG_EXISTS: {
            message: 'An essay with this title already exists',
            status: 409,
        },
    })
    .handler(async ({ input, errors }) => {
        const { id, tagIds, ...updateData } = input;

        // Check if essay exists
        const existingEssay = await prisma.essay.findUnique({
            where: { id },
        });

        if (!existingEssay) {
            throw errors.NOT_FOUND();
        }

        // Generate new slug if title is being updated
        let newSlug = existingEssay.slug;
        if (updateData.title && updateData.title !== existingEssay.title) {
            newSlug = generateSlug(updateData.title);

            // Check if new slug already exists
            const slugExists = await prisma.essay.findUnique({
                where: { slug: newSlug },
            });

            if (slugExists && slugExists.id !== id) {
                throw errors.SLUG_EXISTS();
            }
        }

        const essay = await prisma.essay.update({
            where: { id },
            data: {
                ...updateData,
                slug: newSlug,
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
            },
        });

        return {
            ...essay,
            tags: essay.tags.map(({ tag }) => tag),
        };
    });

// Delete essay
export const deleteEssay = os
    .input(z.object({
        id: z.string(),
    }))
    .output(z.object({
        success: z.boolean(),
        message: z.string(),
    }))
    .errors({
        NOT_FOUND: {
            message: 'Essay not found',
            status: 404,
        },
    })
    .handler(async ({ input, errors }) => {
        const existingEssay = await prisma.essay.findUnique({
            where: { id: input.id },
        });

        if (!existingEssay) {
            throw errors.NOT_FOUND();
        }

        await prisma.essay.delete({
            where: { id: input.id },
        });

        return {
            success: true,
            message: 'Essay deleted successfully',
        };
    });

// Get essays by tag
export const getEssaysByTag = os
    .input(z.object({
        tagSlug: z.string(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
    }))
    .output(EssayListSchema)
    .handler(async ({ input }) => {
        const skip = (input.page - 1) * input.limit;

        const tag = await prisma.tag.findUnique({
            where: { slug: input.tagSlug },
        });

        if (!tag) {
            return {
                essays: [],
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
            status: PublishStatus.PUBLISHED,
        };

        const [essays, total] = await Promise.all([
            prisma.essay.findMany({
                where,
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
                orderBy: { publishedAt: 'desc' },
                skip,
                take: input.limit,
            }),
            prisma.essay.count({ where }),
        ]);

        return {
            essays: essays.map(essay => ({
                ...essay,
                tags: essay.tags.map(({ tag }) => tag),
            })),
            total,
            page: input.page,
            limit: input.limit,
            totalPages: Math.ceil(total / input.limit),
        };
    });