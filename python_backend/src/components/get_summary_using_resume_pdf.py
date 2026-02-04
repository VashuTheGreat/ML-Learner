from langchain_community.document_loaders import DirectoryLoader,PyPDFLoader
# import faiss
# from langchain_community.docstore.in_memory import InMemoryDocstore
# from langchain_community.vectorstores import FAISS
import os
from src.utils.common_LLm import llm as summerizer_llm
from src.prompts.resumeSummary_prompts import prompt as ResumeSummaryPrompt
# embedding_function=OllamaEmbeddings(model="gemma2:2b")
# embedding_dim = len(embedding_function.embed_query("hello world"))
# index = faiss.IndexFlatL2(embedding_dim)

# vector_store = FAISS(
#     embedding_function=embedding_function,
#     index=index,
#     docstore=InMemoryDocstore(),
# )

# ------------- Documents loader --------------
async def document_loader(file_path=""):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"file not found at location {file_path}")
    
    loader=PyPDFLoader(file_path=file_path)
    documents=loader.load()
    return documents



async def get_summary(file_path):
    docs=await document_loader(file_path=file_path)
    prompt=ResumeSummaryPrompt.formate(
        resume_content=docs[0].page_content
    )
    res=await summerizer_llm.ainvoke(prompt)
    print(res)
    return res.content

# if __name__=="__main__":
#     import asyncio
#     asyncio.run(main()) 
    

