# Shop Tycoon Navigation Redesign: Design

## Problem

The management side of the game is hard to navigate. Everything lives two or more levels under "The Shop" (Floor -> The Shop -> Training -> Technicians -> a tech), there is no persistent navigation, and you reach anything by drilling in and backing out one screen at a time. Player feedback: "too much clicking and it's hard to find what screen I want." The core job loop (Board -> Meet -> Quote -> Schedule -> Run Shift -> Collect) is fine and stays unchanged.

## Decision

Add a **persistent bottom tab bar** for the management side. Any major area is one tap from anywhere in the hub world. The job loop and modal beats keep their own contextual buttons and hide the tabs.

## The five tabs

| Tab | Root screen | Contents |
|---|---|---|
| **FLOOR** | `floor` | Bays, season/standing, Chief tip, the big RUN A SHIFT action. Tapping a bay still launches the job loop. |
| **CREW** | `crew` (new hub) | Technicians (skills, credential ladder, certify), Recruit/hire, AEA Courses, Apprenticeship. |
| **DEALERS** | `dealers` | OEM dealers (buy/upgrade tiers) and OEM factory training (moved here from Training). |
| **SHOP** | `shop` | Business dashboard (cash/rep/rating/culture/charisma stats), labor rate, shop Upgrade, Drum Up Business. |
| **INFO** | `info` (new hub) | Customer Book, Reviews (the scoreboard), Shop Manual. |

Rationale for groupings: CREW is "your people," DEALERS is "the makers," SHOP is "run the business," INFO is "reference." Drum Up Business sits in SHOP (a marketing/business action); inbound work is still reached by tapping a bay on the FLOOR. OEM factory training moves to DEALERS because it requires holding a dealership and advances dealer tiers.

## Tabbed screens vs. flow screens

A screen is either part of the **hub world** (tab bar visible) or a **focused flow** (tab bar hidden, contextual actions only).

- **Tab bar visible** (each maps to its owning tab for the active highlight): `floor` (FLOOR); `crew`, `train`, `traintech`, `courses`, `recruit`, `negotiate`, `apprentice` (CREW); `dealers`, `oemcert` (DEALERS); `shop`, `hustle`, `hustleResult` (SHOP); `info`, `book`, `reviews`, `reviewRespond`, `manual` (INFO).
- **Tab bar hidden** (focused flow / modal beat): the job loop (`board`, `meet`, `quote`, `assign`, `baydetail`, `overtime`, `squawk`, `review`), and all interruptions (`title`, `intro`, `eraEvent`, `milestone`, `aeaShow`, `fallconf`, `event`, `result`, `personnel`, `credEarned`, `graduation`, `victory`, `gameover`, `custReview`). These already carry their own CONTINUE/BACK actions.

Within a tab, drilling is at most one level (tap a tech, tap a maker, respond to a review) and keeps a BACK that returns to the tab root; the tabs stay visible so you can also jump straight to another area.

## Shell architecture (single file, vanilla JS)

- A `TAB_OF` map from screen key to tab id (`floor|crew|dealers|shop|info`), and a `TABBED` set (or derive from `TAB_OF` having an entry). A screen with no `TAB_OF` entry is a flow screen (no tabs).
- A `renderTabBar()` that returns the tab bar HTML with the active tab highlighted, or empty string for flow screens. Tabs are buttons (touch target >= 48px) calling `go(tabRoot)`.
- `render()` injects the tab bar into a fixed bottom element. Reconcile with the existing fixed `#bar` (contextual actions): on tabbed screens the tab bar is the bottom-most element; any primary action (e.g. RUN A SHIFT on the floor) moves into the screen content rather than the bottom bar, so we never stack two bars. Flow screens keep `#bar` exactly as today.
- Bottom padding on `.app` adjusts so content never hides behind whichever bar is present.

## Screen reorganization

- New `SCREENS.crew`: a hub listing technicians with their state (credential, currency, skills) and quick links to Recruit, Courses, Apprenticeship. Reuses the existing `train`/`traintech`/`courses`/`recruit`/`apprentice` screens as its children (kept, re-parented).
- `SCREENS.shop`: strip the nav cards that became tabs (Training, Dealers, Recruit, Manual, Book). Keep the dashboard stats, labor rate, Upgrade, and add Drum Up Business entry.
- New `SCREENS.info`: a small hub linking Book, Reviews, Manual.
- `oemcert` re-parented under DEALERS (a link on the dealers screen).
- The old "THE SHOP" button on the floor is removed (the tab bar replaces it). RUN A SHIFT becomes a prominent in-content action on the floor.

## Testing

- Self-tests (`check`): `TAB_OF('dealers')==='dealers'`, `TAB_OF('quote')` is undefined (flow screen, no tabs), `TAB_OF('reviews')==='info'`, `TAB_OF('crew')==='crew'`; and a check that every tab root maps to itself.
- Render-and-look at >=480px (headless crops at 375): the floor with tabs, each tab root, and one tab during a job-loop screen to confirm tabs are hidden there.
- Full self-test suite stays green.

## Constraints

Single self-contained `index.html`, vanilla JS, no build step. Mobile-first, touch targets >= 44px, no hover-only controls. No em dashes in copy. Tab labels short enough to fit five across at 375px (pixel font), with responsive shrink reusing the existing media-query pattern.
