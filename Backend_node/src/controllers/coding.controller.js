import Interview from "../models/interviews.models.js";
import { expressRepre } from "@vashuthegreat/vexpress";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import Coding from "../models/CodingQuestions.models.js";


export const create_coding_schema = expressRepre(
  {
    summary: "creates coding performace schema",
    response: "coding performance"
  },

  asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) throw new ApiError(400, "User not found");

    let coding = await Coding.find({ user: user._id });

    if (coding && coding.length > 0) {
      return res.status(200).json(
        new ApiResponse(200, coding, "user already have coding schema")
      );
    }

    coding = await Coding.create({ user: user._id });

    if (!coding)
      throw new ApiError(500, "Error while initialising coding");

    return res.status(200).json(
      new ApiResponse(200, coding, "coding schema created")
    );
  })
);


export const get_coding_schema = expressRepre(
  {
    summary: "returns existing coding performace schema",
    response: "coding performance"
  },

  asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) throw new ApiError(400, "User not found");

    const coding = await Coding.find({ user: user._id });

    if (!coding || coding.length === 0) {
      throw new ApiError(404, "Coding schema not found");
    }

    return res.status(200).json(
      new ApiResponse(200, coding, "coding schema fetched")
    );
  })
);

export const update_coding_schema = expressRepre(
  {
    summary: "updates existing coding performace schema",
    body: {
      recently_solved: ['1'],
      recently_visited: ['1'],
      all_questions_solved: ["1"],
      easy: 1,
      medium: 2,
      hard: 1
    },
    response: "coding performance"
  },

  asyncHandler(async (req, res) => {
    const user_id = req.user?._id;
    if (!user_id) throw new ApiError(400, "User not found");

    const {
      recently_solved,
      recently_visited,
      all_questions_solved,
      easy,
      medium,
      hard
    } = req.body;

    const to_map = {
      recently_solved,
      recently_visited,
      all_questions_solved,
      easy,
      medium,
      hard
    };

    const parameters_to_update = Object.fromEntries(
      Object.entries(to_map).filter(
        ([key, value]) => value !== undefined && value !== null
      )
    );

    console.log("values to update:", parameters_to_update);

    const coding = await Coding.findOneAndUpdate(
      { user: user_id },           
      { $set: parameters_to_update },
      { new: true }
    );

    if (!coding)
      throw new ApiError(500, "Error while updating coding");

    return res.status(200).json(
      new ApiResponse(200, coding, "data updated successfully")
    );
  })
);
