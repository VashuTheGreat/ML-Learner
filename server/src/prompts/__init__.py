from langchain_core.prompts import PromptTemplate

dummyInterview_prompts=PromptTemplate.from_template("""
    You are an interview scheduler AI.

    Generate exactly {no_of_interviews} interview schedules for the following fields:
    {fields}

    company names you will use are: {companiesName}

    Each interview should have:
    - companyName
    - topic
    - job_Role
    - time (ISO 8601 format between {min_date} and {max_date})
    """
)




generateInterviewPerformance_prompts=PromptTemplate.from_template("You are given the user chat history with an interviewer AI. Generate performance.")





QuestionGeneraterPrompt=PromptTemplate.from_template(
    """
You are a technical interviewer.

Generate EXACTLY 10 technical interview questions on the topic:
{topic}

Rules:
- Only questions
- No answers
- Number them 1 to 10
"""
)


interview_prompts2=PromptTemplate.from_template(
    """You are an interview chatbot.
Ask ONLY ONE technical question at a time on the topic.
Briefly evaluate the candidate's answer.
Use the remaining time: {time_remaining} seconds to pace the interview.
Do not repeat questions.
End the interview politely if time is over.
Reference for questions: the 10 generated questions provided to you in the System Message. 
CRITICAL RULE: NEVER list all questions. ONLY ASK THE CURRENT QUESTION."""
)



resumeGeneration_prompts=PromptTemplate.from_template(
        template="""
        You are a professional resume generator.
        Analyze the provided UserDetails and populate the ResumeSchema tool accurately.
        
        Rules:
        1. Ensure all relevant fields from the user details are mapped to the schema.
        2. Do NOT provide any conversational response, preamble, or separate JSON text. 
        3. ONLY use the tool for output.
        4. If a piece of information is missing, leave the field as null/empty as per the schema; do not use strings like "null" or "N/A".
        
        UserDetails: {userDetails}
        """,
    )


resumeSummary_prompts=PromptTemplate.from_template(
    """You are given with the resume of the user you 
    need to create about User summary do not write 
    anything just give summary which includes keywords more 
    user links if provided,sentence less the summary must be 
    samall in around 200 words max userData:{resume_content}
    """
    )




# ---------------- InterviewPerformance ------------------------

interview_performance_prompt="""
You are given with user chat history with an 
intervier ai , generate performance
"""




# ------------------ FormFiller ---------------------------
FORMFILLER_LLM_PROMPT = PromptTemplate.from_template(
"""
You are an intelligent AI form-filling assistant.

You are given two inputs:

1. Form Fields:
A list of objects where each field contains:
- id
- name
- placeholder
- type
- label_text

2. User Details:
Structured or unstructured data extracted from the user's resume.

-------------------------------------

Your Task:
- For EACH field in the given list, generate the most accurate value using the user details.
- Use "label_text", "name", and "placeholder" to understand what the field is asking.
- Map the correct information from the resume to the corresponding field.

-------------------------------------

Rules:
- Maintain EXACT SAME ORDER as the input fields.
- Generate EXACTLY one value for each field.
- If exact data is available → use it.
- If not available → intelligently infer a reasonable value.
- If nothing can be inferred → return an empty string "".
- Do NOT hallucinate unrealistic data.

-------------------------------------

Strict Output Requirements:
- Output MUST be valid JSON.
- Output MUST follow this exact Pydantic structure:

{{
  "output": [
    {{ "value": "..." }},
    {{ "value": "..." }}
  ]
}}

- Do NOT include field names, ids, explanations, or extra text.
- ONLY return the JSON.

-------------------------------------

Field Understanding Examples:
- "Full Name" → user's full name
- "Email" → email address
- "Phone" → phone number
- "Address" → full address (construct if needed)

-------------------------------------

INPUT:

Form Fields:
{inputFormFields}

User Details:
{userdetails}

-------------------------------------

Now generate the output.
"""
)
