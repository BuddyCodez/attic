"use client"

import { Button } from "~/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "~/lib/utils"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    itemsPerPage: number
    totalItems: number
}

export function Pagination({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }: PaginationProps) {
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    const getVisiblePages = () => {
        const delta = 2
        const range = []
        const rangeWithDots = []

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i)
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, "...")
        } else {
            rangeWithDots.push(1)
        }

        rangeWithDots.push(...range)

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push("...", totalPages)
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages)
        }

        return rangeWithDots
    }

    if (totalPages <= 1) return null

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-6 ">
            <div className="text-sm text-muted-foreground literary-body">
                Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of {totalItems.toLocaleString()} results
            </div>

            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="literary-accent hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                </Button>

                {getVisiblePages().map((page, index) => (
                    <div key={index}>
                        {page === "..." ? (
                            <div className="px-3 py-2">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </div>
                        ) : (
                            <Button
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => onPageChange(page as number)}
                                    className={cn("literary-accent hover:text-primary", currentPage === page && "hover:text-default") }
                            >
                                {page}
                            </Button>
                        )}
                    </div>
                ))}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="literary-accent hover:text-primary"
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    )
}
