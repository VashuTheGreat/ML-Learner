from langchain_aws import ChatBedrockConverse
llm = ChatBedrockConverse(
    model_id="us.meta.llama3-3-70b-instruct-v1:0",
    region_name="us-east-1"
)