import { MessageModel } from '../../DB/model/message.model.js'
import * as base from './base.repository.js'


export const findOne = async ({
    filter,
    options,
    select,
} = {}) => {
    return await base.findOne({ filter, options, select, model: MessageModel })
}

export const findById = async ({
    id,
    options,
    select,
}) => {
    return await base.findById({ id, options, select, model: MessageModel })
}

export const find = async ({
    filter,
    options,
    select,
} = {}) => {
    return await base.find({ filter, select, options, model: MessageModel })

}

export const paginate = async ({
    filter,
    options,
    select,
    page = 1,
    limit = 5
} = {}) => {
    return await base.paginate({ filter, options, select, page, limit, model: MessageModel })
}

export const countDocument = async ({
    filter,
} = {}) => {
    return await base.countDocument({ filter, model: MessageModel })
}

// export const paginate = async ({
//     filter = {},
//     options = {},
//     select,
//     page = "all",
//     size = 5,
//     model

// } = {}) => {
//     let docsCount = undefined;
//     let pages = undefined;
//     if (page !== "all") {
//         page = Math.floor(page < 1 ? 1 : page);
//         options.limit = Math.floor(size < 1 || !size ? 5 : size);
//         options.skip = (page - 1) * options.limit;

//         docsCount = await model.countDocuments(filter);
//         pages = Math.ceil(docsCount / options.limit);
//     }
//     const result = await find({ model, filter, select, options });
//     return {
//         docsCount,
//         limit: options.limit,
//         pages,
//         currentPage: page !== "all" ? page : undefined,
//         result,
//     };
// }

export const create = async ({
    data = [{}],
    options = { validationBeforeSave: true },

}) => {
    return await base.create({ data, options, model: MessageModel })
}

export const createOne = async ({
    data = { validateBeforeSave: true },
    options,
}) => {
    return await base.createOne({ data, options, model: MessageModel })
}


export const insertMany = async ({
    data,

}) => {
    return await base.insertMany({ data, model: MessageModel })
}

export const updateOne = async ({
    filter,
    update,
    options,

} = {}) => {
    return await base.insertMany({ filter, update, options, model: MessageModel })

}
export const findOneAndUpdate = async ({
    filter,
    update,
    options,

} = {}) => {
    return await base.findOneAndUpdate({ filter, update, options, model: MessageModel })
}
export const findByIdAndUpdate = async ({
    id,
    update,
    options = { new: true },

}) => {
    return await base.findByIdAndUpdate({ id, update, options, model: MessageModel })
}

export const deleteOne = async ({
    filter,

}) => {
    return await base.countDocument({ filter, model: MessageModel })
}

export const deleteMany = async ({
    filter,

}) => {
    return await base.deleteMany({ filter, model: MessageModel });
}

export const findOneAndDelete = async ({
    filter,

} = {}) => {
    return await base.deleteMany({ filter, model: MessageModel });

}
