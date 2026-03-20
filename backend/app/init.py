"""
Backend initialization helpers.

This file exists mainly to match the requested scaffold structure.
The actual initialization logic for SQLite is implemented in `database.py`.
"""

from .database import init_db  # re-export for convenience

__all__ = ["init_db"]

