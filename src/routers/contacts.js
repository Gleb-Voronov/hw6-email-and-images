import { Router } from "express";
import * as contactsController from "../controllers/contactsController.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();


router.use(authenticate);

router.get("/", contactsController.getAllContacts);
router.get("/:id", contactsController.getContactById);
router.post("/", contactsController.createContact);
router.patch("/:id", contactsController.updateContact); 
router.delete("/:id", contactsController.deleteContact);

export default router;
