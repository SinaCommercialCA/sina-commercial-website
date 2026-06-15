import { Router, type IRouter } from "express";
import healthRouter from "./health";
import submissionsRouter from "./submissions";
import listingsRouter from "./listings";
import marketIntelRouter from "./market-intel";
import daniTrackRouter from "./dani-track";

const router: IRouter = Router();

router.use(healthRouter);
router.use(submissionsRouter);
router.use(listingsRouter);
router.use(marketIntelRouter);
router.use(daniTrackRouter);

export default router;
