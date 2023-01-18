import { Request, Response, NextFunction } from 'express'; 
const util = require("util"); 
const mysql = require('mysql');
const sendgrid = require('@sendgrid/mail');

interface Notification {    
    NotificationDate: Date;
    ExpenseId: Number;
}

//use email service
function sendEmail(date: Date, amount: Number, category: String) {
    let result: boolean = false;
    const SENDGRID_API_KEY = "XXXXXX"

    sendgrid.setApiKey(SENDGRID_API_KEY);
    const content = `<strong> Fecha : ${date}- Monto: $ ${amount.toString()} - Concepto: ${category} </strong>`;  

    const msg = {
        to: '[correo personal]',
        // Change to your recipient
        from: 'mtcacademyms@outlook.com',
        // Change to your verified sender
        subject: 'Gasto Registrado ',
        text: `Acabas de realizar un gasto por $ ${amount.toString()} `,
        html: content,
    }
    sendgrid
        .send(msg)
        .then((resp) => {
            console.log('Email sent\n', resp)
        })
        .catch((error) => {
            console.error(error)
        })
    result = true;
    return result;
}

//register in database 
async function registerExpensesNotification (notification: Notification){

    let result:boolean = false;
    
    var connection = mysql.createConnection({
        host: "mtcacademymysql.mysql.database.azure.com",
        port:"3306",
        user: "adminadmin",
        password: ".Microsoft01.",
        database: "expensenotificationdb"
    });

    connection.query = util.promisify(connection.query).bind(connection);

    connection.connect(function (err) {
        if (err) {
            console.log("error connecting: " + err.stack);
            return;
        };
        console.log("connected as... " + connection.threadId);
    });
    
    const postQueryString = `INSERT INTO expensenotificationdb.notification  (NotificationDate, ExpenseId) VALUES (' ${formatDate(notification.NotificationDate)}',${notification.ExpenseId.toString() } )`;  

    const resultquery = await connection.query(postQueryString).catch(err => { throw err });
    
    result = true;
    return result;
};

// sent a expense notification
const sentExpenseNotification = async (req: Request, res: Response, next: NextFunction) => {
    // get the data from req.body
    let date: Date = req.body.date;
    let amount: Number = req.body.amount;
    let category: string = req.body.category;
    let id: Number = req.body.id
    // sending the email notification

    let resultEmail = sendEmail(date, amount, category);

    
    let currentDate= new Date(Date.now());;

    let notification: Notification = {
        NotificationDate: currentDate,
        ExpenseId: id
    };

    let resultRegister = await registerExpensesNotification(notification);


    // return response
    return res.status(200).json({
        message: "Ok"
    });
};

function formatDate(date: Date) {
    return (
        [
            date.getFullYear(),
            padTo2Digits(date.getMonth() + 1),
            padTo2Digits(date.getDate()),
        ].join('-') +
        ' ' +
        [
            padTo2Digits(date.getHours()),
            padTo2Digits(date.getMinutes()),
            padTo2Digits(date.getSeconds()),
        ].join(':')
    );
}

function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
}

export default { sentExpenseNotification };
