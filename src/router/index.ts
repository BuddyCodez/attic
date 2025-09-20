import { createTodo, getTodos } from "./todo";
import * as essay from "./essay";
import * as book from "./book";
import * as quote from "./quote";
import * as note from "./note";
import * as collection from "./collection";
import * as tag from "./tag";

export const router = {
    todo: {
        createTodo,
        getTodos
    },
    essay,
    book,
    quote,
    note,
    collection,
    tag,
};