from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Core
    database_url: str = "sqlite:///./chatbot.db"
    secret_key: str = "dev-insecure-change-me"
    access_token_expire_minutes: int = 10080

    # LLM / embeddings
    gemini_api_key: str = ""
    gemini_chat_model: str = "gemini-2.0-flash"
    gemini_embed_model: str = "text-embedding-004"
    embedding_dim: int = 768

    # Ingestion
    max_crawl_pages: int = 50
    crawl_same_domain_only: bool = True
    chunk_size: int = 800
    chunk_overlap: int = 120

    # RAG
    retrieval_top_k: int = 5
    answer_mode: str = "grounded"  # grounded | hybrid

    # CORS / widget
    dashboard_origins: str = "http://localhost:3000"
    chat_rate_limit_per_min: int = 20

    @property
    def has_gemini(self) -> bool:
        return bool(self.gemini_api_key.strip())


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
