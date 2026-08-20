import { Router } from "express";
<<<<<<< HEAD
import { getUsers, getUserById }  from "./../controllers/user.controller";

const router = Router();

// Route lấy danh sách (kèm query role/status nếu có)
router.get("/", getUsers);

// Route lấy chi tiết theo MongoDB ObjectId
router.get("/:id", getUserById);

export default router;
=======

import { getUsers, getUserById }  from "./../controllers/user.controller";



const router = Router();



// Route lấy danh sách (kèm query role/status nếu có)

router.get("/", getUsers);



// Route lấy chi tiết theo MongoDB ObjectId

router.get("/:id", getUserById);



export default router; 

>>>>>>> 5dbeb45 (fix: team,team detail)
