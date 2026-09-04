
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Subscription from "../pages/auth/Subscription";
import CoursesCollection from "../pages/course/CoursesCollection";
import TestsCollection from "../pages/Tests/TestsCollection";
import BooksCollections from "../pages/books/BooksCollections";
import Signup from "../pages/auth/Signup";
import Signin from "../pages/auth/Signin";
import About from "../pages/About";
import SearchPage from "../pages/SearchPage";
import BookPreview from "../pages/books/BookPreview";
import Profile from "../pages/auth/Profile";
import AdminPannel from "../pages/admin/AdminPannel";
import AdminDashbord from "../pages/admin/AdminDashbord";
import AllUsers from "../pages/admin/AllUsers";
import ProtectedRoute from "../components/extra/ProtectedRoute";
import AdminSubscriptions from "../pages/admin/AdminSubscriptions";
import Checkout from "../pages/auth/Checkout";
import Subscribers from "../pages/admin/Subscribers";
import MyOrders from "../pages/auth/MyOrders";
import Books from "../pages/admin/Books";
import EBooks from "../pages/admin/EBooks";
import PDFTools from "../pages/admin/PDFTools";
import BookAbout from "../pages/admin/BookAbout";
import BookReading from "../pages/books/BookReading";
import Save from "../pages/books/Save";
import BooksAnalytics from "../pages/admin/BooksAnalytics";
import Courses from "../pages/admin/Courses";
import CourseAbout from "../pages/admin/CourseAbout";
import CoursePreview from "../pages/course/CoursePreview";
import Lessons from "../pages/course/Lessons";
import Revenue from "../pages/admin/Revenue";
import UserProfile from "../pages/admin/UserProfile";
import MyBill from "../pages/auth/MyBill";
import AdminProfile from "../components/admin/AdminProfile";
import Reports from "../pages/support/Reports";
import AdminReports from "../pages/admin/AdminReports";
import NotFound from "../pages/NotFound";



const router = createBrowserRouter([
    {path: "/", element: <App />, 
        children: [
            {index: true, element: <Home/>},
            {path: "/subscription", element: <Subscription/>},
            {path: "/courses", element: <CoursesCollection/>},
            {path: "/tests", element: <TestsCollection/>},
            {path: "/books", element: <BooksCollections/>},
            {path: "/auth/signin", element: <Signin/>},
            {path: "/auth/signup", element: <Signup/>},
            {path: "/about", element: <About/>},
            {path: "/search", element: <SearchPage/>},
            {path: "/book-preview/:id", element: <BookPreview/>},
            {path: "/profile", element: <Profile/>},
            {path: "/checkout/:id", element: <Checkout/>},
            {path: "/orders", element: <MyOrders/>},
            {path: "/book-reading/:bookTitle/:id", element: <BookReading/>},
            {path: "/save", element: <Save/>},
            {path: "/course-preview/:courseTitle/:id", element:<CoursePreview/>},
            {path: "/course/:courseTitle/:courseId/lesson/:lessonIndex", element:<Lessons/>},
            {path: "/invoices", element:<MyBill/>},
            {path: "/reports", element:<Reports/>},
        ]
    },

    {path: 'admin', element:
    <ProtectedRoute allowedRoles={['admin']}>
        <AdminPannel/>
    </ProtectedRoute>,
        children:[
            {index: true, element:<AdminDashbord/>},
            {path: "/admin/dashboard", element:<AdminDashbord/>},
            {path: "/admin/users", element:<AllUsers/>},
            {path: "/admin/user-profile/:userUserName/:id", element:<UserProfile/>},
            {path: "/admin/subscriptions", element:<AdminSubscriptions/>},
            {path: "/admin/subscribers", element:<Subscribers/>},
            {path: "/admin/books", element:<Books/>},
            {path: "/admin/ebooks", element:<EBooks/>},
            {path: "/admin/pdf", element:<PDFTools/>},
            {path: "/admin/book/preview/:id", element:<BookAbout/>},
            {path: "/admin/book-analytics/", element:<BooksAnalytics/>},
            {path: "/admin/courses", element:<Courses/>},
            {path: "/admin/course/about/:id", element:<CourseAbout/>},
            {path: "/admin/revenue", element:<Revenue/>},
            {path: "/admin/profile", element:<AdminProfile/>},
            {path: "/admin/reports", element:<AdminReports/>},
        ],
    },

            {path: "*", element:<NotFound/>},
])

export default router