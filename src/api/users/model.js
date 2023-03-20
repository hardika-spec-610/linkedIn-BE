import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
    {
        name: { type: String, required: true },
        surname: { type: String, required: true },
        email: { type: String, required: true },
        bio: { type: String, required: true },
        title: { type: String, required: true },
        area: { type: String, required: true },
        image: { type: String, default: "default-image-url" }, // replace "default-image-url" with the actual default image URL
    },
    {
        timestamps: true,
    }
);

export default model("User", userSchema);
