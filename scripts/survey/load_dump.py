"""Load the xkcd color survey SQL dump into an SQLite database.
Usage: python3 -I scripts/survey/load_dump.py path/to/mainsurvey_sqldump.txt survey.db
(mainsurvey_sqldump.txt is part of the xkcd color survey data, ~300 MB, not in this repo)
"""
import sqlite3
import sys

dump, out = sys.argv[1], sys.argv[2]
db = sqlite3.connect(out, isolation_level=None)  # the dump has its own BEGIN/COMMIT
db.execute("PRAGMA journal_mode=OFF")
db.execute("PRAGMA synchronous=OFF")
stmt, n, bad = "", 0, 0
with open(dump, encoding="utf-8", errors="replace") as f:
    for line in f:
        stmt += line
        if not sqlite3.complete_statement(stmt):
            continue
        try:
            db.execute(stmt)
        except sqlite3.Error:
            bad += 1
        stmt = ""
        n += 1
if db.in_transaction:
    db.execute("COMMIT")
print(f"statements: {n}, failed: {bad}")
for t in ("users", "answers", "names"):
    print(t, db.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0])
