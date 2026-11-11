import logging

from sqlalchemy import event
from sqlalchemy.pool import QueuePool

from app.core.database import engine
from app.core.settings import settings

logger = logging.getLogger("uvicorn.error")


class PoolMonitor:
    def __init__(self, pool: QueuePool, max_overflow: int):
        self.pool = pool
        self.max_overflow = max_overflow
        self.last_state = "normal"

    def check(self, *args: object) -> None:
        overflow = max(0, self.pool.overflow())

        if overflow == 0:
            state = "normal"
        elif overflow >= self.max_overflow:
            state = "limit"
        else:
            state = "overflow"

        if state == self.last_state:
            return

        if state == "normal":
            logger.info("DB_POOL_NORMALIZED overflow=0")

        elif state == "overflow":
            logger.warning(
                "DB_POOL_OVERFLOW_STARTED overflow=%d limit=%d",
                overflow,
                self.max_overflow,
            )

        else:
            logger.error(
                "DB_POOL_OVERFLOW_LIMIT_REACHED overflow=%d limit=%d",
                overflow,
                self.max_overflow,
            )

        self.last_state = state


pool = engine.sync_engine.pool
assert isinstance(pool, QueuePool)

monitor = PoolMonitor(pool, max_overflow=settings.database_pool_max_overflow)

event.listen(pool, "checkout", monitor.check)
event.listen(pool, "checkin", monitor.check)
event.listen(pool, "close", monitor.check)
logger.warning("DB_POOL_MONITOR_REGISTERED")