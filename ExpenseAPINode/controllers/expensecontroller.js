"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// getting all expenses
const getExpenses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // get some posts
    let result;
    let expenses = result.data;
    return res.status(200).json({
        message: expenses
    });
});
// adding a post
const addExpense = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // get the data from req.body
    let Date = req.body.date;
    let Amount = req.body.amount;
    let Category = req.body.category;
    // add the post
    // return response
    return res.status(200).json({
        message: "Ok"
    });
});
exports.default = { getExpenses, addExpense };
//# sourceMappingURL=expensecontroller.js.map