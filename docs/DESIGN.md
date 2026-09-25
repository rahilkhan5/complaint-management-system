---
name: Complaint Desk
description: Every complaint is a numbered case file, and its status is the sticker on the tab.
colors:
  ground: "oklch(97.6% 0.005 255)"
  surface: "oklch(99.6% 0.002 255)"
  surface-2: "oklch(95.4% 0.009 255)"
  line: "oklch(89.5% 0.012 258)"
  line-strong: "oklch(80% 0.018 258)"
  control-line: "oklch(60% 0.02 258)"
  ink: "oklch(23% 0.05 262)"
  ink-2: "oklch(39% 0.035 262)"
  ink-3: "oklch(48% 0.03 262)"
  board: "oklch(38% 0.085 258)"
  board-strong: "oklch(31% 0.085 258)"
  board-soft: "oklch(93.5% 0.025 258)"
  focus: "oklch(56% 0.17 255)"
  open: "oklch(55% 0.15 255)"
  open-soft: "oklch(94.5% 0.03 255)"
  open-ink: "oklch(41% 0.13 255)"
  progress: "oklch(77% 0.15 75)"
  progress-soft: "oklch(95.5% 0.045 82)"
  progress-ink: "oklch(45% 0.1 62)"
  resolved: "oklch(58% 0.13 155)"
  resolved-soft: "oklch(95% 0.035 155)"
  resolved-ink: "oklch(40% 0.1 155)"
  closed: "oklch(64% 0.02 260)"
  closed-soft: "oklch(94.5% 0.006 260)"
  closed-ink: "oklch(42% 0.02 260)"
  danger: "oklch(50% 0.18 27)"
  danger-soft: "oklch(95.5% 0.03 27)"
typography:
  case-number:
    fontFamily: "Atkinson Hyperlegible Mono Variable, ui-monospace, Cascadia Mono, monospace"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1
  caption:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.3
  index-label:
    fontFamily: "Atkinson Hyperlegible Mono Variable, ui-monospace, Cascadia Mono, monospace"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.3
    fontFeature: "tnum"
rounded:
  sm: "6px"
  md: "10px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "64px"
components:
  button-primary:
    backgroundColor: "{colors.board}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.board-strong}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  button-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  button-danger-hover:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
    height: "44px"
  sticker-open:
    backgroundColor: "{colors.open-soft}"
    textColor: "{colors.open-ink}"
    rounded: "{rounded.pill}"
    padding: "3px 10px 3px 8px"
  sticker-in-progress:
    backgroundColor: "{colors.progress-soft}"
    textColor: "{colors.progress-ink}"
    rounded: "{rounded.pill}"
    padding: "3px 10px 3px 8px"
  sticker-resolved:
    backgroundColor: "{colors.resolved-soft}"
    textColor: "{colors.resolved-ink}"
    rounded: "{rounded.pill}"
    padding: "3px 10px 3px 8px"
  sticker-closed:
    backgroundColor: "{colors.closed-soft}"
    textColor: "{colors.closed-ink}"
    rounded: "{rounded.pill}"
    padding: "3px 10px 3px 8px"
  file-tab:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    typography: "{typography.index-label}"
    padding: "5px 12px 4px"
  file-body:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "24px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "44px"
  nav-link-current:
    backgroundColor: "{colors.board-soft}"
    textColor: "{colors.board-strong}"
---

# Design System: Complaint Desk

This file describes the Complaint Desk React client as it was shipped. Every value here comes from `client/src/styles/*.css` and the components in `client/src/components`. If the code and this file ever disagree, check the code first, then update this file.

## Overview

**Creative North Star: "The Case File"**

Every complaint is a numbered paper file in a filing cabinet. The case number is typed on the file tab. The status is a round colored sticker stuck on the file, with its word printed next to it. When you open a file, you see its full stamped history as a timeline. The rest of the app is quiet: a cool white desk, deep navy ink, and one pressboard blue for actions and selected things.

The feel is a calm, well run service desk. People often arrive upset because something is broken, so the screens are predictable, the words are plain, and there is one obvious next action on each screen. Residents use it on phones, so the resident flow is phone first with a fixed bottom action bar. Staff use it all day on desktop, so their screens are denser, with a status index on the left and a table style file list on the right.

The build refuses the generic admin template (a row of four stat cards over a grey table), old government portals (dense grey tables, everything the same weight), and over colored, cartoonish apps. Color is rationed so that status stands out.

**Key Characteristics:**
- Cool white ground, navy ink, pressboard blue for actions and selection.
- Four status colors, used only for status, always paired with the status word.
- Case numbers and counts in a monospace "typed label" face; everything else in one sans.
- Flat surfaces with a whisper of shadow; the file you point at lifts.
- Two corner sizes (6px and 10px) plus full pills for stickers and chips.
- Short, soft motion; one "rubber stamp" moment on the status sticker of an open file.

## Colors

A cool, low chroma paper and navy palette where the only strong colors are the four status stickers.

All colors are OKLCH custom properties on `:root` in `client/src/styles/tokens.css`. The names below match the frontmatter keys and the CSS variables.

### Primary
- **Pressboard Blue** (board): primary buttons, the selected segment in the priority picker, the current status in the phone index, category bars, the login side panel, links and the text caret. This is the color of the file boards.
- **Deep Pressboard** (board-strong): hover state of primary buttons and links, text of the current nav item and avatar initials.
- **Pale Pressboard** (board-soft): background of the current nav item, the current index entry on desktop, avatars, info alerts, text selection and the demo account button hover.
- **Focus Blue** (focus): the keyboard focus outline and the input focus ring. It is brighter than board on purpose so focus is easy to spot.

### Status (the sticker set)
Each status has three tokens: a fill for the dot and tab edge, a soft background, and an ink for readable text on that background.
- **Open Blue** (open, open-soft, open-ink): a new complaint nobody has finished.
- **Work Amber** (progress, progress-soft, progress-ink): an agent is working on it. The amber fill is light, so text on amber always uses progress-ink, never the fill.
- **Done Green** (resolved, resolved-soft, resolved-ink): the agent marked it fixed. The soft and ink pair is also used for success alerts.
- **Archive Slate** (closed, closed-soft, closed-ink): the resident confirmed, or the file was closed.

### Alert
- **Warning Red** (danger, danger-soft): error alerts, field error text, the invalid input border, danger buttons, the "High priority" tag, and things an admin removed (the "Removed" index dot, the removed timeline icon, the original text of a removed comment and the remove confirm box). Nothing else is red.

### Neutral
- **Cool Paper** (ground): the page background.
- **White Sheet** (surface): cards, file bodies, panels, inputs, secondary buttons, the header and action bar (at 92 to 94% opacity with blur).
- **Grey Sheet** (surface-2): hover backgrounds, timeline notes, skeleton base, the staff tabs track, the category bar track.
- **Hairline** (line): default borders and dividers.
- **Firm Line** (line-strong): timeline spine, hovered file border, dashed empty state border.
- **Control Line** (control-line): borders of inputs, selects, the segmented picker and secondary buttons. It is dark enough (about 3:1 on white) that people can see where a field starts and ends (WCAG 1.4.11).
- **Navy Ink** (ink): headings and main text.
- **Soft Ink** (ink-2): secondary text such as meta lines, summaries and nav links.
- **Faint Ink** (ink-3): hints, dates, column heads, placeholders. Still meets 4.5:1 on ground and surface.

### Named Rules
**The Sticker Owns Color Rule.** The four status hues appear only where a status is shown: stickers, the top edge of a file tab, index dots and status icons in the timeline. Buttons, headings and backgrounds never borrow a status hue.

**The Word Plus Dot Rule.** A status color is never shown alone. Every sticker, index entry and timeline status item carries the status word ("Open", "In progress", "Resolved", "Closed").

**The One Red Rule.** Red means something is wrong or urgent: errors, destructive actions, high priority. It is never decoration.

## Typography

**Body Font:** Atkinson Hyperlegible Next Variable (with system-ui, Segoe UI, sans-serif)
**Label/Mono Font:** Atkinson Hyperlegible Mono Variable (with ui-monospace, Cascadia Mono, monospace)

Both are loaded from `@fontsource-variable` packages. There is no separate display face.

**Character:** One very readable sans for all words, built for low vision readers, plus its matching mono that looks like a typed index label on a file. Both have a slashed zero, so case numbers like CMS-0010 never confuse 0 and O.

### Scale
The size tokens are 0.8125rem (xs), 0.875rem (sm), 1rem (md), 1.125rem (lg), 1.375rem (xl), 1.75rem (2xl) and 2.25rem (3xl). All headings are weight 700 with line height 1.2 and balanced wrapping.

### Hierarchy
- **Case number** (mono 700, 2.25rem on phones, 2.75rem from 640px, line height 1, tracking -0.02em, tabular figures): the big number at the top of an open complaint. The 404 code uses the same style in faint ink.
- **Headline** (700, 1.75rem, tracking -0.015em): page titles such as "All complaints", the login title and the login side panel title. The complaint title on the detail page is 1.375rem on phones and 1.75rem from 640px.
- **Title** (700, 1.125rem): section titles on the detail page and empty state titles. Panel titles and file titles use 1rem at 700.
- **Body** (400, 1rem, line height 1.5): descriptions and paragraphs. Long text is capped at 60 to 70 characters wide (page summary 60ch, description 70ch).
- **Label** (600, 0.875rem): buttons, nav links, field labels, index entries, staff tabs.
- **Caption** (0.8125rem): dates, hints, column heads, sticker text (700), field errors (600).
- **Index label** (mono 600, 0.8125rem, tabular figures): case numbers on file tabs and counts in the status index. Trend numbers use mono 700 at 1.125rem.

### Named Rules
**The Typed Index Rule.** The mono face is only for case numbers, counts and figures that need to line up. Words are always in the sans.

**The Sentence Case Rule.** Every label, heading, column head and button is in sentence case. The build has no uppercase labels and no wide letter spacing. Tracking is only ever slightly tightened on large headings.

## Layout

The page sits in one centered container, max width 1200px, with 16px side padding on phones and 24px from 640px. A sticky 60px header runs on top. Main content has 24px top padding on phones, 32px from 640px, and 64px at the bottom.

Spacing uses an 8 step scale: 4, 8, 12, 16, 24, 32, 48, 64px. Items inside a card use 12 or 16px gaps. Sections and page blocks use 24 or 32px. Field label to input is 6px.

### Breakpoints
All media queries are mobile first (`min-width`). There are four breakpoints:

- **640px (small tablet):** container padding grows to 24px. The logo text, and nav links marked desk only, appear. The fixed bottom action bar ("File a complaint") hides, because the main action now fits in the page head. Two column form rows turn on. Sheets get 32px padding. The case number grows to 2.75rem.
- **860px (desk view):** the complaints page becomes a two column desk: a 15rem sticky status index on the left and the file list on the right. The index turns from a horizontal scrolling chip row into a vertical list with counts on the right, plus the "This week" trends and category bars. The file list turns into a table style layout with a column head row (Complaint, Category, Status, Filed). The header shows the user name, role and the "Log out" word. The staff roster shows its full table.
- **960px (wide):** login and register split in two halves, with a pressboard blue side panel showing a small tilted stack of files. The complaint detail page gets a 20rem sticky side column for next step actions and people. Below 960px that side column moves above the main content, so the next action is seen first.
- **1040px (toolbar):** the search box, category filter (12rem) and priority filter (10rem) sit in one row. Below this, search takes the full width and the two filters share the next row.

### Layers
Sticky header and action bar use z-index 10, dropdowns 20, the skip link and toasts 40.

## Elevation & Depth

The system is almost flat. Depth comes from white sheets on a slightly darker cool ground, thin borders, and a very soft resting shadow. A bigger shadow appears only when you point at or focus something that can be opened.

### Shadow Vocabulary
- **Rest** (`box-shadow: 0 1px 2px oklch(23% 0.05 262 / 0.05)`): every file body, panel, sheet, roster and the selected staff tab.
- **Lift** (`box-shadow: 0 2px 4px oklch(23% 0.05 262 / 0.06), 0 12px 28px -10px oklch(23% 0.05 262 / 0.22)`): a file in the list while hovered or keyboard focused.
- **Tab edge** (`box-shadow: inset 0 3px 0 var(--status)`): the 3px colored strip across the top of a file tab. This is how status color reaches the tab.
- **Sticker halo** (`box-shadow: 0 0 0 2px` status fill at 22%): the soft ring around a sticker dot.

The header and the phone action bar are translucent white with an 8px blur, so content scrolling under them stays faintly visible.

### Named Rules
**The Lift On Point Rule.** Surfaces rest flat. When you hover or focus a file, it rises 2px, takes the lift shadow and a firmer border. Only mouse hover fades the other files, and only to 80% opacity, so their text stays readable. Keyboard focus never fades the other files, and on touch screens nothing fades.

## Shapes

Corners are gently rounded with two sizes. Small corners (6px) are for controls: buttons, inputs, selects, alerts, nav links, the file tab top corners, the segmented picker and notes. Medium corners (10px) are for containers: file bodies, panels, sheets, the roster and the empty state. Stickers, the phone index chips, role chips and bar tracks are full pills (999px). Avatars, sticker dots, timeline icons and the empty state icon are circles.

The file shape is the signature silhouette. The tab sits on top of the body, 16px in from the left, with rounded top corners only. The body has a square top left corner where the tab joins it, and 10px on the other three corners, so tab and body read as one folder.

Borders are always 1px. Dashed borders appear only on the empty state. The only rotation in the app is the small tilt (between -1.5 and 1 degree) of the decorative file stack on the login side panel.

## Components

### Buttons
Solid, compact and clear. Every button is at least 44px tall.
- **Shape:** small corners (6px), 16px side padding, label type (600, 0.875rem), optional 16px icon with an 8px gap.
- **Primary:** pressboard blue with white text. Hover goes to deep pressboard. Use one primary button per area.
- **Secondary:** white with a firm line border and navy text. Hover turns the background grey sheet.
- **Ghost:** no background, soft ink text. Hover shows grey sheet. Used for Log out and quiet actions.
- **Danger:** white with a red tinted border and red text. Hover shows the pale red background.
- **Sizes:** small is 36px tall with 12px padding on screens from 640px, and 44px on phones so every tap target stays at least 44px. Block fills the width. Icon only is a 44px square.
- **States:** pressing moves the button down 1px. Disabled buttons are at 55% opacity with a not allowed cursor. While a request runs, a 16px spinning ring replaces or joins the label.

### Status Sticker (signature)
The sticker is how status reads at a glance.
- **Structure:** a pill with the status soft color as background, the status ink as text (0.8125rem, 700), and a 9px round dot in the status fill with a soft halo. The word is always printed.
- **How color is set:** any element with `data-status="open | in_progress | resolved | closed"` receives three local variables (status fill, soft and ink). The sticker, file tab edge, index dot and timeline icon all read those, so one attribute colors everything for that file. `data-status="removed"` is not a status, but it sets the same three variables to Warning Red for the "Removed" index entry and the removed timeline icon.
- **Tinted borders** mix a color into the hairline in oklab, not oklch. In oklch, red swings through purple on its way to the blue grey line.
- **Large size:** 1rem text, 12px dot, 6px 16px padding. Used beside the case number on the detail page.
- **Stamp moment:** the large sticker on the detail page plays a 420ms stamp animation (starts at 135% size and tilted, lands slightly small, then settles). It is keyed to the status, so it plays when the file opens and again every time the status changes.

### File Tab List (signature)
Each complaint in a list is a folder.
- **Tab:** white, 1px hairline border with no bottom, small top corners, a 10px round status dot, then the case number as a mono index label in soft ink, and a 3px status colored strip along its top edge. Below 860px the case number grows to 1rem so it reads well on a phone.
- **Body:** white, hairline border, 16px padding, rest shadow. Inside: the title (1rem, 700), a meta line with location and category in soft ink, a "High priority" tag when needed, then the sticker, the date and a "who" line.
- **Who line:** changes with the role. Agents see who filed it; residents see the agent or "Waiting for an agent"; admins see the agent or "Not assigned". A resolved or closed file with no agent says "No agent".
- **Phone:** files stack with 12px between them; sticker and date share a wrapping foot row.
- **From 860px:** the body becomes a four column grid (title, 9rem category, 8rem status, 8.5rem filed) under a caption sized column head row. The head row is hidden from screen readers because each file already has its own labels.
- **Interaction:** see The Lift On Point Rule. The whole file is one link, with its focus outline offset by 3px.

### Status Index
The filter drawer: "All", one entry per status, and "Needs an agent" for admins, each with a dot and a mono count.
- **Phone:** a horizontal chip row that scrolls sideways with a hidden scrollbar. The current chip is solid pressboard with white text.
- **From 860px:** a vertical list with no borders. The current entry uses pale pressboard with deep pressboard text. Under it sit "This week" trends (mono numbers plus a trend icon and words like "4 more than last week") and, for admins, category bars that grow in from the left.

### Cards and Containers
- **Panel:** white, hairline border, medium corners, 24px padding, rest shadow. Used for the detail page side column ("Next step", "People").
- **Sheet:** same look with 24px 16px padding on phones and 32px from 640px. Used for the new complaint form.
- **Roster:** one white container with rows split by hairlines. From 860px it has a column head row.
- **Empty state:** centered, 64px vertical padding, dashed firm line border, a 48px circle icon, a title, one short line of text (max 42ch) and an optional action.

### Inputs and Fields
- **Style:** white, 1px firm line border, small corners, at least 44px tall, 10px 12px padding, body size text. Textareas start at 128px and resize vertically.
- **Label:** above the input, label type in navy. Optional fields add "(optional)" in faint ink. Hints and errors sit below in caption size.
- **Focus:** the border turns focus blue with a 3px focus blue ring at 22%.
- **Error:** `aria-invalid="true"` turns the border red, and the error text below is red and 600.
- **Select:** native select with a custom chevron on the right.
- **Segmented picker:** used for priority. Three equal options in one bordered box. The checked option is solid pressboard with white text. Keyboard focus shows an inset outline.

### Navigation
- **Header:** sticky, 60px, translucent white with blur and a hairline bottom border. Logo on the left (a navy folder with an amber sticker), then nav links, then the user block on the right.
- **Nav link:** 44px tall, label type in soft ink, small corners. Hover shows grey sheet. The current page (`aria-current="page"`) uses pale pressboard with deep pressboard text.
- **Phone:** logo text, desk only links, the user name and the "Log out" word hide. A 36px avatar with initials stays.
- **Bottom action bar:** on phones only, residents get a fixed bar with the full width "File a complaint" button, respecting the safe area inset.

### Timeline
The stamped history of a complaint.
- A 1px firm line spine runs down the left. Each event has a 32px round icon. Status events take the status soft background, a tinted border and the status ink.
- Each item shows one line of text with the actor in bold, a role chip (pill, grey sheet), and a faint caption time.
- Notes sit in a grey sheet box; comments sit in a white box with a hairline border.
- **Edited:** a pencil icon and "edited the title and location", listing the fields that changed.
- **Removed comment:** a dashed icon and a dashed box with "This comment was removed by an admin." in italic. Admins also see who removed it and the original text in a pale red box.
- **Admin tools:** a small ghost "Remove comment" button under each comment. It opens a pale red confirm box with Cancel and a danger Remove button, which gets focus.

### Alerts, Priority and Other Small Parts
- **Alert:** small corners, 12px 16px padding, icon on the left. Error uses danger soft, success uses resolved soft, info uses pale pressboard, each with a 25 to 35% tinted border.
- **Priority tag:** caption size, 600. Low is faint ink, medium is soft ink, high is red with a warning triangle icon. The word "priority" is always printed.
- **Skeleton:** grey sheet to hairline shimmer (1.4s loop) in the same shape as the real file.
- **Staff tabs:** a grey sheet track with 44px tabs. The selected tab turns white with the rest shadow.

### Motion
- **Easing:** one ease out curve, `cubic-bezier(0.16, 1, 0.3, 1)`, for everything.
- **Durations:** 150ms for color and border changes on controls. 220ms for file lift and fade, and for panels that reveal (they slide in 4px while fading in).
- **Special moments:** stamp 420ms, category bars grow 600ms, spinner 700ms per turn.
- **Reduced motion:** when the user asks for reduced motion, all animations and transitions are cut to 1ms and play once.

### Accessibility
The target is WCAG 2.2 AA.
- Text colors meet 4.5:1 on ground and surface. Faint ink is the lightest allowed text color.
- Status is never color only (see The Word Plus Dot Rule). Priority always prints its word.
- Every interactive element shows a 2px focus blue outline, 2px offset. Inputs use the border plus ring instead.
- Buttons, inputs and the segmented picker are at least 44px tall on every screen.
- Every signed in page has a skip link to the main content. Decorative icons and the column head rows are `aria-hidden`.
- Fields have real labels, `aria-invalid`, and error text next to the field. Radio groups use a fieldset with a legend.
- Status changes are announced through a live region that takes no space while empty.
- Current nav and filter items use `aria-current`; the staff tabs use `aria-selected`.
- Reduced motion is respected everywhere.

## Do's and Don'ts

### Do:
- **Do** set `data-status` on the outer element of anything that belongs to one complaint, and let the sticker, tab edge and icon read the status variables from it.
- **Do** print the status word next to every status color.
- **Do** use the mono face with tabular figures for case numbers, counts and numbers that line up.
- **Do** keep one pressboard blue primary button per area, and keep all buttons and fields at least 44px tall.
- **Do** use the rest shadow for sheets and panels, and save the lift shadow for a file being pointed at or focused.
- **Do** use the two corner sizes: 6px for controls, 10px for containers, full pills for stickers and chips.
- **Do** take every color, size, space and timing from `tokens.css`.
- **Do** write labels and buttons in plain sentence case English.

### Don't:
- **Don't** use a status color (blue, amber, green, slate) for anything that is not a complaint status.
- **Don't** put white or navy text on the amber fill. Use progress ink on progress soft.
- **Don't** use red for anything except errors, destructive actions and high priority.
- **Don't** add uppercase labels, small tracked out "eyebrow" labels above headings, or a row of stat cards at the top of a page.
- **Don't** add hard offset shadows or gradient fills to cards, panels or buttons.
- **Don't** add a second sans or a display face. Atkinson Hyperlegible Next and Mono are the whole type system.
- **Don't** use the stamp animation anywhere except the large status sticker on the detail page.
