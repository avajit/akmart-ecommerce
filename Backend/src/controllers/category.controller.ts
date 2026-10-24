import { Request, Response, NextFunction } from "express";
import * as categoryService from "../services/category.service";

export const getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tree = await categoryService.getCategoryTree();
    res.json({ success: true, message: "Categories fetched successfully", data: tree });
  } catch (err) { next(err); }
};

export const getCategoryFilters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.getCategoryFilters(req.params.slug as string);
    if (!result) return res.status(404).json({ success: false, message: "Category not found", error: { message: "Category not found" } });
    res.json({ success: true, message: "Category filters fetched successfully", data: result });
  } catch (err) { next(err); }
};

export const getBrands = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brands = await categoryService.getBrands();
    res.json({ success: true, message: "Brands fetched successfully", data: brands });
  } catch (err) { next(err); }
};
