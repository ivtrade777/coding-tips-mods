# Coding Tips: 3 Claude Code Mods (take them)

From the video **"3 Claude Code Mods I Built in 5 Minutes (Take Them)"**.

| Mod | What it does |
|---|---|
| `spinner-quips` | Replaces the spinner word with a joke ("Blaming the intern", "Googling the error"…) and counts tool calls |
| `safety-net` | Blocks `rm -rf`, `git push --force`, `git reset --hard` and `DROP TABLE`, and shows a warning |
| `session-hud` | A live HUD above the prompt: time, tool calls, files edited, context bar, cost, and a mood 😎 😅 🥵 |

Needs **Claude Code v2.1.287 or newer** (Desktop app v2.1.286+).

## Install (inside Claude Code)
```
/plugin marketplace add ivtrade777/coding-tips-mods
/plugin install spinner-quips@coding-tips-mods
/plugin install safety-net@coding-tips-mods
/plugin install session-hud@coding-tips-mods
/reload-plugins
```
Install only the ones you want.

## Or try all three for one session, without installing
```
git clone https://github.com/ivtrade777/coding-tips-mods.git
claude --plugin-dir ./coding-tips-mods
```

## Make them yours
Each mod is one short file: `<mod>/hooks/register.ts` (or `.tsx`). Change the jokes in `spinner-quips`, add your own dangerous commands to `safety-net`, or new stats to `session-hud`, then run `/reload-plugins`.

## Before you install any mod
Mods are not sandboxed: they run with your permissions. Read the code (each mod is one short file in `hooks/`) and check what it does:
```
claude plugin validate ./session-hud
```
Tests: `claude plugin test ./safety-net`

Not affiliated with or endorsed by Anthropic. MIT licence.
