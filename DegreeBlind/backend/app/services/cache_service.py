import hashlib
import json
from functools import wraps
from typing import Callable, Any
from cachetools import TTLCache
import asyncio
from app.core.config import settings

# In-memory TTL cache for LLM responses
# maxsize=1000 items, TTL from settings (default 3600 seconds)
llm_cache = TTLCache(maxsize=1000, ttl=settings.CACHE_TTL)

# In-memory TTL cache for GitHub API responses to prevent repetitive network latency on username searches
github_cache = TTLCache(maxsize=2000, ttl=settings.CACHE_TTL)

def generate_cache_key(func_name: str, args: tuple, kwargs: dict) -> str:
    """Generates a stable cache key from function arguments, excluding class service instances."""
    clean_args = [str(a) for a in args if not (hasattr(a, '__class__') and 'Service' in a.__class__.__name__)]
    key_dict = {
        "func": func_name,
        "args": clean_args,
        "kwargs": {k: str(v) for k, v in sorted(kwargs.items())}
    }
    key_str = json.dumps(key_dict, sort_keys=True)
    return hashlib.sha256(key_str.encode("utf-8")).hexdigest()

def cache_llm_response(func: Callable) -> Callable:
    """
    Async decorator that caches the result of an LLM call.
    Uses TTLCache to prevent redundant external API calls.
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        cache_key = generate_cache_key(func.__name__, args, kwargs)
        
        if cache_key in llm_cache:
            return llm_cache[cache_key]
        
        result = await func(*args, **kwargs)
        if result:
            llm_cache[cache_key] = result
        return result
    return wrapper

def cache_github_response(func: Callable) -> Callable:
    """
    Async decorator that caches the result of a GitHub API call.
    Drastically accelerates username and owner portfolio lookups.
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        cache_key = generate_cache_key(func.__name__, args, kwargs)
        
        if cache_key in github_cache:
            return github_cache[cache_key]
            
        result = await func(*args, **kwargs)
        if result is not None:
            github_cache[cache_key] = result
        return result
    return wrapper

