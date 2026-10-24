import mongoose from "mongoose";
import { DB_URI } from "../config.js";
import { UserModel } from "./model/user.model.js";
import { connectRedis } from "./redis.connection.js";

export const bootstrap = async (app, port) => {
    try {
        await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 30000 })
        await UserModel.syncIndexes();
        console.log(`DB Connected Successfully ..✔👍`);
        await connectRedis()

        app.listen(port, () => console.log(`Running on port ${port}`))
    } catch (error) {
        console.log(error);
        console.log(`Failed To connect To DB ✖✖`);
    }
}