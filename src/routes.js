import { Router } from "express";
import multer from "multer";

import UserController from "./app/controllers/UserController";
import SessionController from "./app/controllers/SessionController";
import FileController from "./app/controllers/FileController";
import MeetupController from "./app/controllers/MeetupController";
import InscriptionController from "./app/controllers/InscriptionController";
import OrganizerController from "./app/controllers/OrganizerController";

import authMiddleware from "./app/middlewares/auth";

import multerConfig from "./config/multer";

const routes = new Router();

const upload = multer(multerConfig);

routes.post("/users", UserController.store);

routes.post("/sessions", SessionController.store);

routes.use(authMiddleware);

routes.post("/files", upload.single("file"), FileController.store);

routes.put("/users", UserController.update);

routes.get("/meetups", MeetupController.index);
routes.post("/meetups", upload.single("banner"), MeetupController.store);
routes.put("/meetups/:id", upload.single("banner"), MeetupController.update);

routes.get("/inscriptions", InscriptionController.index);
routes.post("/inscriptions/:meetupId", InscriptionController.store);

routes.get("/organizer", OrganizerController.index);
routes.delete("/organizer/:id", OrganizerController.delete);

export default routes;
