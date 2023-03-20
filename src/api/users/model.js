import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
    {
        name: { type: String, required: true },
        surname: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: String },
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            zip: { type: String },
            country: { type: String },
        },
        website: { type: String },
        bio: { type: String, required: true },
        title: { type: String, required: true },
        area: { type: String, required: true },
        image: { type: String },
        skills: [
            {
                name: { type: String },
                level: { type: String },
            },
        ],
        education: [
            {
                institution: { type: String },
                degree: { type: String },
                fieldOfStudy: { type: String },
                startDate: { type: Date },
                endDate: { type: Date },
            },
        ],
        experience: [
            {
                type: Schema.Types.ObjectId,
                ref: "Experience",
                required: true,
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default model("User", userSchema);

