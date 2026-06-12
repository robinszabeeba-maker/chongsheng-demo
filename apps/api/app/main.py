from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth, keys, open_api, platform


def _init_db() -> None:
    Base.metadata.create_all(bind=engine)
    if settings.run_seed_on_startup:
        from app.seed import main as seed_main

        seed_main()


@asynccontextmanager
async def lifespan(app: FastAPI):
    _init_db()
    yield


app = FastAPI(title="宠生万象 API", version="0.1.0-demo", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(keys.router)
app.include_router(platform.router)
app.include_router(open_api.router)


@app.get("/health")
def health():
    return {"status": "ok", "provider": settings.ai_provider}
