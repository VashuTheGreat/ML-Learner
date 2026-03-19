export interface User {
  _id: string;
  fullName: string;
  email: string;
  resumes: any[];
  createdAt: string;
  updatedAt: string;
  refreshToken?: string;
  aboutUser?: string;
  avatar?: string;
}

export interface Question {
  id: number;
  title: string;
  difficulty: string;
  category: string;
  problem_description: string;
  starter_code: string;
  example_input: string;
  example_output: string;
  example_reasoning: string;
  learn_content?: string;
  solution_code?: string;
  test_cases: { test: any; expected_output: any }[];
}

export interface CodingSchema {
  recently_solved: string[];
  recently_visited: string[];
  all_questions_solved: string[];
  easy: number;
  medium: number;
  hard: number;
  user: string;
}

export interface UpdateCodingSchemaBody {
  recently_solved?: string[];
  recently_visited?: string[];
  all_questions_solved?: string[];
  easy?: number;
  medium?: number;
  hard?: number;
}
