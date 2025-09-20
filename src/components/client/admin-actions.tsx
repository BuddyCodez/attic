"use client";
import { useState } from 'react'
import { Button } from '../ui/button'
import { BookOpen, FileText, Quote, StickyNote } from 'lucide-react'
import { AddBookModal } from './add-book-modal';

export const AdminActions = () => {
    const [isOpenBookModal, setIsOpenBookModal] = useState(false);
    return (
        <>
            <Button className="h-20 flex-col gap-2">
                <FileText className="h-6 w-6" />
                New Essay
            </Button>
            <Button className="h-20 flex-col gap-2"
            onClick={() => setIsOpenBookModal(true)}
            >
                <BookOpen className="h-6 w-6" />
                Add Book
            </Button>
            <Button className="h-20 flex-col gap-2">
                <Quote className="h-6 w-6" />
                Save Quote
            </Button>
            <Button className="h-20 flex-col gap-2">
                <StickyNote className="h-6 w-6" />
                Write Note
            </Button>

            {/* // modals goes here  */}
            <AddBookModal
                isOpen={isOpenBookModal}
                onOpenChange={setIsOpenBookModal}
            />
        </>
    )
}

