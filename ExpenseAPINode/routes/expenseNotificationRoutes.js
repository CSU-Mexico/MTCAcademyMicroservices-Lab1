"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const expenseNotificationController_1 = __importDefault(require("../controllers/expenseNotificationController"));
const router = express_1.default.Router();
router.post('/sentNotification', expenseNotificationController_1.default.sentExpenseNotification);
module.exports = router;
//# sourceMappingURL=expenseNotificationRoutes.js.map