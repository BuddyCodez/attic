import type { IncomingHttpHeaders } from 'node:http'
import { ORPCError, os } from '@orpc/server'
import z from 'zod'
const TodoSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),

});
const todosMap = new Map<string, z.infer<typeof TodoSchema>>();
export const createTodo = os.input(
    z.object({
        title: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
    })
).output(TodoSchema).handler(async ({ ctx, input }) => {
    const todo = {
        id: Math.random().toString(36).substring(2, 15),
        title: input.title,
        description: input.description || null,
    }
    todosMap.set(todo.id, todo);
    return todo;
})
export const getTodos = os
    .input(
        z.object({
            amount: z.number(),
        })
    )
    .output(z.array(TodoSchema))
    .errors({
        FORBIDDEN: {
            message: "You are not authorized to do this",
            status: 403,
        },
    })

    .handler(async ({ context, input, errors }) => {
        if (input.amount > 10) {
            throw errors.FORBIDDEN();
        }
        // if todos map empty add some
        if (todosMap.size === 0) {
            todosMap.set("1", { id: "1", title: "First Todo", description: "This is the first todo" });
            todosMap.set("2", { id: "2", title: "Second Todo", description: "This is the second todo" });
            todosMap.set("3", { id: "3", title: "Third Todo", description: "This is the third todo" });
        }

        const todos = Array.from(todosMap.values()).slice(0, input.amount);

        return todos;
    });
