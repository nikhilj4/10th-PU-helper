from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    app_name: str = "student-chatbot-api"
    api_prefix: str = "/api/v1"

    database_url: str

    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    gemini_api_key: str
    gemini_model: str = "gemini-1.5-flash"
    gemini_embed_model: str = "text-embedding-004"

    pinecone_api_key: str
    pinecone_index: str
    pinecone_namespace: str = "default"
    pinecone_top_k: int = 5

    twilio_account_sid: str
    twilio_auth_token: str
    twilio_verify_service_sid: str

    razorpay_key_id: str
    razorpay_key_secret: str
    razorpay_webhook_secret: str = ""


settings = Settings()
