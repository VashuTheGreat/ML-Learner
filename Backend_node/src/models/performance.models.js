import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    interview_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    overallScore: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    },

    verdict: {
      type: String,
      enum: ["hire", "maybe", "reject"],
      required: true
    },

    summaryFeedback: {
      type: String,
      required: true
    },

    skills: {
      technical: {
        score: { type: Number, min: 0, max: 10 },
        feedback: String
      },
      dsa: {
        score: { type: Number, min: 0, max: 10 },
        feedback: String
      },
      problemSolving: {
        score: { type: Number, min: 0, max: 10 },
        feedback: String
      },
      communication: {
        score: { type: Number, min: 0, max: 10 },
        feedback: String
      },
      systemDesign: {
        score: { type: Number, min: 0, max: 10 },
        feedback: String
      },
      projects: {
        score: { type: Number, min: 0, max: 10 },
        feedback: String
      },
      behaviour: {
        score: { type: Number, min: 0, max: 10 },
        feedback: String
      }
    },

    strengths: [
      {
        type: String
      }
    ],

    weaknesses: [
      {
        type: String
      }
    ],

    practiceRecommendations: [
      {
        type: String
      }
    ],

    studyRecommendations: [
      {
        type: String
      }
    ],

    lowPriorityOrAvoid: [
      {
        type: String
      }
    ],

    confidenceLevel: {
      type: Number,
      min: 0,
      max: 10
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Performance", performanceSchema);
