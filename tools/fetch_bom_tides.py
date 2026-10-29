#!/usr/bin/env python3
"""Fetch BOM tide predictions (highs/lows) for Point Lonsdale and write data/tides.json.

Point Lonsdale (VIC_TP009) is BOM's nearest official open-coast port to Torquay (~30 km east).
Run yearly (or when the file nears expiry):  python3 tools/fetch_bom_tides.py 2026 2027
Data © Commonwealth of Australia, Bureau of Meteorology.
"""
import calendar, html, json, re, sys, time, urllib.request
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

AAC = 'VIC_TP009'
MEL = ZoneInfo('Australia/Melbourne')
URL = ('https://www.bom.gov.au/australia/tides/print.php?aac={aac}&type=tide&date=01-{m:02d}-{y}'
       '&region=VIC&tz=Australia/Melbourne&tz_js=AEDT&days={days}')
MONTHS = {m: i for i, m in enumerate(calendar.month_abbr) if m}


def fetch_month(y, m):
    days = calendar.monthrange(y, m)[1]
    req = urllib.request.Request(URL.format(aac=AAC, y=y, m=m, days=days),
                                 headers={'User-Agent': 'Mozilla/5.0 (Macintosh)'})
    raw = urllib.request.urlopen(req, timeout=30).read().decode('utf-8', 'replace')
    raw = re.sub(r'<script.*?</script>', '', raw, flags=re.S)
    text = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', raw)))
    out = []
    # e.g. "Fri 30 Oct High 3:42 am 1.80 m Low 9:13 am 0.65 m ..."
    for day in re.finditer(r'(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (\d{1,2}) ([A-Z][a-z]{2})((?: (?:High|Low) \d{1,2}:\d{2} [ap]m -?\d+\.\d+ m)+)', text):
        d, mon = int(day.group(2)), MONTHS[day.group(3)]
        for ev in re.finditer(r'(High|Low) (\d{1,2}):(\d{2}) ([ap]m) (-?\d+\.\d+) m', day.group(4)):
            hh = int(ev.group(2)) % 12 + (12 if ev.group(4) == 'pm' else 0)
            local = datetime(y, mon, d, hh, int(ev.group(3)), tzinfo=MEL)
            out.append({'t': int(local.timestamp()), 'type': ev.group(1)[0], 'h': float(ev.group(5))})
    return out


def main():
    y0, y1 = (int(a) for a in sys.argv[1:3])
    events = []
    for y in range(y0, y1 + 1):
        for m in range(1, 13):
            evs = fetch_month(y, m)
            print(f'{y}-{m:02d}: {len(evs)} events', file=sys.stderr)
            events += evs
            time.sleep(0.7)
    events = sorted({e['t']: e for e in events}.values(), key=lambda e: e['t'])
    doc = {
        'station': 'Point Lonsdale, VIC (BOM VIC_TP009)',
        'datum': 'LAT',
        'source': 'Bureau of Meteorology tide predictions',
        'fetched': datetime.now(timezone.utc).strftime('%Y-%m-%d'),
        'from': events[0]['t'], 'to': events[-1]['t'],
        # compact rows: [unix seconds, 1=high/0=low, height m]
        'events': [[e['t'], 1 if e['type'] == 'H' else 0, e['h']] for e in events],
    }
    with open('data/tides.json', 'w') as f:
        json.dump(doc, f, separators=(',', ':'))
    print(f"wrote {len(events)} events {datetime.fromtimestamp(doc['from'], MEL)} → {datetime.fromtimestamp(doc['to'], MEL)}", file=sys.stderr)


if __name__ == '__main__':
    main()
