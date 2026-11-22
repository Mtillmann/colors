"""Distill the xkcd color survey into shade votes per RGB cell.

Free-text answers are mapped to the 14 base shades used by @mtillmann/colors.
The last recognized color word is the head ("olive green" -> Green, "light blue" -> Blue);
a few compound names are mapped as a whole ("blue green" -> Cyan). Unclear names
(e.g. peach, mauve, periwinkle) are ignored rather than guessed.

Usage: python3 -I scripts/survey/distill.py survey.db sources/xkcd-survey-shades.json

The output is used by scripts/shade-inference.js (cells) during data generation.
"light"/"dark" hold how many answers per cell used a light/dark modifier.
"""
import json
import re
import sqlite3
import sys
from collections import Counter

SHADES = ["Black", "Blue", "Brown", "Cyan", "Green", "Grey", "Magenta", "Orange",
          "Pink", "Purple", "Red", "Violet", "White", "Yellow"]

PHRASES = {
    "blue green": "Cyan", "bluegreen": "Cyan", "green blue": "Cyan", "greenblue": "Cyan",
    "hot pink": "Pink", "off white": "White", "sea green": "Green", "sky blue": "Blue",
    "navy blue": "Blue", "royal blue": "Blue", "baby blue": "Blue", "forest green": "Green",
    "lime green": "Green", "kelly green": "Green", "olive green": "Green",
}
WORDS = {
    # basic terms
    "red": "Red", "orange": "Orange", "yellow": "Yellow", "green": "Green", "blue": "Blue",
    "purple": "Purple", "violet": "Violet", "pink": "Pink", "brown": "Brown", "black": "Black",
    "white": "White", "grey": "Grey", "gray": "Grey", "cyan": "Cyan", "magenta": "Magenta",
    # common specific names with a clear family
    "crimson": "Red", "scarlet": "Red", "maroon": "Red", "burgundy": "Red", "cherry": "Red", "brick": "Red",
    "tangerine": "Orange", "pumpkin": "Orange",
    "gold": "Yellow", "golden": "Yellow", "mustard": "Yellow", "lemon": "Yellow", "canary": "Yellow",
    "lime": "Green", "olive": "Green", "chartreuse": "Green", "emerald": "Green", "mint": "Green",
    "forest": "Green", "kelly": "Green", "jade": "Green",
    "navy": "Blue", "royal": "Blue", "cobalt": "Blue", "cerulean": "Blue", "azure": "Blue",
    "sapphire": "Blue", "sky": "Blue",
    "teal": "Cyan", "turquoise": "Cyan", "aqua": "Cyan", "aquamarine": "Cyan",
    "lavender": "Violet", "lilac": "Violet", "plum": "Purple", "eggplant": "Purple",
    "fuchsia": "Magenta", "fuschia": "Magenta", "fucshia": "Magenta",
    "rose": "Pink", "salmon": "Pink",
    "tan": "Brown", "beige": "Brown", "khaki": "Brown", "chocolate": "Brown", "coffee": "Brown",
    "umber": "Brown", "sienna": "Brown", "sepia": "Brown", "mocha": "Brown", "rust": "Brown",
    "charcoal": "Grey", "silver": "Grey", "slate": "Grey",
    "cream": "White", "ivory": "White",
    # frequent misspellings / clear names found in the unmapped answers
    "lavendar": "Violet", "fuscia": "Magenta", "fushia": "Magenta", "turqoise": "Cyan",
    "wine": "Red", "grape": "Purple", "goldenrod": "Yellow", "grass": "Green", "sage": "Green",
    "seafoam": "Green",
}
LIGHT = {"light", "pale", "pastel", "baby", "faded", "soft", "lite"}
DARK = {"dark", "deep", "navy", "forest", "maroon"}


def classify(name):
    """-> (shade or None, modifier 'light'/'dark'/None)"""
    s = re.sub(r"[^a-z ]", " ", name.lower()).strip()
    s = re.sub(r"\s+", " ", s)
    if not s:
        return None, None
    words = s.split(" ")
    mod = "light" if any(w in LIGHT for w in words) else "dark" if any(w in DARK for w in words) else None
    for phrase, shade in PHRASES.items():
        if s == phrase or s.endswith(" " + phrase):
            return shade, mod
    for w in reversed(words):
        if w in WORDS:
            return WORDS[w], mod
    # only "-ish" words ("greenish"): use them as the shade
    for w in reversed(words):
        stem = w[:-3] if w.endswith("ish") else None
        if stem in WORDS:
            return WORDS[stem], mod
        if stem and stem[:-1] in WORDS:  # "bluish" -> "blu"? no; "reddish" -> "redd" -> "red"
            return WORDS[stem[:-1]], mod
    return None, mod


def main():
    db_path, out = sys.argv[1], sys.argv[2]
    db = sqlite3.connect(db_path)
    rows = db.execute("""
        SELECT a.r, a.g, a.b, a.colorname FROM answers a JOIN users u ON u.id = a.user_id
        WHERE u.colorblind = 0 AND u.spamprob < 0.1""")
    grid = 16
    step = 256 // grid
    cells = [[0] * len(SHADES) for _ in range(grid ** 3)]
    light = [0] * grid ** 3
    dark = [0] * grid ** 3
    idx = {s: i for i, s in enumerate(SHADES)}
    total = mapped = 0
    unmapped = Counter()
    for r, g, b, name in rows:
        total += 1
        shade, mod = classify(name or "")
        if shade is None:
            unmapped[(name or "").strip().lower()] += 1
            continue
        mapped += 1
        c = (r // step) * grid * grid + (g // step) * grid + (b // step)
        cells[c][idx[shade]] += 1
        if mod == "light":
            light[c] += 1
        elif mod == "dark":
            dark[c] += 1
    json.dump({"source": "xkcd color survey (2010), answers mapped to base shades by scripts/survey/distill.py",
               "grid": grid, "shades": SHADES, "cells": cells, "light": light, "dark": dark,
               "answers": total, "mapped": mapped}, open(out, "w"), separators=(",", ":"))
    print(f"answers (filtered users): {total}, mapped to a shade: {mapped} ({100 * mapped / total:.1f}%)")
    counts = [sum(c) for c in cells]
    print(f"answers per cell: min {min(counts)}, median {sorted(counts)[len(counts) // 2]}, max {max(counts)}")
    print("top unmapped:", ", ".join(f"{n} ({c})" for n, c in unmapped.most_common(25)))


if __name__ == "__main__":
    main()
