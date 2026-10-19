# QA scripts (Playwright + python http.server)

Serve the game first: `python3 -m http.server 8765` from the project root.
Needs: `pip install playwright pillow` and a Chromium build.

- `smoke.py hero1,hero2 out.json` - every mode x hero, 60 s headless, reports JS errors.
- `shop_layout.py` - shop panel geometry at 390x844 / 360x740 / 844x390.
- `hud_shots.py`, `desktop_modes.py` - screenshots of mode HUDs (mobile portrait / desktop montage).
- `bot_deaths.py` - 10-minute no-player match, bot deaths by state and zone.
- `classic_winrate.py` - 5v5 classic win rate per hero (AFK or controlled hero; see the script).

Pitfalls: matches end via setTimeout (a fast sync loop never fires it - detect the nexus hp instead);
servers die when the shell restarts - start the server in the same command as the test.
- `resume.py` - save + reload + resume in 7 modes.
- `perf.py` - update()/render() cost per frame at 3 viewports (headless software raster: ~0.6 ms update, ~6.5 ms render).
- `bot_compare.py` - A/B bot deaths between two builds on ports 8765/8767 (3 matches x 10 min).
- `result_screens.py` - result screens (win/loss) in portrait and landscape.
