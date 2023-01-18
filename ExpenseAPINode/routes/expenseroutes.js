"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const expensecontroller_1 = __importDefault(require("../controllers/expensecontroller"));
const router = express_1.default.Router();
router.get('/expenses', expensecontroller_1.default.getExpenses);
router.post('/expenses', expensecontroller_1.default.addExpense);
module.exports = router;
//# sourceMappingURL=expenseroutes.js.map