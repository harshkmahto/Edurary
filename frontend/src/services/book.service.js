import api from "./api";

const bookService = {
    createBook: async (bookData) => {
        try {
            const response = await api.post('/book/create', bookData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to create book'
            };
        }
    },

    getAllBooks: async (params = {}) => {
        try {
            const response = await api.get('/book', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch books'
            };
        }
    },

    getBookById: async (id) => {
        try {
            const response = await api.get(`/book/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch book'
            };
        }
    },

    updateBook: async (id, bookData) => {
        try {
            const response = await api.put(`/book/update/${id}`, bookData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to update book'
            };
        }
    },

    toggleBookStatus: async (id, status) => {
        try {
            const response = await api.patch(`/book/toggle-status/${id}`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to update book status'
            };
        }
    },

    deleteBook: async (id) => {
        try {
            const response = await api.delete(`/book/delete/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to delete book'
            };
        }
    },

    getBooksStats: async () => {
        try {
            const response = await api.get('/book/stats');
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch books stats'
            };
        }
    },

    getUserBooks: async (params = {}) => {
        try {
            const response = await api.get('/book/user/books', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch user books'
            };
        }
    },    
    
    getUserBookById: async (id) => {
        try {
            const response = await api.get(`/book/books/user/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch user book'
            };
        }
    },    


// ========== SAVE LIST MANAGEMENT SERVICES ==========

    // Create a new list
    createList: async (listData) => {
        try {
            const response = await api.post('/book/save/list/create', listData);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to create list'
            };
        }
    },

    // Get all lists for the current user
    getUserLists: async () => {
        try {
            const response = await api.get('/book/save/lists');
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch lists'
            };
        }
    },

    // Update a list
    updateList: async (listId, listData) => {
        try {
            const response = await api.put(`/book/save/list/${listId}`, listData);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to update list'
            };
        }
    },

    // Delete a list
    deleteList: async (listId) => {
        try {
            const response = await api.delete(`/book/save/list/${listId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to delete list'
            };
        }
    },

    // ========== BOOK SAVE MANAGEMENT SERVICES ==========

    // Save a book to a list
    saveBookToList: async (bookId, data) => {
        try {
            const response = await api.post(`/book/save/book/${bookId}/save`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to save book'
            };
        }
    },

    // Remove a book from a list
    removeBookFromList: async (bookId, data) => {
        try {
            const response = await api.delete(`/book/save/book/${bookId}/remove`, { data });
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to remove book from list'
            };
        }
    },

    // Move a book from one list to another
    moveBookToList: async (bookId, data) => {
        try {
            const response = await api.put(`/book/save/book/${bookId}/move`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to move book'
            };
        }
    },

    // Get all books in a specific list
    getBooksInList: async (listId, params = {}) => {
        try {
            const response = await api.get(`/book/save/list/${listId}/books`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch books in list'
            };
        }
    },

    // Check if a book is saved in any list
    checkBookSaved: async (bookId) => {
        try {
            const response = await api.get(`/book/save/book/${bookId}/check`);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to check book status'
            };
        }
    },

    // Get all saves for the current user (all lists)
    getAllUserSaves: async (params = {}) => {
        try {
            const response = await api.get('/book/save/all', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch all saves'
            };
        }
    },

// ========== BOOK RATING SERVICES ==========

// Add or update a rating
    addOrUpdateRating: async (bookId, data) => {
        try {
            const response = await api.post(`/book/rating/book/${bookId}/rate`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to add or update rating'
            };
        }
    },

    // Get user's rating for a specific book
    getUserRating: async (bookId) => {
        try {
            const response = await api.get(`/book/rating/book/${bookId}/my-rating`);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to get user rating'
            };
        }
    },

    // Get all ratings by the current user
    getUserAllRatings: async (params = {}) => {
        try {
            const response = await api.get('/book/rating/my-ratings', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to get user ratings'
            };
        }
    },

    // Get average rating for a book (public)
    getBookAverageRating: async (bookId) => {
        try {
            const response = await api.get(`/book/rating/book/${bookId}/average`);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to get book average rating'
            };
        }
    },

     // Get rating statistics for a book (admin only)
    getBookRatingStats: async (bookId) => {
        try {
            const response = await api.get(`/book/rating/book/${bookId}/stats`);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to get rating stats'
            };
        }
    },

};

export default bookService;

export const {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
    toggleBookStatus,
    getBooksStats,
    getUserBooks,
    getUserBookById,
    createList,
    getUserLists,
    updateList,
    deleteList,
    saveBookToList,
    removeBookFromList,
    moveBookToList,
    getBooksInList,
    checkBookSaved,
    getAllUserSaves,
    addOrUpdateRating,
    getUserRating,
    getUserAllRatings,
    getBookAverageRating,
    getBookRatingStats,
    
} = bookService;