import { Router, type IRouter } from "express";
import healthRouter from "./health";
import submissionsRouter from "./submissions";
import listingsRouter from "./listings";
import marketIntelRouter from "./market-intel";

const router: IRouter = Router();

router.use(healthRouter);
router.use(submissionsRouter);
router.use(listingsRouter);
router.use(marketIntelRouter);

export default router;
