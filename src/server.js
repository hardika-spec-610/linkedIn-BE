import Express from "express"; // NEW IMPORT SYNTAX (We can use it only if we add "type": "module", to package.json)
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import {
  genericErrorHandler,
  badRequestHandler,
  unauthorizedHandler,
  notfoundHandler,
} from "./errorsHandlers.js";
import { join } from "path";
import mongoose from "mongoose";

const server = Express();
const port = 3001;
const publicFolderPath = join(process.cwd(), "./public");

server.use(Express.static(publicFolderPath));
const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];
server.use(
  cors({
    origin: (currentOrigin, corsNext) => {
      if (!currentOrigin || whitelist.indexOf(currentOrigin) !== -1) {
        // origin is in the whitelist
        corsNext(null, true);
      } else {
        // origin is not in the whitelist
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

server.use(badRequestHandler); // 400
server.use(unauthorizedHandler); // 401
server.use(notfoundHandler); // 404
server.use(genericErrorHandler); // 500 (this should ALWAYS be the last one)

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("✅ Successfully connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`✅ Server is running on port ${port}`);
  });
});
