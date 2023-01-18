import express  from 'express';
import controller from '../controllers/expenseNotificationController';
const router = express.Router();

router.post('/sentNotification', controller.sentExpenseNotification);

export = router;