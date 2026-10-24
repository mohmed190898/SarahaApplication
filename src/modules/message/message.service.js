import { NotFoundException } from "../../common/exception/error.exception.js"
import { create, deleteOne, findById, findOne, paginate } from "../../common/repository/message.repository.js"
import { UserModel } from "../../DB/model/user.model.js"
import { MessageModel } from "../../DB/model/message.model.js"
import { findById as findUserById } from "../../common/repository/user.repository.js"
export const createMessage = async ({ content, receiverId } = {}, files = [], user = undefined) => {
    const checkReceiverExist = await findUserById({
        id: receiverId
    })
    if (!checkReceiverExist) {
        throw NotFoundException("Invalid receiver Id")
    }
    const message = await create({

        data: {
            receiverId,
            content,
            attachments: files.map(ele => ele.path),
            ...(user ? { senderId: user._id } : {})
        }
    })
    return message;
}

export const getAllMessages = async ({ type, search = "", page, limit } = {}, user) => {
    let filter = {}
    if (type == "0") {
        filter = {
            receiverId: user._id,
            content: { $regex: search, $options: "i" }
        }
    }
    else if (type == "1") {
        filter = { senderId: user._id, content: { $regex: search, $options: "i" } }
    }
    else {
        filter = {
            $or: [
                { senderId: user._id },
                { receiverId: user._id }
            ],
            content: { $regex: search, $options: "i" }
        }
    }
    // const docCounts = 
    const data = await paginate({

        filter,
        options: {
            sort: { createdAt: -1 }
        },
        page,
        limit
    })
    return data;
}
export const deleteMessage = async ({ messageId }, user) => {
    const data = await deleteOne({

        filter: {
            receiverId: user._id,
            _id: messageId
        }
    })
    if (!data.deletedCount) {
        throw NotFoundException("message not found")
    }
    return data;
}
export const getMessageById = async ({ messageId }, user) => {
    const data = await findOne({

        filter: {
            receiverId: user._id,
            _id: messageId
        }
    })
    if (!data) {
        throw NotFoundException("message not found")
    }
    return data;
}