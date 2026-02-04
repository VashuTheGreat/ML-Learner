from langchain_core.prompts import PromptTemplate

prompt=PromptTemplate.from_template(
        template="""
        You are a professional resume generator.
        Using the following user details, generate a complete ResumeSchema output in valid JSON.
        Make sure all fields of ResumeSchema are included.
        
        UserDetails: {userDetails}
        """,
    )