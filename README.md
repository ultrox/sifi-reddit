# SIFI Reddit

Classic Reddit made usable on an Android phone. A personal Manifest V3 fork of
[Old Reddit Redirect](https://github.com/tom-james-watson/old-reddit-redirect),
built and tested with [Titanium Browser](https://github.com/jqssun/android-titanium-browser).

## What changes

- Classic Reddit, with the original old/new layout toggle.
- Dark mode by default, with a remembered light/dark toggle in the account header.
- A mobile viewport and readable, single-column posts and comments.
- Subreddit theme styles blocked on phones, keeping the layout consistent.
- Videos that fit the screen and reserve their space before loading.
- Compact action links in one row and full-width thread notices.
- A comment editor that stays inside the screen as you type.

The mobile changes apply to classic Reddit on devices up to 800px wide.
Desktop and modern Reddit retain their layout. Native scrolling, comment nesting,
forms, voting, navigation, and pagination remain Reddit's own.

## Install in Titanium

1. Build or download an extension ZIP.
2. In Titanium, open **Extensions → Titanium → Details → Extension options**.
3. Under **Extension marketplaces → Install from file**, select the ZIP or CRX.
4. Confirm **Keep** and **Add extension**.
5. Disable the original Old Reddit Redirect extension to avoid conflicts.
6. Reload Reddit.

Titanium signs ZIPs with a fresh identity. For repeated updates to the same
installation, use CRX packages signed with the same private key.

## Develop and build

Requires Node.js 22+ and Python 3. No npm dependencies or browser compilation.

```sh
npm run check
npm run build
```

The ZIP is written to `dist/sifi-reddit.zip`. To test an unpacked build, enable
Developer mode at `chrome://extensions`, choose **Load unpacked**, and select the
`extension` folder. Android uses a folder picker and may import a private copy;
reloading changes from the original folder is not guaranteed.

For an installable update with a stable identity:

```sh
SIFI_REDDIT_KEY=/absolute/path/to/reddit.pem npm run build:crx
```

Alternatively, place the existing key at `.keys/reddit.pem`. The signed CRX and
its extension ID are written to `dist/`. Keep the private key backed up locally:
losing it means losing the ability to update that installation under the same ID.
Keys and build output are ignored by Git. GitHub checks produce an unsigned ZIP
and never need the signing key.

## Permissions and validation

The inherited redirect uses Reddit cookies and declarative request rules, with
access to Reddit and its image hosts. SIFI's mobile changes add no permissions
and send no data to a separate service.

Verified on a Pixel 10 Pro: feed and comment layout, video containment and stable
load dimensions, Zurich and AbsoluteUnits theme blocking, compact comment links,
and reply-editor width constraints. These checks cover the tested pages;
third-party embeds and future Reddit changes may still need adjustments.

## License and upstream

MIT. Original code by Tom Watson; copyright and license retained in [LICENSE](LICENSE).
See [UPSTREAM.md](UPSTREAM.md) for the source revision and local changes.
