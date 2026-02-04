import Interview from "../models/interviews.models.js";
import { expressRepre } from "@vashuthegreat/vexpress";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
// import { Query } from "mongoose";

export const createInterview = expressRepre(
  {
    summary: "schedule an interview",
    body: {
      companyName: "VTech",
      topic: "AIML",
      job_Role: "AI Engineer",
      time: "2026-01-14 10:00:00",
      status: "pending"
    },
    response: "interview scheduled"
  },
  asyncHandler(async (req, res) => {
    const { companyName, topic, job_Role, time, status } = req.body;
    const user_id = req.user?._id;

    if (!companyName || !topic || !job_Role || !time || !status) {
      throw new ApiError(400, "All fields are required");
    }

const interview = await Interview.findOne({
  user_id,
  companyName,
  topic,
  job_Role,
  time
});

if (interview) {
  return res
    .status(200)
    .json(new ApiResponse(200, interview, "Interview already exists"));
}

const newInterview = await Interview.create({
  user_id,
  companyName,
  topic,
  job_Role,
  time,
  status
});

return res
  .status(201)
  .json(new ApiResponse(201, newInterview, "Interview created successfully"));


  })
);

export const updateInterviewStatus = expressRepre(
  {
    summary: "update interview status",
    body: {
      id: "69671fa2d697bab6f0176ccc",
      status: "live"
    },
    response: "interview updated"
  },
  asyncHandler(async (req, res) => {
    const { id, status } = req.body;

    if (!id || !status) {
      throw new ApiError(400, "All fields are required");
    }

    const interview = await Interview.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!interview) {
      throw new ApiError(404, "Interview not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, interview, "Interview updated successfully"));
  })
);


export const getUserInterviews = expressRepre(
  {
    summary: "get user Interviews",
    
    response: "interview fetched"
  },
  asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
      throw new ApiError(400, "user required");
    }

    const interview = await Interview.find(
      {user_id:user?._id}
    );

    if (!interview) {
      throw new ApiError(404, "Interviews not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, interview, "Interview fetched successfully"));
  })
);



export const getInterviewById = expressRepre(
  {
    summary: "get interview by id",
    query: {
      id: "69671fa2d697bab6f0176ccc",
    },
    response: "interview "
  },
  asyncHandler(async (req, res) => {
    const { id } = req.query;
    console.log(id)

    if (!id ) {
      throw new ApiError(400, "All fields are required");
    }

    const interview = await Interview.findById(id
    );

    if (!interview) {
      throw new ApiError(404, "Interview not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, interview, "Interview fetched successfully"));
  })
);
