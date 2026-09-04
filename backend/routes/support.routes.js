import express from 'express';
import {
    createReport,
    getAllReports,
    getTotalReports,
    updateReportStatus
} from '../controller/support/reports.controller.js';
import { admin, auth } from '../middleware/auth.middleware.js';

const supportRouter = express.Router();

supportRouter.post('/create', auth, createReport);
supportRouter.get('/admin/all', auth, admin, getAllReports);
supportRouter.patch('/admin/:reportId/status', auth, admin, updateReportStatus);
supportRouter.get('/admin/total', auth, admin, getTotalReports)

export default supportRouter;