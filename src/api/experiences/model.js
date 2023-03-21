import mongoose from "mongoose";

const { Schema, model } = mongoose

const experienceSchema = new Schema({
    role: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        default: null
    },
    area: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/993/993928.png",
    },
    user: { type: mongoose.Types.ObjectId, ref: "User" }
}, { timestamps: true })

export default model("Experience", experienceSchema)
