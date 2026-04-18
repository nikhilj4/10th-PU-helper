import logging

from fastapi import FastAPI
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import settings
from app.core.logging import configure_logging

configure_logging()
logger = logging.getLogger("api")

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_prefix)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info("request_start method=%s path=%s", request.method, request.url.path)
    response = await call_next(request)
    logger.info("request_end method=%s path=%s status=%s", request.method, request.url.path, response.status_code)
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("unhandled_error path=%s", request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}
