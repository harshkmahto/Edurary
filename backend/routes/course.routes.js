import { Router } from "express";
import { createCourse, deleteCourse, getAllCourses, getCourseById, getCourseLessons, getCourseStats, getUserCourseById, getUserCourseProgress, getUserCourses, toggleCourseStatus, trackLessonWatchTime, updateCourse } from "../controller/course/course.controller.js";
import { admin, auth } from "../middleware/auth.middleware.js";
import { uploadCourse } from "../middleware/upload.middleware.js";


const courseRouter = Router();

// ========== ADMIN ROUTES ==========

// Create course
courseRouter.post("/create", auth, admin, uploadCourse.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'instructorProfiles', maxCount: 10 }
    ]),createCourse);

courseRouter.get("/", auth, admin, getAllCourses);
courseRouter.get("/:id", auth, admin, getCourseById);
courseRouter.get("/stats", auth, admin, getCourseStats);

courseRouter.put("/update/:id", auth, admin, uploadCourse.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'instructorProfiles', maxCount: 10 }
    ]),updateCourse);

courseRouter.delete("/delete/:id", auth, admin, deleteCourse);
courseRouter.patch("/toggle-status/:id", auth, admin, toggleCourseStatus);


courseRouter.get("/user/courses", getUserCourses);
courseRouter.get("/user/courses/:id", getUserCourseById);
courseRouter.get("/user/courses/:id/lessons", auth, getCourseLessons);

courseRouter.post("/user/courses/:courseId/watch", auth, trackLessonWatchTime);

courseRouter.get("/user/courses/:courseId/progress", auth, getUserCourseProgress);




export default courseRouter;