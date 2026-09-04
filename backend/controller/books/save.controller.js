// controllers/books/save.controller.js
import BookSave from '../../models/books/bookSave.model.js';
import SaveList from '../../models/books/saveList.model.js';
import Book from '../../models/books/books.model.js';

// ========== LIST MANAGEMENT ==========

// Create a new list
export const createList = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, color, icon, description } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "List name is required"
            });
        }

        // Check for duplicate list name
        const existingList = await SaveList.findOne({ userId, name });
        if (existingList) {
            return res.status(400).json({
                success: false,
                message: "A list with this name already exists"
            });
        }

        // Create list
        const list = await SaveList.create({
            userId,
            name: name.trim(),
            color: color || '#c8963e',
            icon: icon || '📚',
            description: description || '',
            isDefault: false
        });

        return res.status(201).json({
            success: true,
            message: "List created successfully",
            list
        });

    } catch (error) {
        console.error('Create list error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Get all lists for a user
export const getUserLists = async (req, res) => {
    try {
        const userId = req.user._id;

        const lists = await SaveList.find({ userId })
            .sort({ isDefault: -1, createdAt: -1 });

        // Get book count for each list
        const listsWithCount = await Promise.all(lists.map(async (list) => {
            const count = await BookSave.countDocuments({ 
                userId, 
                listId: list._id 
            });
            return {
                ...list.toObject(),
                bookCount: count
            };
        }));

        return res.status(200).json({
            success: true,
            lists: listsWithCount
        });

    } catch (error) {
        console.error('Get user lists error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Update a list
export const updateList = async (req, res) => {
    try {
        const userId = req.user._id;
        const { listId } = req.params;
        const { name, color, icon, description, isDefault } = req.body;

        // Find list
        const list = await SaveList.findOne({ _id: listId, userId });
        if (!list) {
            return res.status(404).json({
                success: false,
                message: "List not found"
            });
        }

        // ✅ Handle default logic in controller
        if (isDefault === true && !list.isDefault) {
            // Set all other lists to not default
            await SaveList.updateMany(
                { userId, _id: { $ne: listId } },
                { isDefault: false }
            );
        }

        // Update fields
        if (name !== undefined) list.name = name.trim();
        if (color !== undefined) list.color = color;
        if (icon !== undefined) list.icon = icon;
        if (description !== undefined) list.description = description;
        if (isDefault !== undefined) list.isDefault = isDefault;

        await list.save();

        return res.status(200).json({
            success: true,
            message: "List updated successfully",
            list
        });

    } catch (error) {
        console.error('Update list error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Delete a list
export const deleteList = async (req, res) => {
    try {
        const userId = req.user._id;
        const { listId } = req.params;

        // Find list
        const list = await SaveList.findOne({ _id: listId, userId });
        if (!list) {
            return res.status(404).json({
                success: false,
                message: "List not found"
            });
        }

        // Prevent deletion of default list
        if (list.isDefault) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete the default 'Favorites' list"
            });
        }

        // Get all book saves in this list
        const savesInList = await BookSave.find({ userId, listId });
        
        // Delete all book saves in this list
        await BookSave.deleteMany({ userId, listId });

        // Update totalSaves for each unique book
        const uniqueBookIds = [...new Set(savesInList.map(save => save.bookId.toString()))];
        
        for (const bookId of uniqueBookIds) {
            const saveCount = await BookSave.countDocuments({ userId, bookId });
            
            // If book is no longer saved in any list, decrement totalSaves
            if (saveCount === 0) {
                await Book.findByIdAndUpdate(bookId, {
                    $inc: { totalSaves: -1 }
                });
            }
        }

        // Delete the list
        await SaveList.findByIdAndDelete(listId);

        return res.status(200).json({
            success: true,
            message: "List deleted successfully"
        });

    } catch (error) {
        console.error('Delete list error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Initialize default lists for a new user
export const initializeDefaultLists = async (userId) => {
    try {
        const existingLists = await SaveList.findOne({ userId });
        if (existingLists) return;

        await SaveList.create({
            userId,
            name: 'Favorites',
            color: '#c8963e',
            icon: '⭐',
            isDefault: true,
            description: 'Your favorite books'
        });

        console.log(`Default list created for user: ${userId}`);
    } catch (error) {
        console.error('Error initializing default lists:', error);
    }
};

// ========== BOOK SAVE MANAGEMENT ==========

// Save a book to a list
export const saveBookToList = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bookId } = req.params;
        const { listId, notes } = req.body;

        // Validate book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // Validate list exists and belongs to user
        const list = await SaveList.findOne({ _id: listId, userId });
        if (!list) {
            return res.status(404).json({
                success: false,
                message: "List not found"
            });
        }

        // Check if book is already saved in this list
        const existingSave = await BookSave.findOne({ userId, bookId, listId });
        if (existingSave) {
            return res.status(400).json({
                success: false,
                message: "Book already saved in this list"
            });
        }

        // Check if book is already saved by this user in ANY list
        const existingUserSave = await BookSave.findOne({ userId, bookId });
        const isNewSaveForUser = !existingUserSave;

        // Save the book
        const save = await BookSave.create({
            userId,
            bookId,
            listId,
            notes: notes || ''
        });

        // Update book count in list
        list.bookCount = await BookSave.countDocuments({ userId, listId });
        await list.save();

        // If this is the first time user is saving this book, increment totalSaves
        if (isNewSaveForUser) {
            await Book.findByIdAndUpdate(bookId, {
                $inc: { totalSaves: 1 }
            });
        }

        return res.status(201).json({
            success: true,
            message: "Book saved to list successfully",
            save,
            isNewSave: isNewSaveForUser
        });

    } catch (error) {
        console.error('Save book error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Remove a book from a list
export const removeBookFromList = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bookId } = req.params;
        const { listId } = req.body;

        // Find and delete the save
        const save = await BookSave.findOneAndDelete({ userId, bookId, listId });
        if (!save) {
            return res.status(404).json({
                success: false,
                message: "Book not found in this list"
            });
        }

        // Update book count in list
        const list = await SaveList.findById(listId);
        if (list) {
            list.bookCount = await BookSave.countDocuments({ userId, listId });
            await list.save();
        }

        // Check if user still has this book saved in any other list
        const remainingSaves = await BookSave.countDocuments({ userId, bookId });
        
        // If book is no longer saved in any list by this user, decrement totalSaves
        if (remainingSaves === 0) {
            await Book.findByIdAndUpdate(bookId, {
                $inc: { totalSaves: -1 }
            });
        }

        return res.status(200).json({
            success: true,
            message: "Book removed from list successfully",
            remainingSaves
        });

    } catch (error) {
        console.error('Remove book error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Move a book from one list to another
export const moveBookToList = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bookId } = req.params;
        const { sourceListId, targetListId } = req.body;

        // Validate target list exists
        const targetList = await SaveList.findOne({ _id: targetListId, userId });
        if (!targetList) {
            return res.status(404).json({
                success: false,
                message: "Target list not found"
            });
        }

        // Remove from source list
        await BookSave.findOneAndDelete({ userId, bookId, listId: sourceListId });

        // Add to target list
        const save = await BookSave.create({
            userId,
            bookId,
            listId: targetListId,
            notes: ''
        });

        // Update book counts for both lists
        await Promise.all([
            SaveList.findByIdAndUpdate(sourceListId, {
                $inc: { bookCount: -1 }
            }),
            SaveList.findByIdAndUpdate(targetListId, {
                $inc: { bookCount: 1 }
            })
        ]);

        return res.status(200).json({
            success: true,
            message: "Book moved successfully",
            save
        });

    } catch (error) {
        console.error('Move book error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Get all books in a list
export const getBooksInList = async (req, res) => {
    try {
        const userId = req.user._id;
        const { listId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Validate list exists
        const list = await SaveList.findOne({ _id: listId, userId });
        if (!list) {
            return res.status(404).json({
                success: false,
                message: "List not found"
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get saved books with pagination
        const saves = await BookSave.find({ userId, listId })
            .populate({
                path: 'bookId',
                select: 'title thumbnail description authorName type category subject totalSaves'
            })
            .sort({ savedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await BookSave.countDocuments({ userId, listId });

        const books = saves.map(save => ({
            saveId: save._id,
            savedAt: save.savedAt,
            notes: save.notes,
            book: save.bookId
        }));

        return res.status(200).json({
            success: true,
            list,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
            books
        });

    } catch (error) {
        console.error('Get books in list error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Check if a book is saved by a user
export const checkBookSaved = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bookId } = req.params;

        const saves = await BookSave.find({ userId, bookId })
            .populate('listId', 'name color icon');

        const isSaved = saves.length > 0;

        return res.status(200).json({
            success: true,
            isSaved,
            saves: saves.map(save => ({
                listId: save.listId._id,
                listName: save.listId.name,
                listColor: save.listId.color,
                listIcon: save.listId.icon,
                saveId: save._id,
                notes: save.notes,
                savedAt: save.savedAt
            }))
        });

    } catch (error) {
        console.error('Check book saved error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Get all saves for a user (all lists)
export const getAllUserSaves = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 20 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const saves = await BookSave.find({ userId })
            .populate('bookId', 'title thumbnail description authorName type category subject totalSaves')
            .populate('listId', 'name color icon')
            .sort({ savedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await BookSave.countDocuments({ userId });

        return res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
            saves
        });

    } catch (error) {
        console.error('Get all saves error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};