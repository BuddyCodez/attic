import { ORPCError, os } from '@orpc/server';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { PublishStatus } from '@prisma/client';

// Validation schemas
const CreateNoteSchema = z.object({
    title: z.string().max(200).optional(),
    content: z.string().min(1),
    status: z.nativeEnum(PublishStatus).default(PublishStatus.DRAFT),
    tagIds: z.array(z.string()).optional(),
});

const UpdateNoteSchema = CreateNoteSchema.partial().extend({
    id: z.string(),
});

const NoteSchema = z.object({
    id: z.string(),
    title: z.string().nullable(),
    content: z.string(),
    status: z.nativeEnum(PublishStatus),
    createdAt: z.date(),
    updatedAt: z.date(),
    tags: z.array(z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        color: z.string().nullable(),
    })).optional(),
});

const NoteListSchema = z.object({
    notes: z.array(NoteSchema.omit({ content: true }).extend({
        contentPreview: z.string(),
    })),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

// Helper function to create content preview
function createContentPreview(content: string, maxLength: number = 150): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
}

// Create note
export const createNote = os
    .input(CreateNoteSchema)
    .output(NoteSchema)
    .errors({
        VALIDATION_ERROR: {
            message: 'Invalid input data',
            status: 400,
        },
    })
    .handler(async ({ input, errors }) => {
        try {
            const note = await prisma.note.create({
                data: {
                    title: input.title,
                    content: input.content,
                    status: input.status,
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
                ...note,
                tags: note.tags.map(({ tag }) => tag),
            };
        } catch (error) {
            throw errors.VALIDATION_ERROR();
        }
    });

// Get note by ID
export const getNote = os
    .input(z.object({
        id: z.string(),
    }))
    .output(NoteSchema.nullable())
    .handler(async ({ input }) => {
        const note = await prisma.note.findUnique({
            where: { id: input.id },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        if (!note) return null;

        return {
            ...note,
            tags: note.tags.map(({ tag }) => tag),
        };
    });

// List notes with filtering and pagination
export const getNotes = os
    .input(z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
        status: z.nativeEnum(PublishStatus).optional(),
        tagId: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('updatedAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .output(NoteListSchema)
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
                        { content: { contains: input.search, mode: 'insensitive' as const } },
                    ],
                } : {},
            ],
        };

        const orderBy = { [input.sortBy]: input.sortOrder };

        const [notes, total] = await Promise.all([
            prisma.note.findMany({
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
            prisma.note.count({ where }),
        ]);

        return {
            notes: notes.map(note => ({
                ...note,
                contentPreview: createContentPreview(note.content),
                tags: note.tags.map(({ tag }) => tag),
            })),
            total,
            page: input.page,
            limit: input.limit,
            totalPages: Math.ceil(total / input.limit),
        };
    });

// Update note
export const updateNote = os
    .input(UpdateNoteSchema)
    .output(NoteSchema)
    .errors({
        NOT_FOUND: {
            message: 'Note not found',
            status: 404,
        },
    })
    .handler(async ({ input, errors }) => {
        const { id, tagIds, ...updateData } = input;

        // Check if note exists
        const existingNote = await prisma.note.findUnique({
            where: { id },
        });

        if (!existingNote) {
            throw errors.NOT_FOUND();
        }

        const note = await prisma.note.update({
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
            },
        });

        return {
            ...note,
            tags: note.tags.map(({ tag }) => tag),
        };
    });

// Delete note
export const deleteNote = os
    .input(z.object({
        id: z.string(),
    }))
    .output(z.object({
        success: z.boolean(),
        message: z.string(),
    }))
    .errors({
        NOT_FOUND: {
            message: 'Note not found',
            status: 404,
        },
    })
    .handler(async ({ input, errors }) => {
        const existingNote = await prisma.note.findUnique({
            where: { id: input.id },
        });

        if (!existingNote) {
            throw errors.NOT_FOUND();
        }

        await prisma.note.delete({
            where: { id: input.id },
        });

        return {
            success: true,
            message: 'Note deleted successfully',
        };
    });

// Get notes by tag
export const getNotesByTag = os
    .input(z.object({
        tagSlug: z.string(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
    }))
    .output(NoteListSchema)
    .handler(async ({ input }) => {
        const skip = (input.page - 1) * input.limit;

        const tag = await prisma.tag.findUnique({
            where: { slug: input.tagSlug },
        });

        if (!tag) {
            return {
                notes: [],
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

        const [notes, total] = await Promise.all([
            prisma.note.findMany({
                where,
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: input.limit,
            }),
            prisma.note.count({ where }),
        ]);

        return {
            notes: notes.map(note => ({
                ...note,
                contentPreview: createContentPreview(note.content),
                tags: note.tags.map(({ tag }) => tag),
            })),
            total,
            page: input.page,
            limit: input.limit,
            totalPages: Math.ceil(total / input.limit),
        };
    });

// Publish/unpublish note
export const toggleNoteStatus = os
    .input(z.object({
        id: z.string(),
        status: z.nativeEnum(PublishStatus),
    }))
    .output(NoteSchema)
    .errors({
        NOT_FOUND: {
            message: 'Note not found',
            status: 404,
        },
    })
    .handler(async ({ input, errors }) => {
        const existingNote = await prisma.note.findUnique({
            where: { id: input.id },
        });

        if (!existingNote) {
            throw errors.NOT_FOUND();
        }

        const note = await prisma.note.update({
            where: { id: input.id },
            data: {
                status: input.status,
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
            ...note,
            tags: note.tags.map(({ tag }) => tag),
        };
    });

// Bulk operations for notes
export const bulkUpdateNotes = os
    .input(z.object({
        noteIds: z.array(z.string()),
        status: z.nativeEnum(PublishStatus).optional(),
        tagIds: z.array(z.string()).optional(),
    }))
    .output(z.object({
        updated: z.number(),
        message: z.string(),
    }))
    .handler(async ({ input }) => {
        const updateData: any = {};

        if (input.status) {
            updateData.status = input.status;
        }

        let updatedCount = 0;

        // Update basic fields
        if (Object.keys(updateData).length > 0) {
            const result = await prisma.note.updateMany({
                where: {
                    id: {
                        in: input.noteIds,
                    },
                },
                data: updateData,
            });
            updatedCount = result.count;
        }

        // Update tags if provided
        if (input.tagIds !== undefined) {
            // Remove all existing tags
            await prisma.noteTag.deleteMany({
                where: {
                    noteId: {
                        in: input.noteIds,
                    },
                },
            });

            // Add new tags
            if (input.tagIds.length > 0) {
                const tagRelations = input.noteIds.flatMap(noteId =>
                    input.tagIds!.map(tagId => ({
                        noteId,
                        tagId,
                    }))
                );

                await prisma.noteTag.createMany({
                    data: tagRelations,
                });
            }
        }

        return {
            updated: updatedCount,
            message: `Successfully updated ${updatedCount} notes`,
        };
    });