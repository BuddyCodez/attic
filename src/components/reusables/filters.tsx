"use client"

import { useState } from "react"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Search, Filter, X } from "lucide-react"

interface FilterBarProps {
    searchTerm: string
    onSearchChange: (term: string) => void
    selectedTags: string[]
    onTagToggle: (tag: string) => void
    availableTags: string[]
    sortBy: string
    onSortChange: (sort: string) => void
    sortOptions: { value: string; label: string }[]
    totalCount: number
    filteredCount: number
}

export function FilterBar({
    searchTerm,
    onSearchChange,
    selectedTags,
    onTagToggle,
    availableTags,
    sortBy,
    onSortChange,
    sortOptions,
    totalCount,
    filteredCount,
}: FilterBarProps) {
    const [showAllTags, setShowAllTags] = useState(false)
    const displayTags = showAllTags ? availableTags : availableTags.slice(0, 8)

    return (
        <div className="space-y-6 mb-8 p-6">
            {/* Search and Sort */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search through the endless collection..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 literary-body border-1 border-foreground hover:border-foreground/80 focus:border-foreground/80"
                    />
                </div>
                <Select value={sortBy} onValueChange={onSortChange} >
                    <SelectTrigger className="w-full md:w-48 literary-body border-1 border-foreground hover:border-foreground/80 focus:border-foreground/80">
                        <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent className="border-1 border-foreground hover:border-foreground/80 focus:border-foreground/80">
                        {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="literary-body">
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Tags Filter */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground literary-accent flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filter by topics
                    </h3>
                    {selectedTags.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => selectedTags.forEach(onTagToggle)}
                            className="text-xs literary-accent"
                        >
                            Clear all
                        </Button>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {displayTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag)
                        return (
                            <Badge
                                key={tag}
                                variant={isSelected ? "default" : "outline"}
                                className="cursor-pointer interactive-element literary-accent"
                                onClick={() => onTagToggle(tag)}
                            >
                                {tag}
                                {isSelected && <X className="ml-1 h-3 w-3" />}
                            </Badge>
                        )
                    })}
                    {availableTags.length > 8 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAllTags(!showAllTags)}
                            className="text-xs literary-accent"
                        >
                            {showAllTags ? "Show less" : `+${availableTags.length - 8} more`}
                        </Button>
                    )}
                </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground literary-body">
                Showing {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} items
                {selectedTags.length > 0 && <span className="ml-2">• Filtered by: {selectedTags.join(", ")}</span>}
            </div>
        </div>
    )
}
