

import aiosqlite
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver


_checkpointer = None

async def get_checkpointer():
    global _checkpointer
    if _checkpointer is None:
        conn = await aiosqlite.connect("db.sqlite")
        _checkpointer = AsyncSqliteSaver(conn)
    return _checkpointer