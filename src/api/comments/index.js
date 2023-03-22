import Express from 'express';
import createHttpError from 'http-errors';
import CommentModel from '../comments/model.js';

const commentsRouter = Express.Router()

// Retrieve the list of comments for a given post
commentsRouter.get('/:postId/comments', async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const comments = await CommentModel.find({ post: postId }).populate('user');
        res.send(comments);
    } catch (error) {
        next(error);
    }
});

// Retrieve a single comment from a given post
commentsRouter.get('/:postId/comments/:commentId', async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const commentId = req.params.commentId;
        const comment = await CommentModel.findOne({ _id: commentId, post: postId }).populate('user');

        if (comment) {
            res.send(comment);
        } else {
            next(createHttpError(404, `Comment with id ${commentId} not found in post with id ${postId}!`));
        }
    } catch (error) {
        next(error);
    }
});


// Create a new comment for a given post
commentsRouter.post('/:postId/comments', async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const newComment = new CommentModel({ ...req.body, post: postId });
        const { _id } = await newComment.save();
        res.status(201).send({ _id });
    } catch (error) {
        next(error);
    }
});

// Delete a given comment
commentsRouter.delete('/:postId/comments/:commentId', async (req, res, next) => {
    try {
        const commentId = req.params.commentId;
        const deletedComment = await CommentModel.findByIdAndDelete(commentId);
        if (deletedComment) {
            res.status(204).send();
        } else {
            next(createHttpError(404, `Comment with id ${commentId} not found!`));
        }
    } catch (error) {
        next(error);
    }
});

// Edit a given comment
commentsRouter.put('/:postId/comments/:commentId', async (req, res, next) => {
    try {
        const commentId = req.params.commentId;
        const updatedComment = await CommentModel.findByIdAndUpdate(
            commentId,
            { $set: req.body },
            { new: true }
        );
        if (updatedComment) {
            res.send(updatedComment);
        } else {
            next(createHttpError(404, `Comment with id ${commentId} not found!`));
        }
    } catch (error) {
        next(error);
    }
});

export default commentsRouter
