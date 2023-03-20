import Express from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import ExperiencesModel from './model.js'

const experiencesRouter = Express.Router()

experiencesRouter.get("/:userId/experiences", async (request, response, next) => {
    try {
        const experiences = await ExperiencesModel.find()
        const foundExperiences = experiences.filter(exp => exp.user.toString() === request.params.userId)
        if (!foundExperiences) return next(createHttpError(404, `User with _id ${request.params.userId} has no experiences yet!`))
        response.send(foundExperiences)
    } catch (error) {
        next(error)
    }
})


experiencesRouter.post("/:userId/experiences", async (request, response, next) => {
    try {
        const newExperience = new ExperiencesModel({
            ...request.body,
            user: new mongoose.Types.ObjectId(request.params.userId)
        });
        const { _id } = await newExperience.save();
        response.status(201).send({ _id });
    } catch (error) {
        next(error);
    }
});


experiencesRouter.get("/:userId/experiences/:expId", async (request, response, next) => {
    try {
        const foundExperience = await ExperiencesModel.findById(request.params.expId)
        if (!foundExperience) return next(createHttpError(404, `Experience with _id ${request.params.expId} was not found!`))
        response.send(foundExperience)
    } catch (error) {
        next(error)
    }
})


experiencesRouter.put("/:userId/experiences/:expId", async (request, response, next) => {
    try {
        const updatedExperience = await ExperiencesModel.findByIdAndUpdate(
            request.params.expId,
            request.body,
            { new: true, runValidators: true }
        )
        if (!updatedExperience) return next(createHttpError(404, `Experience with _id ${request.params.expId} was not found!`))
        response.send(updatedExperience)
    } catch (error) {
        next(error)
    }
})


experiencesRouter.delete("/:userId/experiences/:expId", async (request, response, next) => {
    try {
        const deletedExperience = await ExperiencesModel.findByIdAndDelete(request.params.expId)
        if (!deletedExperience) return next(createHttpError(404, `Experience with _id ${request.params.expId} was not found!`))
        response.status(204).send()
    } catch (error) {
        next(error)
    }
})

export default experiencesRouter