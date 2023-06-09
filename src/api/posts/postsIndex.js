import Express from "express";
import createHttpError from "http-errors";
import PostsModel from "./postModel.js";
import q2m from "query-to-mongo";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import UsersModal from "../users/model.js";

const postsRouter = Express.Router();

postsRouter.post("/", async (req, res, next) => {
  try {
    const newPost = new PostsModel(req.body);
    // here it happens validation (thanks to Mongoose) of req.body, if it is not ok Mongoose will throw an error
    // if it is ok the user is not saved yet
    const { _id } = await newPost.save();

    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

postsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    //  price: '>10' should be converted somehow into price: {$gt: 10}
    const posts = await PostsModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort)
      .populate([
        {
          path: "user",
          select: "name surname image title",
        },
        {
          path: "likes",
          select: "name surname image title",
        },
      ]);
    const total = await PostsModel.countDocuments(mongoQuery.criteria);
    // no matter the order of usage of these methods, Mongo will ALWAYS apply SORT then SKIP then LIMIT
    res.send({
      links: mongoQuery.links(process.env.LOCAL_URL + "/posts", total),
      total,
      numberOfPages: Math.ceil(total / mongoQuery.options.limit),
      posts,
    });
  } catch (error) {
    next(error);
  }
});

postsRouter.get("/:postId", async (req, res, next) => {
  try {
    const posts = await PostsModel.findById(req.params.postId).populate([
      {
        path: "user",
        select: "name surname image title",
      },
      {
        path: "likes",
        select: "name surname image title",
      },
    ]);
    if (posts) {
      res.send(posts);
    } else {
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.put("/:postId", async (req, res, next) => {
  try {
    const updatedPost = await PostsModel.findByIdAndUpdate(
      req.params.postId, // WHO
      req.body, // HOW
      { new: true, runValidators: true } // OPTIONS. By default findByIdAndUpdate returns the record pre-modification. If you want to get the newly updated one you shall use new: true
      // By default validation is off in the findByIdAndUpdate --> runValidators: true
    );
    if (updatedPost) {
      res.send(updatedPost);
    } else {
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.delete("/:postId", async (req, res, next) => {
  try {
    const deletedPost = await PostsModel.findByIdAndDelete(req.params.postId);
    if (deletedPost) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});
const cloudinaryPostUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary, // cloudinary is going to search for smth in .env vars called process.env.CLOUDINARY_URL
    params: {
      folder: "LinkedIn post/posts",
    },
  }),
}).single("image");

postsRouter.post(
  "/:postId/image",
  cloudinaryPostUploader,
  async (req, res, next) => {
    try {
      const post = await PostsModel.findByIdAndUpdate(
        req.params.postId,
        { image: req.file.path },
        { new: true, runValidators: true }
      );
      console.log("FILE:", req.file);
      if (post) {
        res.send(post);
      } else {
        next(
          createHttpError(404, `Post with id ${req.params.postId} not found!`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);
postsRouter.get("/:postId/like", async (req, res, next) => {
  try {
    const post = await PostsModel.findById(req.params.postId).populate([
      {
        path: "user",
        select: "name surname image title",
      },
      {
        path: "likes",
        select: "name surname image title",
      },
    ]);
    if (post) {
      res.send(post);
    } else {
      next(createHttpError(404, `Post with id ${req.params.postId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.post("/:postId/like", async (req, res, next) => {
  try {
    const { userId } = req.body;
    const post = await PostsModel.findById(req.params.postId);
    if (!post)
      return next(
        createHttpError(404, `Post with id ${req.params.postId} not found`)
      );
    const user = await UsersModal.findById(userId);
    console.log("user", user);
    if (!user)
      return next(createHttpError(404, `User with id ${userId} not found`));
    console.log("User", userId);

    if (post.likes.includes(userId)) {
      const deleteLikes = await PostsModel.findOneAndUpdate(
        { _id: req.params.postId },
        { $pull: { likes: userId } },
        { new: true, runValidators: true }
      );
      res.send({
        deleteLikes,
        length: deleteLikes.likes.length,
      });
    } else {
      const updatedPost = await PostsModel.findOneAndUpdate(
        { _id: req.params.postId },
        { $push: { likes: userId } },
        { new: true, runValidators: true, upsert: true }
      );
      console.log("updatedPost", updatedPost);
      res.send({
        updatedPost,
        length: updatedPost.likes.length,
      });
    }
  } catch (error) {
    next(error);
  }
});

export default postsRouter;
