import Interview from "../models/interviews.models.js";
import Performance from "../models/performance.models.js";
import { expressRepre } from "@vashuthegreat/vexpress";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import logger from "../logger/create.logger.js";

export const createPerformance = expressRepre(
  {
    summary: "create interview performance",
    body: {
      interview_id: "69671fa2d697bab6f0176ccc",
      overallScore: 7.5,
      verdict: "maybe",
      summaryFeedback: "Strong fundamentals but needs improvement in DSA",
      skills: {
        technical: { score: 8, feedback: "Good ML basics" },
        dsa: { score: 6, feedback: "Needs more practice" },
        problemSolving: { score: 7, feedback: "Decent approach" },
        communication: { score: 7, feedback: "Clear but hesitant" },
        systemDesign: { score: 5, feedback: "Basic understanding" },
        projects: { score: 8, feedback: "Projects well explained" },
        behaviour: { score: 8, feedback: "Positive attitude" }
      },
      strengths: ["ML basics", "Project explanation"],
      weaknesses: ["DSA", "System design"],
      practiceRecommendations: ["Solve DSA daily", "Mock interviews"],
      studyRecommendations: ["Arrays", "Linked Lists"],
      lowPriorityOrAvoid: ["Advanced ML math"]
    },
    response: "performance created"
  },
  asyncHandler(async (req, res) => {
    const user_id = req.user?._id;

    const {
      interview_id,
      overallScore,
      verdict,
      summaryFeedback,
      skills,
      strengths,
      weaknesses,
      practiceRecommendations,
      studyRecommendations,
      lowPriorityOrAvoid,
      confidenceLevel
    } = req.body;

    if (!interview_id || !overallScore || !verdict || !summaryFeedback) {
      throw new ApiError(400, "Required fields are missing");
    }

    logger.info(`Creating performance for interview: ${interview_id}`);

    if (!mongoose.Types.ObjectId.isValid(interview_id)) {
      throw new ApiError(400, "Invalid interview_id format");
    }

    const interview = await Interview.findById(interview_id);
    if (!interview) {
      throw new ApiError(404, "Interview not found");
    }

    const existingPerformance = await Performance.findOne({ interview_id });
    if (existingPerformance) {
      logger.info(`Performance already exists for interview: ${interview_id}`);
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            existingPerformance,
            "Performance already exists"
          )
        );
    }

    const performance = await Performance.create({
      interview_id,
      user_id,
      overallScore,
      verdict,
      summaryFeedback,
      skills,
      strengths,
      weaknesses,
      practiceRecommendations,
      studyRecommendations,
      lowPriorityOrAvoid,
      confidenceLevel
    });

    if (!performance) {
      throw new ApiError(500, "Failed to create performance");
    }

    logger.info(`Performance created successfully: ${performance._id}`);
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          performance,
          "Performance created successfully"
        )
      );
  })
);





export const getInterviewPerformance = expressRepre(
  {
    summary: "get User Performance",
    body:{
      interview_id:"696f48d0aa5b7622c0b98b76"
    },
   
    response: "performance fetched"
  },
  asyncHandler(async (req, res) => {

    const interview_id=req.body?.interview_id

    if (!interview_id) {
      throw new ApiError(400, "Required fields are missing");
    }

    logger.info(`Fetching performance for interview: ${interview_id}`);

   

    const interview = await Interview.findById(interview_id);
    if (!interview) {
      throw new ApiError(404, "Interview not found");
    }

    const existingPerformance = await Performance.findOne({ interview_id });
    if (!existingPerformance) {
        throw new ApiError(404, "interview performance not found");
    }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            existingPerformance,
            "Performance fetched"
          )
        );


  })
);
