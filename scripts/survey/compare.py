"""Compare the shades of @mtillmann/colors with the xkcd survey consensus.
Usage: python3 -I scripts/survey/compare.py sources/xkcd-survey-shades.json .
"""
import json
import subprocess
import sys
from collections import Counter

survey = json.load(open(sys.argv[1]))
lib = sys.argv[2]
G, SH = survey["grid"], survey["shades"]
STEP = 256 // G
MERGE = {"Violet": "Purple"}  # the survey hardly separates them; reported both ways


def dist(r, g, b):
    c = survey["cells"][(r // STEP) * G * G + (g // STEP) * G + (b // STEP)]
    n = sum(c)
    return sorted(((v / n, s) for v, s in zip(c, SH)), reverse=True)


def hex_rgb(h):
    n = int(h[1:], 16)
    return n >> 16, (n >> 8) & 255, n & 255


def base(shade):
    return shade.replace("Light ", "").replace("Dark ", "")


def agree(label_sets, merge=False):
    """label_sets: list of (rgb, [shades]) -> (top1 agree, top2 agree)"""
    m = (lambda s: MERGE.get(s, s)) if merge else (lambda s: s)
    t1 = t2 = 0
    for rgb, shades in label_sets:
        d = dist(*rgb)
        labels = {m(s) for s in shades}
        top = [m(s) for _, s in d[:2]]
        t1 += top[0] in labels
        t2 += bool(labels & set(top))
    return t1, t2


# human labels (merged like the generator)
human = {}
for f in ("wikipedia-shades.json", "cssgradient-io-shades.json"):
    for e in json.load(open(f"{lib}/sources/{f}")):
        h = e["hex"].upper()
        human.setdefault(h, [])
        human[h] += [s for s in e["shade"] if s not in human[h]]
H = [(hex_rgb(h), s) for h, s in human.items()]

now = json.load(open(f"{lib}/src/data/colorMap.json"))
old = json.loads(subprocess.check_output(["git", "-C", lib, "show", "v0.1.1:src/data/colorMap.json"]))
inferred = [h for h in now if h not in human]
I_now = [(hex_rgb(h), [base(s) for s in now[h]["shade"]]) for h in inferred]
I_old = [(hex_rgb(h), [base(s) for s in old[h]["shade"]]) for h in inferred]

pct = lambda x, n: f"{100 * x / n:.1f}%"
print(f"survey: {survey['mapped']} answers mapped to shades, {G}^3 cells\n")
print("agreement with the survey majority (top 1 / survey top 2 contains the label)")
print(f"{'':42}{'exact':>18}{'Purple=Violet':>18}")
for title, data in [(f"human labels ({len(H)})", H),
                    (f"inferred, v0.1.1 closest-only ({len(I_old)})", I_old),
                    (f"inferred, current data ({len(I_now)})*", I_now)]:
    a, b = agree(data), agree(data, True)
    print(f"{title:42}{pct(a[0], len(data)) + ' / ' + pct(a[1], len(data)):>18}{pct(b[0], len(data)) + ' / ' + pct(b[1], len(data)):>18}")

print("* current data already blends this survey in, so this row is optimistic;\n  benchmarks use a held-out half of the participants for a fair number")

# where humans (Wikipedia) and the survey disagree
mix = Counter()
for rgb, shades in H:
    top = dist(*rgb)[0][1]
    if MERGE.get(top, top) not in {MERGE.get(s, s) for s in shades}:
        mix[f"{shades[0]} -> {top}"] += 1
print("\nmost common disagreements, Wikipedia label -> survey majority:")
for k, v in mix.most_common(10):
    print(f"  {v:3}x {k}")

# how certain is the survey across the color space?
tops = sorted(dist(r * STEP + STEP // 2, g * STEP + STEP // 2, b * STEP + STEP // 2)[0][0]
              for r in range(G) for g in range(G) for b in range(G))
n = len(tops)
print("\nsurvey certainty over all cells (share of the majority shade):")
for lo, hi in [(0, .4), (.4, .6), (.6, .8), (.8, 1.01)]:
    k = sum(lo <= t < hi for t in tops)
    print(f"  {int(lo * 100):3}-{min(100, int(hi * 100)):3}%: {pct(k, n)} of the color space")
