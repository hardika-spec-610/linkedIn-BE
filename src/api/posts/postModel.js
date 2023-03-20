import mongoose from "mongoose";

const { Schema, model } = mongoose;

const postSchema = new Schema(
  {
    text: { type: String, required: true },
    image: {
      default:
        "https://cdn.pixabay.com/photo/2018/03/22/02/37/email-3249062__340.png",
      type: String,
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

export default model("PostsData", postSchema);
// this model is now automagically linked to the "PostsData" collection, if the collection does not exist it will be created
//
