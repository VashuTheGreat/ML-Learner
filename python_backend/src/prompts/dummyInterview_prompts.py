from langchain_core.prompts import PromptTemplate

prompt=PromptTemplate.from_template("""
    You are an interview scheduler AI.

    Generate exactly {no_of_interviews} interview schedules for the following fields:
    {fields}

    company names you will use are: {companiesName}

    Each interview should have:
    - companyName
    - topic
    - job_Role
    - time (ISO 8601 format between {min_date} and {max_date})

    
    Output as a JSON object with key "result" containing a list of interviews.
    """
)