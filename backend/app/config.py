from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://verses_user:password@db:3306/verses"
    )
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "UdE6pPly8bFczH6gY4xHLmG3CVN2fH5UCukrvzwN_SM")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # App
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    APP_NAME: str = "Verses API"
    VERSION: str = "0.1.0"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

