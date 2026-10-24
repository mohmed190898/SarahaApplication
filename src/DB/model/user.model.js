import mongoose from "mongoose";
import { Gender_Enum, ProviderEnum, RoleEnum } from "../../common/enum/user.gender.js";


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minLength: 2,
        maxLength: 25,
        required: true
    },
    lastName: {
        type: String,
        minLength: 2,
        maxLength: 25,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function () {
            return this.provider == ProviderEnum.SYSTEM
        }
    },
    phone: String,
    DOB: Date,
    confirmationMail: Date,
    image: String,
    coverImage: [String],
    gender: {
        type: Number,
        default: Gender_Enum.MALE,
        enum: Object.values(Gender_Enum)
    },
    role: {
        type: Number,
        default: RoleEnum.USER,
        enum: Object.values(RoleEnum)
    },
    provider: {
        type: Number,
        enum: Object.values(ProviderEnum),
        default: ProviderEnum.SYSTEM,
    },
    changeCredentialsTime: Date

}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
    strictQuery: true,
    autoIndex: true,
})

userSchema.virtual("username").set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName })
}).get(function () {
    return `${this.firstName} ${this.lastName}`
})

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema)