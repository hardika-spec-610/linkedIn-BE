import Express from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import ExperiencesModel from './model.js'
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { pipeline, Readable } from 'stream'
import { stringify } from 'csv-stringify';
import { format } from "date-fns";
import q2m from 'query-to-mongo'



const experiencesRouter = Express.Router()


experiencesRouter.get("/:userId/experiences/CSV", async (request, response, next) => {
    try {
        const experiences = await ExperiencesModel.find();
        const foundExperiences = experiences.filter(exp => exp.user.toString() === request.params.userId);

        const experiencesReadableStream = new Readable({
            objectMode: true,
            read() {
                foundExperiences.forEach(exp => {
                    const formattedExp = exp.toObject();
                    formattedExp.startDate = format(new Date(exp.startDate), 'dd.MM.yyyy');
                    formattedExp.endDate ? format(new Date(exp.endDate), 'dd.MM.yyyy') : null;
                    this.push(formattedExp);
                });
                this.push(null);
            }
        });

        const csvTransform = stringify({
            header: true,
            columns: ['role', 'company', 'area', 'startDate', 'endDate']
        });

        response.setHeader('Content-Disposition', `attachment; filename=experiences${request.params.userId}.csv`);

        const source = experiencesReadableStream
        const transform = csvTransform
        const destination = response

        pipeline(source, transform, destination, error => {
            if (error) console.error(error);
        });
    } catch (error) {
        next(error);
    }
});


experiencesRouter.get("/:userId/experiences", async (request, response, next) => {
    try {
        const mongoQuery = q2m(request.query)
        console.log(mongoQuery)
        const experiences = await ExperiencesModel.find({ user: new mongoose.Types.ObjectId(request.params.userId) })
            .select(mongoQuery.options.fields)
            .skip(mongoQuery.options.skip)
            .limit(mongoQuery.options.limit)
            .sort(mongoQuery.options.sort)
        response.send(experiences)
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



const cloudinaryUploader = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: {
            folder: "fs0522/experiences"
        }
    })
}).single('experience')


experiencesRouter.post("/:userId/experiences/:expId/image", cloudinaryUploader, async (request, response, next) => {
    try {
        const updatedExperience = await ExperiencesModel.findByIdAndUpdate(
            request.params.expId,
            { image: request.file.path },
            { new: true, runValidators: true }
        )

        response.send(updatedExperience)
    } catch (error) {
        next(error)
    }
})




export default experiencesRouter