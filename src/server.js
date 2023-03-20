import Express from "express"; // NEW IMPORT SYNTAX (We can use it only if we add "type": "module", to package.json)
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import {
  genericErrorHandler,
  badRequestHandler,
  notfoundHandler,
} from "./errorsHandlers.js";
import { join } from "path";
import mongoose from "mongoose";
import experiencesRouter from "./api/experiences/index.js";
import usersRouter from "./api/users/index.js";
import postsRouter from "./api/posts/postsIndex.js";
import createHttpError from "http-errors";

const server = Express();
const port = process.env.PORT;
const publicFolderPath = join(process.cwd(), "./public");

server.use(Express.static(publicFolderPath));
const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];
server.use(
  cors({
    origin: (currentOrigin, corsNext) => {
      if (!currentOrigin || whitelist.indexOf(currentOrigin) !== -1) {
        corsNext(null, true);
      } else {
        corsNext(
          createHttpError(
            400,
            `Origin ${currentOrigin} is not in the whitelist!`
          )
        );
      }
    },
  })
);
server.use(Express.json());

// ************************** ENDPOINTS ***********************
server.use("/users", usersRouter);
server.use("/users", experiencesRouter);
server.use("/posts", postsRouter);

server.use(badRequestHandler);
server.use(notfoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("✅ Successfully connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`✅ Server is running on port ${port}`);
  });
});
