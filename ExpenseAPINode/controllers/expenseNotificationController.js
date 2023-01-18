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
const util = require("util");
const mysql = require('mysql');
const sendgrid = require('@sendgrid/mail');
//use email service
function sendEmail(date, amount, category) {
    let result = false;
    const SENDGRID_API_KEY = "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";
    sendgrid.setApiKey(SENDGRID_API_KEY);
    const content = `<strong> Fecha : ${date}- Monto: $ ${amount.toString()} - Concepto: ${category} </strong>`;
    const msg = {
        to: 'e_ramirez_martinez@hotmail.com',
        // Change to your recipient
        from: 'mtcacademyms@outlook.com',
        // Change to your verified sender
        subject: 'Gasto Registrado ',
        text: `Acabas de realizar un gasto por $ ${amount.toString()} `,
        html: content,
    };
    sendgrid
        .send(msg)
        .then((resp) => {
        console.log('Email sent\n', resp);
    })
        .catch((error) => {
        console.error(error);
    });
    result = true;
    return result;
}
//register in database 
function registerExpensesNotification(notification) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = false;
        var connection = mysql.createConnection({
            host: "mtcacademymysql.mysql.database.azure.com",
            port: "3306",
            user: "adminadmin",
            password: ".Microsoft01.",
            database: "expensenotificationdb"
        });
        connection.query = util.promisify(connection.query).bind(connection);
        connection.connect(function (err) {
            if (err) {
                console.log("error connecting: " + err.stack);
                return;
            }
            ;
            console.log("connected as... " + connection.threadId);
        });
        const postQueryString = `INSERT INTO expensenotificationdb.notification  (NotificationDate, ExpenseId) VALUES (' ${formatDate(notification.NotificationDate)}',${notification.ExpenseId.toString()} )`;
        const resultquery = yield connection.query(postQueryString).catch(err => { throw err; });
        result = true;
        return result;
    });
}
;
// sent a expense notification
const sentExpenseNotification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // get the data from req.body
    let date = req.body.date;
    let amount = req.body.amount;
    let category = req.body.category;
    let id = req.body.id;
    // sending the email notification
    let resultEmail = sendEmail(date, amount, category);
    let currentDate = new Date(Date.now());
    ;
    let notification = {
        NotificationDate: currentDate,
        ExpenseId: id
    };
    let resultRegister = yield registerExpensesNotification(notification);
    // return response
    return res.status(200).json({
        message: "Ok"
    });
});
function formatDate(date) {
    return ([
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
    ].join('-') +
        ' ' +
        [
            padTo2Digits(date.getHours()),
            padTo2Digits(date.getMinutes()),
            padTo2Digits(date.getSeconds()),
        ].join(':'));
}
function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}
exports.default = { sentExpenseNotification };
//# sourceMappingURL=expenseNotificationController.js.map