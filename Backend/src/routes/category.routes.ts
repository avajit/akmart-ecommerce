import { Router } from "express";
import * as categoryController from "../controllers/category.controller";

const router = Router();

router.get("/tree", categoryController.getCategoryTree);
router.get("/:slug/filters", categoryController.getCategoryFilters);
router.get("/brands", categoryController.getBrands);

export default router;
