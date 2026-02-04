from langchain_core.prompts import PromptTemplate

prompt=PromptTemplate.from_template("You are given with the resume of the user you need to create about User summary do not write anything just give summary which includes keywords more user links if provided,sentence less the summary must be samall in around 200 words max userData:{resume_content}")