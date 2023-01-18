"use strict";
//import http = require('http');
//const port = process.env.port || 1337
//http.createServer(function (req, res) {
//    res.writeHead(200, { 'Content-Type': 'text/plain' });
//    res.end('Hello World\n');
//}).listen(port);
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const expenseNotificationRoutes_1 = __importDefault(require("./routes/expenseNotificationRoutes"));
const router = (0, express_1.default)();
/** Logging */
router.use((0, morgan_1.default)('dev'));
/** Parse the request */
router.use(express_1.default.urlencoded({ extended: false }));
/** Takes care of JSON data */
router.use(express_1.default.json());
/** RULES OF OUR API */
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST');
        return res.status(200).json({});
    }
    next();
});
/** Routes */
router.use('/', expenseNotificationRoutes_1.default);
/** Error handling */
router.use((req, res, next) => {
    const error = new Error('not found');
    return res.status(404).json({
        message: error.message
    });
});
/** Server */
const httpServer = http_1.default.createServer(router);
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 6060;
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));
//# sourceMappingURL=server.js.map