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
        receivedRequests: {
            pending: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        },
        sendRequests: {
            pending: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        },
        connected: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    },
    {
        timestamps: true,
    }
);

export default model("User", userSchema);