# PeterBook

A social-profile-style portfolio for Peter Paul Poloan, built with Next.js, Tailwind, and Firebase Firestore. This README is a maintenance guide — how to make the changes you'll need most often, without having to re-read the whole codebase each time.

## Where things live

| Thing | File |
|---|---|
| Your bio, stack, strengths, contact links | `data/profile.ts` |
| Your projects (the feed) | `data/profile.ts` → `projects` array |
| Photo gallery | `data/profile.ts` → `photos` array |
| Profile photo / cover photo | `public/pfp.jpg`, `public/cover.jpg` |
| Chatbot avatar | `public/avatar.jpg` |
| Chatbot FAQ dataset | `public/peterai-faq.csv` |
| Chatbot matching logic | `lib/faq.ts` |
| Firestore reads/writes (hearts, comments, projects, chatbot) | `lib/api.ts` |
| Firebase config/init | `lib/firebase.ts` |
| All the UI (navbar, feed, chat windows, about section) | `app/page.tsx` |
| Firestore security rules | `firestore.rules` (must be pasted into the Firebase Console → Firestore → Rules tab manually — this repo file doesn't auto-deploy) |

Everything content-related lives in `data/profile.ts` or `public/`. You should rarely need to touch `app/page.tsx` unless you're changing layout/behavior, not content.

---

## Adding a new project

Open `data/profile.ts` and add an entry to the `projects` array:

```ts
{ id: 'my-new-project', title: 'My New Project', description: 'What it does, in a sentence or two.', tags: ['Next.js', 'Firebase'], image: previewImage('https://my-new-project.vercel.app'), likes: 0, comments: 0, live: 'https://my-new-project.vercel.app' }
```

- `id` — unique, lowercase, no spaces (used as the Firestore document key for its hearts/comments — don't reuse an old id for a different project, or it'll inherit that project's like/comment count).
- `image` — leave as `previewImage('<live url>')`. This auto-generates a live screenshot of the deployed site (via a free screenshot service) — you don't need to upload an image yourself.
- `tags` — only list technologies you've actually confirmed; leave `[]` if unsure. Don't invent stack details.
- `repo` — optional. Omit it entirely if you don't want a GitHub icon shown on the card (that's what all 5 current projects do, since none have a linked repo yet).
- `likes` / `comments` — always start these at `0` for a new project. Real counts come from Firestore once people interact with it; the number here is just the starting seed.

No other file needs to change. The project will show up in the feed automatically, and the "More projects coming soon" placeholder tile always stays at the end of the grid.

---

## Adding photos

The Photos section (`data/profile.ts` → `photos`) is currently empty on purpose — it shows a "No photos yet" message until you add some.

To add photos:

```ts
export const photos: string[] = [
  '/my-photo-1.jpg',
  '/my-photo-2.jpg',
]
```

Two options for the image source:
1. **Local file (recommended):** drop the image into `public/` (e.g. `public/my-photo-1.jpg`) and reference it as `/my-photo-1.jpg` (leading slash, no `public/` prefix).
2. **Hosted URL:** paste a direct image URL (like the old Unsplash links used to be) — works the same way.

That's it — the gallery grid and lightbox already handle any number of photos with no other code changes.

---

## Updating the chatbot (PeterAI)

The chatbot reads `public/peterai-faq.csv` at runtime (not baked into the code), so you can edit it directly without touching any TypeScript.

**Format:** `id,category,question,answer` — one row per Q&A pair.

- **`id`** — just needs to be unique; sequential numbers are fine.
- **`category`** — a single word grouping similar questions (e.g. `skills`, `projects`, `contact`). This matters more than it looks: the chatbot gives a strong bonus when your question text matches an entry's category, which helps it pick the right answer when multiple rows share a keyword.
- **`question`** — the "canonical" phrasing. Doesn't need to be exact — the bot matches by shared keywords, not exact text, so a visitor asking it differently will still often find this row.
- **`answer`** — plain text. **Only include facts you can verify** — the bot has no way to tell truth from fabrication, it just repeats what's in this file.

**CSV quoting rule (important):** if an answer contains a comma, wrap the whole field in double quotes: `"like this, with a comma"`. If an answer needs a literal quote mark inside it, double it up: `"click ""Get in touch with me"" above"`. Getting this wrong can silently break parsing for that row (or worse, merge it into the next row) — when in doubt, avoid literal quote marks in answers.

**Adding a new Q&A:** just add a new row. No rebuild step, no code change — refresh the page and it's live (the browser caches the file per session, so a hard refresh picks up edits).

**If the bot ever gives a wrong or hallucinated-feeling answer:** it's almost always because the matching logic in `lib/faq.ts` needs a tweak (stopwords, synonyms, or scoring), not the CSV. Common fix pattern: if visitors keep phrasing something a certain way and it's not landing on the right row, add that word as a synonym in the `SYNONYMS` map in `lib/faq.ts`, or add a rephrased duplicate question to the CSV covering that phrasing — either works, but adding a synonym in code helps every question in that theme, not just one row.

**Fallback message:** if the bot doesn't find a good enough match, it says "I currently do not have information regarding this — best if you contact Peter by clicking the 'Get in touch with me' button." That's hardcoded as `FALLBACK_ANSWER` in `lib/faq.ts` if you ever want to change the wording.

---

## Changing your profile photo / cover photo

Just replace the files in `public/`, keeping the same filenames:
- Profile photo → `public/pfp.jpg`
- Cover photo → `public/cover.jpg`
- Chatbot avatar → `public/avatar.jpg`

Since the code references them by path (`/pfp.jpg`, `/cover.jpg`, `/avatar.jpg`), overwriting the file is enough — no code change needed. If you want to use a different filename or format (e.g. `.png`), you'll need to update the `src="..."` references in `app/page.tsx` (search for `pfp.jpg`, `cover.jpg`, `avatar.jpg`).

---

## Changing your contact links (Facebook, Gmail, LinkedIn, GitHub, email)

These live in two places — update both when a link changes:

1. **`data/profile.ts`**
   - `profile.email` — your canonical email address.
   - `conversations` array — the Facebook / Gmail / LinkedIn entries shown in the "Get in touch with me" panel. Edit the `href` field for each.
2. **`app/page.tsx`** — GitHub is hardcoded in two spots (search for `github.com/frankenstein-denied`): the GitHub icon button in the profile header, and the "GitHub" text link in the Intro card footer.

If you add a brand-new channel (e.g. a Discord or X/Twitter link), add it to the `conversations` array in `data/profile.ts` — the panel renders whatever's in that list, but a new `label` needs a matching icon added to the `channelIcons` object near the top of `app/page.tsx`.

---

## Firestore data (hearts & comments)

This is the only server-side state in the app — everything else is static content in `data/profile.ts`. Two Firestore collections:

- `hearts/{projectId}` — one document per project, `{ count: number }`.
- `comments` — one document per comment, `{ projectId, name, text, createdAt }`.

You never need to seed these manually — they're created automatically the first time someone hearts a project or leaves a comment. If you ever rename or delete a project's `id` in `data/profile.ts`, its old Firestore data becomes orphaned (harmless, just unused) rather than transferring to the new id.

If you ever change what's allowed to be written (e.g. add a new field), update `firestore.rules` in this repo **and** paste the updated rules into the Firebase Console (Firestore → Rules → Publish) — editing the file here does nothing on its own.

---

## Environment variables

`.env.local` (not committed to git) holds the Firebase web config:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

These aren't secret in the traditional sense (Firebase's security model relies on Firestore Rules, not hiding this config), but the file stays out of git as good practice. If you deploy to Vercel, add these same variables in the Vercel project's Environment Variables settings — the build will fail without them.

---

## Commands

```
npm run dev          # local dev server
npm run build         # production build
npx tsc --noEmit       # typecheck
```

There's no test suite or linter configured yet — `npx tsc --noEmit` is the main safety check before committing.
