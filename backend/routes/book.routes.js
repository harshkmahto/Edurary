import { Router } from "express";
import {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
    toggleBookStatus,
    getBooksStats,
    getUserBooks,
    getUserBookById,
} from "../controller/books/books.contoller.js";
import { uploadBook } from "../middleware/upload.middleware.js";
import { admin, auth } from "../middleware/auth.middleware.js";
import { createList, deleteList, getAllUserSaves, getBooksInList,
     getUserLists, moveBookToList, removeBookFromList, saveBookToList,
     updateList, checkBookSaved } from "../controller/books/save.controller.js";
import { addOrUpdateRating, getBookAverageRating, getBookRatingStats, getUserAllRatings, getUserRating } from "../controller/books/bookRating.controller.js";


const bookRouter = Router();


bookRouter.post("/create", 
    auth, 
    admin, 
    uploadBook.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'content', maxCount: 1 }
    ]),
    createBook
);

bookRouter.get("/", auth, admin, getAllBooks);
bookRouter.get("/:id", auth, admin, getBookById);

bookRouter.put("/update/:id",  auth, admin,  uploadBook.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'content', maxCount: 1 }
    ]),updateBook);

bookRouter.patch("/toggle-status/:id", auth, admin, toggleBookStatus);
bookRouter.delete("/delete/:id",auth, admin, deleteBook);

bookRouter.get("/stats", auth, admin, getBooksStats);


// User routes
bookRouter.get("/user/books",  getUserBooks);
bookRouter.get('/books/user/:id', getUserBookById);



// ========== SAVE LIST AND BOOK SAVE ROUTES ==========

// List Management
bookRouter.post("/save/list/create", auth, createList);
bookRouter.get("/save/lists", auth, getUserLists);
bookRouter.put("/save/list/:listId", auth, updateList);
bookRouter.delete("/save/list/:listId", auth, deleteList);

// Book Save Management
bookRouter.post("/save/book/:bookId/save", auth, saveBookToList);
bookRouter.delete("/save/book/:bookId/remove", auth, removeBookFromList);
bookRouter.put("/save/book/:bookId/move", auth, moveBookToList);
bookRouter.get("/save/list/:listId/books", auth, getBooksInList);
bookRouter.get("/save/book/:bookId/check", auth, checkBookSaved);
bookRouter.get("/save/all", auth, getAllUserSaves);


// ========== BOOK RATING ROUTES ==========
// Protected routes (require authentication)
bookRouter.post("/rating/book/:bookId/rate", auth, addOrUpdateRating);
bookRouter.get("/rating/book/:bookId/my-rating", auth, getUserRating);
bookRouter.get("/rating/my-ratings", auth, getUserAllRatings);

// Public routes
bookRouter.get("/rating/book/:bookId/average", auth, admin, getBookAverageRating);

// Admin route
bookRouter.get("/rating/book/:bookId/stats", auth, admin, getBookRatingStats);

export default bookRouter;