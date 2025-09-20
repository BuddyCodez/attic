"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "~/components/ui/drawer";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    Star,
    Calendar,
    User,
    BookOpen,
    Clock,
    Target,
    Quote,
    ExternalLink,
    BookmarkPlus,
    Plus,
    Save,
    X,
    Upload
} from "lucide-react";
import Image from "next/image";
import { useMediaQuery } from "~/lib/use-media-query";
import { client } from "~/lib/orpc";
import { useToast } from "~/components/ui/use-toast";

// Types based on router schema
type BookStatus = 'WANT_TO_READ' | 'CURRENTLY_READING' | 'READ' | 'DNF';

interface AddBookFormData {
    title: string;
    author: string;
    isbn: string; // Always string, empty string instead of undefined
    coverImage: string; // Always string, empty string instead of undefined
    description: string; // Always string, empty string instead of undefined
    pages?: number;
    publishedYear?: number;
    language: string;
    status: BookStatus;
    notes: string; // Always string, empty string instead of undefined
}

interface AddBookModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onBookAdded?: () => void;
}

const bookStatuses = {
    WANT_TO_READ: "Want to Read",
    CURRENTLY_READING: "Currently Reading",
    READ: "Read",
    DNF: "Did Not Finish",
};

export function AddBookModal({ isOpen, onOpenChange, onBookAdded }: AddBookModalProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [formData, setFormData] = useState<AddBookFormData>({
        title: '',
        author: '',
        isbn: '',
        coverImage: '',
        description: '',
        pages: undefined,
        publishedYear: undefined,
        language: 'en',
        status: 'WANT_TO_READ',
        notes: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleClose = useCallback(() => {
        onOpenChange(false);
        // Reset form after closing
        setTimeout(() => {
            setFormData({
                title: '',
                author: '',
                isbn: '',
                coverImage: '',
                description: '',
                pages: undefined,
                publishedYear: undefined,
                language: 'en',
                status: 'WANT_TO_READ',
                notes: ''
            });
            setErrors({});
        }, 300);
    }, [onOpenChange]);

    const handleInputChange = useCallback((field: keyof AddBookFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: field === 'pages' || field === 'publishedYear'
                ? (value === '' || value === 0 ? undefined : value)
                : (value === '' ? '' : value) // Keep string fields as empty strings, not undefined
        }));

        // Clear error when user starts typing
        setErrors(prev => {
            if (prev[field]) {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            }
            return prev;
        });
    }, []); // Remove errors from dependency array

    const validateForm = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length > 200) {
            newErrors.title = 'Title must be 200 characters or less';
        }

        if (!formData.author.trim()) {
            newErrors.author = 'Author is required';
        } else if (formData.author.length > 100) {
            newErrors.author = 'Author must be 100 characters or less';
        }

        if (formData.description && formData.description.length > 2000) {
            newErrors.description = 'Description must be 2000 characters or less';
        }

        if (formData.notes && formData.notes.length > 5000) {
            newErrors.notes = 'Notes must be 5000 characters or less';
        }

        if (formData.pages && formData.pages <= 0) {
            newErrors.pages = 'Pages must be a positive number';
        }

        if (formData.publishedYear) {
            const currentYear = new Date().getFullYear();
            if (formData.publishedYear < 1 || formData.publishedYear > currentYear) {
                newErrors.publishedYear = `Published year must be between 1 and ${currentYear}`;
            }
        }

        if (formData.coverImage && formData.coverImage.trim() && !isValidUrl(formData.coverImage)) {
            newErrors.coverImage = 'Cover image must be a valid URL';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const isValidUrl = useCallback((string: string): boolean => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            // Prepare data according to router schema
            const bookData = {
                title: formData.title.trim(),
                author: formData.author.trim(),
                isbn: formData.isbn.trim() || undefined,
                coverImage: formData.coverImage.trim() || undefined,
                description: formData.description.trim() || undefined,
                pages: formData.pages || undefined,
                publishedYear: formData.publishedYear || undefined,
                language: formData.language,
                status: formData.status,
                notes: formData.notes.trim() || undefined,
            };

            await client.book.createBook(bookData);

            toast({
                title: "Book added successfully!",
                description: `"${formData.title}" by ${formData.author} has been added to your library.`,
            });

            onBookAdded?.();
            handleClose();
        } catch (error: any) {
            console.error('Failed to create book:', error);

            // Handle specific errors from the router
            if (error.message?.includes('ISBN already exists')) {
                setErrors({ isbn: 'A book with this ISBN already exists' });
                toast({
                    variant: "destructive",
                    title: "Duplicate ISBN",
                    description: "A book with this ISBN already exists in your library.",
                });
            } else if (error.message?.includes('Invalid input')) {
                setErrors({ general: 'Please check your input and try again' });
                toast({
                    variant: "destructive",
                    title: "Validation Error",
                    description: "Please check your input and try again.",
                });
            } else {
                setErrors({ general: 'Failed to create book. Please try again.' });
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to create book. Please try again.",
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [validateForm, formData, toast, onBookAdded, handleClose]);

    const AddBookContent = useMemo(() => (
        <div className="space-y-6 max-h-[80vh] overflow-y-auto scroll-container">
            {/* General error */}
            {errors.general && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    {errors.general}
                </div>
            )}

            {/* Header section */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold literary-heading text-primary mb-2">
                        Add New Book
                    </h2>
                    <p className="text-muted-foreground literary-body">
                        Add a new book to your digital library
                    </p>
                </div>
            </div>

            <Separator />

            {/* Basic Information */}
            <div className="space-y-4 px-4">
                <h3 className="text-lg font-semibold literary-heading">Basic Information</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="Enter book title"
                            className={errors.title ? 'border-destructive' : ''}
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">{errors.title}</p>
                        )}
                    </div>

                    {/* Author */}
                    <div className="space-y-2">
                        <Label htmlFor="author">
                            Author <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="author"
                            value={formData.author}
                            onChange={(e) => handleInputChange('author', e.target.value)}
                            placeholder="Enter author name"
                            className={errors.author ? 'border-destructive' : ''}
                        />
                        {errors.author && (
                            <p className="text-sm text-destructive">{errors.author}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* ISBN */}
                    <div className="space-y-2">
                        <Label htmlFor="isbn">ISBN</Label>
                        <Input
                            id="isbn"
                            value={formData.isbn}
                            onChange={(e) => handleInputChange('isbn', e.target.value)}
                            placeholder="978-0123456789"
                            className={errors.isbn ? 'border-destructive' : ''}
                        />
                        {errors.isbn && (
                            <p className="text-sm text-destructive">{errors.isbn}</p>
                        )}
                    </div>

                    {/* Pages */}
                    <div className="space-y-2">
                        <Label htmlFor="pages">Pages</Label>
                        <Input
                            id="pages"
                            type="number"
                            value={formData.pages?.toString() || ''}
                            onChange={(e) => handleInputChange('pages', parseInt(e.target.value) || 0)}
                            placeholder="300"
                            min="1"
                            className={errors.pages ? 'border-destructive' : ''}
                        />
                        {errors.pages && (
                            <p className="text-sm text-destructive">{errors.pages}</p>
                        )}
                    </div>

                    {/* Published Year */}
                    <div className="space-y-2">
                        <Label htmlFor="publishedYear">Published Year</Label>
                        <Input
                            id="publishedYear"
                            type="number"
                            value={formData.publishedYear?.toString() || ''}
                            onChange={(e) => handleInputChange('publishedYear', parseInt(e.target.value) || 0)}
                            placeholder="2024"
                            min="1"
                            max={new Date().getFullYear()}
                            className={errors.publishedYear ? 'border-destructive' : ''}
                        />
                        {errors.publishedYear && (
                            <p className="text-sm text-destructive">{errors.publishedYear}</p>
                        )}
                    </div>
                </div>

                {/* Cover Image URL */}
                <div className="space-y-2">
                    <Label htmlFor="coverImage">Cover Image URL</Label>
                    <Input
                        id="coverImage"
                        value={formData.coverImage}
                        onChange={(e) => handleInputChange('coverImage', e.target.value)}
                        placeholder="https://example.com/book-cover.jpg"
                        className={errors.coverImage ? 'border-destructive' : ''}
                    />
                    {errors.coverImage && (
                        <p className="text-sm text-destructive">{errors.coverImage}</p>
                    )}
                    {formData.coverImage && formData.coverImage.trim() && isValidUrl(formData.coverImage) && (
                        <div className="mt-2">
                            <Image
                                src={formData.coverImage}
                                alt="Book cover preview"
                                width={80}
                                height={120}
                                className="rounded shadow-sm"
                                onError={() => setErrors(prev => ({ ...prev, coverImage: 'Invalid image URL' }))}
                            />
                        </div>
                    )}
                </div>
            </div>

            <Separator />

            {/* Status and Progress */}
            <div className="space-y-4 px-4">
                <h3 className="text-lg font-semibold literary-heading">Reading Status</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: BookStatus) => handleInputChange('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(bookStatuses).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Language */}
                    <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                            value={formData.language}
                            onValueChange={(value) => handleInputChange('language', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="it">Italian</SelectItem>
                                <SelectItem value="pt">Portuguese</SelectItem>
                                <SelectItem value="ja">Japanese</SelectItem>
                                <SelectItem value="ko">Korean</SelectItem>
                                <SelectItem value="zh">Chinese</SelectItem>
                                <SelectItem value="hi">Hindi</SelectItem>
                                <SelectItem value="ar">Arabic</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Description and Notes */}
            <div className="space-y-4 px-4">
                <h3 className="text-lg font-semibold literary-heading">Additional Information</h3>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Book description or synopsis..."
                        className={`min-h-[100px] ${errors.description ? 'border-destructive' : ''}`}
                        maxLength={2000}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        {errors.description && (
                            <span className="text-destructive">{errors.description}</span>
                        )}
                        <span className="ml-auto">
                            {formData.description?.length || 0}/2000
                        </span>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <Label htmlFor="notes">Personal Notes</Label>
                    <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Your thoughts, quotes, or notes about this book..."
                        className={`min-h-[100px] ${errors.notes ? 'border-destructive' : ''}`}
                        maxLength={5000}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        {errors.notes && (
                            <span className="text-destructive">{errors.notes}</span>
                        )}
                        <span className="ml-auto">
                            {formData.notes?.length || 0}/5000
                        </span>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex items-center gap-2 sm:order-2"
                >
                    {isLoading ? (
                        <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Add Book
                        </>
                    )}
                </Button>

                <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex items-center gap-2 sm:order-1"
                >
                    <X className="h-4 w-4" />
                    Cancel
                </Button>
            </div>
        </div>
    ), [formData, errors, handleInputChange, isValidUrl, handleSubmit, isLoading, handleClose]);

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="sr-only">Add New Book</DialogTitle>
                    </DialogHeader>
                    {AddBookContent}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={isOpen} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[90vh] overflow-hidden">
                <DrawerHeader className="pb-4">
                    <DrawerTitle className="sr-only">Add New Book</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-4">
                    {AddBookContent}
                </div>
            </DrawerContent>
        </Drawer>
    );
}

// Hook for triggering the add book modal
export function useAddBookModal() {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    return {
        isOpen,
        openModal,
        closeModal,
        AddBookModal: (
            <AddBookModal
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                onBookAdded={closeModal}
            />
        )
    };
}

