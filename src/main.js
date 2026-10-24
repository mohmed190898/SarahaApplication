import express from 'express'
import { authenticationController, messageController, userContoller } from './modules/index.js'
import { globalErrorHandeling } from './middleware/index.js';
import { ORIGINS, PORT } from './config.js';
import { bootstrap } from './DB/connection.db.js';
import cors from "cors";
import helmet from "helmet";
import morgan from 'morgan';
import axios from 'axios';
import { generateLimiter } from './common/utils/limiter.js';
const app = express()
await bootstrap(app, PORT)
var corsOptions = {
    origin: function (origin, callback) {
        if (!ORIGINS.includes(origin)) {
            callback(new Error("Unathourized origin", { cause: { status: 401 } }), origin)
        } else {
            callback(null, ORIGINS)
        }
    }
}

app.set("trust proxy", true)
const limiter = generateLimiter({})
// app.use(cors(corsOptions), express.json())
app.use(cors(),helmet(),morgan("dev"), limiter, express.json())
app.use("/assets", express.static("./assets"))
app.all("/", (req, res) => res.status(200).send({ message: "Welcome to api ✔" }));

app.use('/auth', authenticationController)
app.use('/user', userContoller)
app.use('/message', messageController)

app.all("{/*dummy}", (req, res) => res.status(404).send({ message: "Invalid Application routing" }));


app.use(globalErrorHandeling)
// await sendEmail({
//     subject:"Test Saraha Project sending emails",
//     to:"itkavvzecgcrytlfnj@gonrr.net",
//     html:`<h1>Hello Dear</h1>`,
//     attachements:[
//         {
//             filename:"",
//             contentType:"image/jpeg",
//             path:`${resolve("./")}`
//         },
//         {
//             filename:"text.text",
//             contentType:"text/plain",
//             content:"Content of attachement"
//         }
//     ]
// })
