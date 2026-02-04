import {expressRepre} from "@vashuthegreat/vexpress";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import Template from "../models/templates.models.js";
import reder_html from "../helper/ejsEmbeder.helper.js"
import fs from "fs";
import path from "path";

export const createTemplate=expressRepre(
    {
        summary:"upload a template",
        FormData:{
            temp_data:"json.pdf",
            title:"Data Science",
            template:"resume.pdf"
        },
        response:"uploaded template"
    },
    asyncHandler(
        async(req,res)=>{
            const {temp_data,title}=req.body
            const files = req.files;

            const templateFile = files?.template?.[0];
            const tempDataFile = files?.temp_data?.[0];

            if (!templateFile || !title){
                throw new ApiError(400,"Invalid template data. Please provide a template file and title.")
            }

            // Read the uploaded template file content
            const templateContent = fs.readFileSync(templateFile.path, "utf-8");

            // Handle temp_data (can be file or body string)
            let parsedTempData;
            if (tempDataFile) {
                try {
                    const tempDataContent = fs.readFileSync(tempDataFile.path, "utf-8");
                    parsedTempData = JSON.parse(tempDataContent);
                } catch (error) {
                    throw new ApiError(400, "Invalid JSON in temp_data file");
                }
            } else if (temp_data) {
                if (typeof temp_data === "string") {
                    try {
                        parsedTempData = JSON.parse(temp_data);
                    } catch (error) {
                        throw new ApiError(400, "Invalid JSON in temp_data body");
                    }
                } else {
                    parsedTempData = temp_data;
                }
            }

            if (!parsedTempData) {
                throw new ApiError(400, "Please provide temp_data as a file or in the request body.");
            }

            const templateData=await Template.create({
                template: templateContent,
                temp_data: parsedTempData,
                title
            })

            // Clean up the temporary files
            if (templateFile && fs.existsSync(templateFile.path)) {
                fs.unlinkSync(templateFile.path);
            }
            if (tempDataFile && fs.existsSync(tempDataFile.path)) {
                fs.unlinkSync(tempDataFile.path);
            }

            if (templateData){
                res.status(200).json(new ApiResponse(200,templateData,"Template uploaded successfully"))
            }
            else{
                throw new ApiError(400,"Failed to upload template")
            }

        }
    )
)

export const getTemplates=expressRepre(
    {
        summary: "get templates",
        params:{id:'695a221e9e5f6b6f4690190e'},
        response: "templates"
    },
    asyncHandler(
        async(req,res)=>{
            const id=req.params.id
            if (!id){
                throw new ApiError(400,"Invalid template id")
            }
            
            // Try to find in database
            const templateData = await Template.findById(id).catch(() => null);
            
            if (templateData){
                res.status(200).json(new ApiResponse(200,templateData,"Template fetched successfully"))
            } else {
                throw new ApiError(404, "Template not found");
            }

        }
    )
)




export const getAllTemplates = expressRepre(
  {
    summary: "Get all templates",
    response: "templates"
  },
  asyncHandler(async (req, res) => {
    try {
        console.log("me call hua")
      const templateData = await Template.find().lean(); // fetch all templates

      

      if (!templateData || templateData.length === 0) {
        // agar collection empty ho
        return res.status(404).json(new ApiResponse(404, [], "No templates found"));
      }
      const final_response=[]
      templateData.map((template)=>{
        final_response.push({...template,to_render:reder_html(template.template,template.temp_data)})
      })

    //   console.log(final_response)
      // agar templates mil gaye
      return res
        .status(200)
        .json(new ApiResponse(200, final_response, "Templates fetched successfully"));

    } catch (err) {
      console.error("Error fetching templates:", err);
      // database ya server error
      throw new ApiError(500, "Internal Server Error");
    }
  })
);


export const getTemplate_by_data=expressRepre(
    {
        summary: "get filled template with data",
        body:{template_id:'695a221e9e5f6b6f4690190e',temp_data:`{
  "personal": {
    "name": "John Doe",
    "title": "Software Engineer",
    "phone": "+1 234 567 890",
    "email": "john.doe@example.com",
    "location": "San Francisco, CA",
    "image": {
      "enabled": true,
      "url": ""
    }
  },
  "summary": "Experienced software engineer with a strong background in full-stack development and a passion for building scalable applications.",
  "education": {
    "year": "2016 - 2020",
    "college": "University of California, Berkeley",
    "degree": "Bachelor of Science in Computer Science"
  },
  "skills": {
    "technical": [
      "JavaScript",
      "Node.js",
      "React",
      "MongoDB",
      "Docker"
    ],
    "soft": [
      "Leadership",
      "Communication",
      "Problem Solving"
    ]
  },
  "languages": [
    "English",
    "Spanish"
  ],
  "experience": {
    "details": [
      {
        "role": "Senior Developer",
        "duration": "2021 - Present",
        "company": "Tech Solutions Inc.",
        "responsibilities": [
          "Lead a team of 5 developers in building a high-traffic e-commerce platform.",
          "Implemented microservices architecture using Node.js and AWS.",
          "Optimized database queries, reducing response time by 30%."
        ]
      },
      {
        "role": "Junior Developer",
        "duration": "2020 - 2021",
        "company": "Startup Hub",
        "responsibilities": [
          "Developed and maintained RESTful APIs for a mobile application.",
          "Collaborated with UI/UX designers to implement responsive web interfaces.",
          "Participated in code reviews and unit testing."
        ]
      }
    ]
  },
  "references": [
    {
      "name": "Jane Smith",
      "company": "Tech Solutions Inc.",
      "position": "CTO",
      "phone": "+1 987 654 321",
      "email": "jane.smith@techsolutions.com"
    }
  ]
}`},
        response: "template with filled data"
    },
    asyncHandler(
        async(req,res)=>{
          const userAvatar=req.user._doc.avatar
            const id=req.body.template_id
            if (!id){
                throw new ApiError(400,"Invalid template id")
            }
            
            // Try to find in database
            const templateData = await Template.findById(id).catch(() => null);
            const {temp_data}=req.body;
            if (!temp_data){
                throw new ApiError(400, "temp data is undefined")
            }

            // Parse temp_data if it's a string
            let parsedTempData;
            if (typeof temp_data === "string") {
                try {
                    parsedTempData = JSON.parse(temp_data);
                } catch (error) {
                    throw new ApiError(400, "Invalid JSON in temp_data body");
                }
            } else {
                parsedTempData = temp_data;
            }

            if (templateData){
              parsedTempData={...parsedTempData,avatar:userAvatar}
                res.status(200).json(new ApiResponse(200,{to_render:reder_html(templateData.template,parsedTempData)},"Template fetched successfully"))
            } else {
                throw new ApiError(404, "Template not found");
            }

        }
    )
)