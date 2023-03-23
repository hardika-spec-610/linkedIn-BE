import express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import q2m from "query-to-mongo";
import { getUserCVReadableStream } from "./pdfGenerator.js";
import Experience from "../experiences/model.js";
import upload from "./cloudinaryConfig.js";

const usersRouter = express.Router();

// -GET- Retrieves list of users with pagination and filtering
usersRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const users = await UsersModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort);

    const total = await UsersModel.countDocuments(mongoQuery.criteria);
    const numberOfPages = Math.ceil(total / mongoQuery.options.limit);

    res.send({
      links: mongoQuery.links("http://localhost:3200/users", total),
      total,
      numberOfPages,
      users,
    });
  } catch (error) {
    next(error);
  }
});

// -GET- Retrieves the user with userId = {userId}
usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.send(user);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// -POST- Registers a new user with all his details
usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);
    const { _id } = await newUser.save();

    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

// -PUT- Update current user profile details
usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// -POST- Replace user profile image
usersRouter.post(
  "/:userId/image",
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (req.file) {
        const updatedUser = await UsersModel.findByIdAndUpdate(
          req.params.userId,
          { image: req.file.path },
          { new: true }
        );

        if (updatedUser) {
          res.send(updatedUser);
        } else {
          next(
            createHttpError(404, `User with id ${req.params.userId} not found!`)
          );
        }
      } else {
        next(createHttpError(400, "Image file is missing"));
      }
    } catch (error) {
      next(error);
    }
  }
);

// -GET- Generates and download a PDF with the CV of the user (details, image, experiences)
usersRouter.get("/:userId/CV", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      // Generate the PDF with the user's CV (details, image, experiences)
      const pdfReadableStream = await getUserCVReadableStream(user, Experience);

      // Set the response headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${user.name}_${user.surname}_CV.pdf`
      );

      // Pipe the generated PDF stream to the response
      pdfReadableStream.pipe(res);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/:senderId/sendRequest", async (req, res, next) => {
  try {
    const { senderId } = req.params;
    const { receiverId } = req.body;
    const sender = await UsersModel.findById(senderId);
    const receiver = await UsersModel.findById(receiverId);
    console.log(
      "includeReceiver",
      sender.sendRequests.pending.includes(receiverId)
    );
    if (sender.connected.includes(receiverId)) {
      // remove from sender.connected receiverId
      // remove from receiver.connected the senderId
      const deleteSenderConnection = await UsersModel.findByIdAndUpdate(
        senderId,
        { $pull: { connected: receiverId } },
        { new: true, runValidators: true }
      );
      const deleteReceiverConnection = await UsersModel.findByIdAndUpdate(
        receiverId,
        { $pull: { connected: senderId } },
        { new: true, runValidators: true }
      );
      res.send({
        sender: sender.sendRequests.pending,
        receiver: receiver.receivedRequests.pending,
        senderId: senderId,
        receiverId: receiverId,
      });
    } else if (sender.sendRequests.pending.includes(receiverId)) {
      // remove from sender.sendRequests.pending receiverId
      // remove from receiver.receivedRequests.pending the senderId
      const deleteSendRequest = await UsersModel.findByIdAndUpdate(
        req.params.senderId,
        { $pull: { "sendRequests.pending": receiverId } },
        { new: true, runValidators: true }
      );
      const deleteReceivedRequest = await UsersModel.findByIdAndUpdate(
        req.body.receiverId,
        { $pull: { "receivedRequests.pending": senderId } },
        { new: true, runValidators: true }
      );
      res.send({
        deleteSendRequest,
        deleteReceivedRequest,
      });
    } else {
      sender.sendRequests.pending.push(receiverId);
      receiver.receivedRequests.pending.push(senderId);
      await sender.save();
      await receiver.save();
      res.send({
        sender: sender.sendRequests.pending,
        receiver: receiver.receivedRequests.pending,
        senderId: senderId,
        receiverId: receiverId,
      });
    }
  } catch (error) {
    next(error);
  }
});
export default usersRouter;
