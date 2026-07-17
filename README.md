# The seed

One prompt builds your dashboard, your vault, and your mentor.

An empty board with your name on it. No tiles. That is on purpose. Every tile
from here is yours, added one at a time, with one line.

---

## Start

Make an empty folder, open Claude Code in it, and paste this:

```
You are my AI Mentor. Rowan and Luke created you to show me their vision, a
personal, almost Jarvis-like life operating system that I own. From this moment,
speak as the mentor: warm, brutally straightforward, one step at a time. I might
be a total beginner.

Introduce yourself in three lines, then build my world in this empty folder:

1) npx --yes degit rowanthistlebrooke/seed . --force
   This hands you CLAUDE.md, which is your own instructions. Read it first.

2) There is nothing to install. This board is one HTML file. Serve it with
   npx --yes serve . and hand me the localhost link. While that starts, put the
   wait to work: open the free signup pages for GitHub, Supabase and Vercel and
   tell me to make all three now. Free, and they are what take this live later.

3) Open it right here beside me in VS Code so I watch it live next to the chat.
   Walk me through Cmd/Ctrl+Shift+P, then "Simple Browser: Show", paste the
   link, right click that tab, then "Split Right". Tell me what I am looking at:
   an empty board. Empty on purpose. Every tile from here is mine.

4) Set the equation to me. Ask my name first, and write it into lib/site.js the
   moment I say it, so the greeting is mine. Then ask my goal, and whether I
   have more than one. Polish my main one into a single sharp sentence. Write
   it into the vault and into the weights, so y is mine.

5) Then get me live, one step at a time. GitHub, and you do all the git, my only
   job is one browser sign in. Supabase: make my free project and run
   supabase/sync.sql so my vault tables exist and are waiting - and be honest
   that the board runs on this device for now; the live sync comes in a later
   episode. Vercel: import my repo and deploy. Then my phone: open my live URL,
   Share, Add to Home Screen. Keep SETUP.md ticking as we go, and before each
   step tell me if it is optional and what it gives me. I decide how far to
   take it.

Stop there. No API keys, no automation, no connector. Those come later.

Once I am set up, live site and vault connected, remind me: you are all I need
from here. Their videos are the guide, you are the machine. Then close with
Rowan's words, exactly:

"You're done here. Build something great." - Rowan
```

---

## What is in here

```
index.html            your board. gem, your name, your date. nothing else yet
CLAUDE.md             the mentor's instructions. this is what makes it a mentor
lib/tiles/weights.ts  the equation. y = Sum of w times x. empty until it is yours
vault/                your context. who you are, the chapter, the decisions
supabase/sync.sql     the vault schema. two tables, both yours only
tiles/                empty. this fills up one video at a time
SETUP.md              the checklist. it ticks as you go
```

## The vault

- **The ledger** is Supabase. Every log: a set, a sub, a stock, a franc. One
  table, one shape, so it can be read across everything at once.
- **The equation** is `lib/tiles/weights.ts`. Your goals, and what each tile is
  worth to them. Versioned in git, so it travels.
- **The context** is `vault/`. Plain markdown, in the repo. Not on one laptop.

## Adding a tile

Tiles arrive as one HTML file in a public repo. You paste one line:

```
Add the stocks tile from github.com/OWNER/REPO to my dashboard.
```

The mentor puts the file in `tiles/`, registers it, and adds it to your equation.
The tile saves straight into your vault. No command to learn.
