import Express from "express";
import createHttpError from "http-errors";
import PostsModel from "./postModel.js";
import q2m from "query-to-mongo";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

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
    console.log("req.query", req.query);
    console.log("q2m", q2m(req.query));
    const mongoQuery = q2m(req.query);
    //  price: '>10' should be converted somehow into price: {$gt: 10}
    const posts = await PostsModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort);
    //   .populate({ path: "users", select: "name surname image" });
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
    const posts = await PostsModel.findById(req.params.postId);
    //   .populate({ path: "users", select: "name surname image" });
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

export default postsRouter;
