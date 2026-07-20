/**
 * THE LIBRARY - the board's settings panel.
 *
 * A gear, fixed top-right. Tap it and the Library opens: every tile on the
 * board, WHAT POWERS EACH ONE, and a one-tap remove / re-add. It is the map of
 * the board - the thing that answers "where does this number come from" without
 * opening a tile.
 *
 * Ported from Vitality's app/app/LibraryOverlay.tsx (React) to plain JS, because
 * the seed is one html file and has no React to mount a component into. Same
 * shape, same words, no framework.
 *
 * IT INJECTS ITSELF. The gear, the styles and the overlay are all built here, so
 * adding the Library to a board is ONE line in index.html:
 *   <script src="lib/tiles/library.js"></script>
 * No markup to paste, nothing to wire. Remove that line and the board is exactly
 * the bare seed again.
 *
 * THE STATE. window.TILES (registry.js) is the canonical list of tiles that
 * EXIST. The Library adds one thin runtime layer on top - v:board = { hidden }
 * - for what is currently ON the board vs tucked into the library, so a person
 * can hide a tile without editing a repo file. host.js reads the same key at
 * mount and skips hidden tiles; toggling one here calls VitalityHost.remount()
 * so the board redraws live. The registry stays the source of truth; this is
 * just on/off.
 */
;(function () {
  'use strict'

  // ── Board state. One key, read the same way host.js reads it.
  var KEY = 'v:board'
  function state() {
    try {
      var b = JSON.parse(window.localStorage.getItem(KEY) || '{}')
      return b && typeof b === 'object' ? b : {}
    } catch (e) {
      return {}
    }
  }
  function hiddenList() {
    var h = state().hidden
    return Array.isArray(h) ? h : []
  }
  function writeHidden(list) {
    var b = state()
    b.hidden = list
    try {
      window.localStorage.setItem(KEY, JSON.stringify(b))
    } catch (e) {
      /* private mode / quota: the board still works, the choice just won't persist */
    }
  }

  // ── What powers each tile. The known Vitality ids get their real source line;
  //    a tile that declares a `data:` feed updates itself; everything else is a
  //    tile you fill in by hand. This is the whole point of the panel: the
  //    honest answer to "where does this come from".
  var KNOWN = {
    train: 'you fill it in',
    fuel: 'you fill it in',
    vitals: 'WHOOP, or you fill it in',
    peak: 'built from your Vitals',
    brand: 'TikTok · YouTube · Instagram (your keys)',
    finance: 'Finnhub (your API key)'
  }
  function sourceLine(t) {
    if (KNOWN[t.id]) return KNOWN[t.id]
    if (t.data) return 'auto · updates itself'
    return 'you fill it in'
  }

  function esc(s) {
    // Escapes quotes too: tile ids/names land inside double-quoted attributes
    // (data-id="...") as well as in text, and a stray quote would break out.
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
  function registry() {
    return Array.isArray(window.TILES) ? window.TILES.filter(function (t) { return t && t.id }) : []
  }

  // ── Styles. One block, guarded, scoped under .vlib*. Colours and easing come
  //    from the seed's :root tokens so this matches the board it lands on.
  function injectStyles() {
    if (document.getElementById('vlibStyles')) return
    var s = document.createElement('style')
    s.id = 'vlibStyles'
    s.textContent =
      '.vlibGear{position:fixed;top:calc(16px + env(safe-area-inset-top, 0px));right:calc(16px + env(safe-area-inset-right, 0px));z-index:40;' +
      'width:42px;height:42px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;' +
      'border:1px solid var(--border-strong,rgba(255,255,255,.16));background:rgba(9,13,12,.55);color:var(--muted-strong,rgba(255,255,255,.7));' +
      'cursor:pointer;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);transition:color var(--duration,180ms) var(--ease,ease),border-color var(--duration,180ms) var(--ease,ease),transform var(--duration,180ms) var(--ease,ease)}' +
      '.vlibGear:hover{color:var(--mint,#6EE7B7);border-color:rgba(110,231,183,.5)}' +
      '.vlibGear:active{transform:scale(.94)}' +
      '.vlibGear svg{width:20px;height:20px}' +

      '.vlibOverlay{position:fixed;inset:0;z-index:80;display:flex;align-items:flex-start;justify-content:center;' +
      'padding:calc(6vh + env(safe-area-inset-top, 0px)) 18px 6vh;overflow:auto;background:rgba(2,4,6,.72);' +
      '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);animation:vlibFade .18s ease}' +
      '@keyframes vlibFade{from{opacity:0}to{opacity:1}}' +

      '.vlibCard{width:100%;max-width:540px;border-radius:22px;border:1px solid var(--border-strong,rgba(255,255,255,.16));' +
      'background:linear-gradient(180deg,rgba(16,26,22,.96),rgba(6,10,9,.98));box-shadow:0 40px 90px -40px rgba(0,0,0,.9);' +
      'overflow:hidden;animation:vlibRise .22s var(--ease-premium,cubic-bezier(.16,1,.3,1))}' +
      '@keyframes vlibRise{from{opacity:0;transform:translateY(10px) scale(.99)}to{opacity:1;transform:none}}' +

      '.vlibTop{display:flex;align-items:center;justify-content:space-between;padding:20px 22px 14px}' +
      '.vlibTitle{font-family:var(--font-serif),Georgia,serif;font-style:italic;font-size:27px;color:var(--fg,#fff);line-height:1}' +
      '.vlibClose{width:34px;height:34px;border-radius:999px;border:1px solid var(--border,rgba(255,255,255,.1));background:transparent;' +
      'color:var(--muted,rgba(255,255,255,.5));cursor:pointer;display:inline-flex;align-items:center;justify-content:center}' +
      '.vlibClose:hover{color:var(--fg,#fff);border-color:var(--border-strong,rgba(255,255,255,.16))}' +
      '.vlibClose svg{width:16px;height:16px}' +

      '.vlibBody{padding:6px 22px 26px;max-height:70vh;overflow:auto}' +
      '.vlibSection{display:flex;align-items:center;gap:10px;font-family:ui-monospace,Menlo,monospace;font-size:12px;' +
      'letter-spacing:.08em;text-transform:uppercase;color:var(--muted,rgba(255,255,255,.5));margin:20px 0 8px}' +
      '.vlibSection:first-child{margin-top:6px}' +
      '.vlibCount{font-size:11px;padding:1px 8px;border-radius:999px;background:rgba(255,255,255,.06);color:var(--muted,rgba(255,255,255,.5))}' +
      '.vlibNote{color:var(--muted,rgba(255,255,255,.5));font-size:14px;padding:4px 2px 10px}' +

      '.vlibRow{display:flex;align-items:center;gap:14px;padding:12px 2px;border-bottom:1px solid var(--border,rgba(255,255,255,.08))}' +
      '.vlibIcon{flex:0 0 auto;width:40px;height:40px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;' +
      'color:var(--mint,#6EE7B7);background:rgba(110,231,183,.08);border:1px solid rgba(110,231,183,.2);' +
      'font-family:var(--font-serif),Georgia,serif;font-style:italic;font-size:19px}' +
      '.vlibMeta{flex:1;min-width:0}' +
      '.vlibName{display:block;font-weight:600;font-size:16px;color:var(--fg,#fff);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.vlibSrc{display:block;margin-top:2px;font-size:12.5px;color:var(--mint,#6EE7B7);opacity:.72;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +

      '.vlibBtn{flex:0 0 auto;padding:7px 15px;border-radius:999px;font-weight:600;font-size:13px;cursor:pointer}' +
      '.vlibBtn.rm{border:1px solid var(--border-strong,rgba(255,255,255,.16));background:transparent;color:var(--muted,rgba(255,255,255,.5))}' +
      '.vlibBtn.rm:hover{color:var(--fg,#fff)}' +
      '.vlibBtn.add{border:none;background:var(--mint,#6EE7B7);color:var(--mint-ink,#042a1c)}' +
      '.vlibPill{flex:0 0 auto;padding:7px 13px;border-radius:999px;border:1px solid var(--border,rgba(255,255,255,.1));' +
      'color:var(--muted,rgba(255,255,255,.5));font-size:12px;font-weight:600}' +

      '.vlibAdd{margin-top:22px;width:100%;padding:13px;border-radius:14px;border:1.5px dashed rgba(110,231,183,.4);' +
      'background:rgba(110,231,183,.04);color:var(--mint,#6EE7B7);font-weight:600;font-size:15px;cursor:pointer}' +
      '.vlibAdd:hover{background:rgba(110,231,183,.08)}' +
      '.vlibFoot{margin-top:14px;font-size:12.5px;color:var(--muted,rgba(255,255,255,.5));line-height:1.6}' +
      '.vlibHow{margin-top:16px;padding:16px;border-radius:14px;border:1px solid var(--border,rgba(255,255,255,.08));background:rgba(255,255,255,.02)}' +
      '.vlibHow p{color:var(--muted-strong,rgba(255,255,255,.7));font-size:14px;line-height:1.65;margin:0 0 8px}' +
      '.vlibHow code{font-family:ui-monospace,Menlo,monospace;font-size:13px;color:var(--mint,#6EE7B7)}' +
      '.vlibBack{margin-top:8px;padding:8px 0;border:none;background:transparent;color:var(--muted,rgba(255,255,255,.5));font-size:13px;cursor:pointer}' +

      '@media (prefers-reduced-motion: reduce){.vlibOverlay,.vlibCard{animation:none}.vlibGear{transition:none}}'
    document.head.appendChild(s)
  }

  // ── The gear. Injected once, fixed top-right.
  var COG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="12" cy="12" r="3"/>' +
    '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' +
    '</svg>'

  function mountGear() {
    if (document.getElementById('vlibGear')) return
    injectStyles() // the gear needs .vlibGear NOW, not only when the overlay opens
    var g = document.createElement('button')
    g.id = 'vlibGear'
    g.className = 'vlibGear'
    g.type = 'button'
    g.setAttribute('aria-label', 'Library')
    g.setAttribute('title', 'Library')
    g.innerHTML = COG
    g.addEventListener('click', open)
    document.body.appendChild(g)
  }

  // ── The overlay.
  var overlay = null

  function remount() {
    // Redraw the board so a hide/show takes effect immediately.
    if (window.VitalityHost && typeof window.VitalityHost.remount === 'function') {
      window.VitalityHost.remount()
    }
  }

  function hide(id) {
    var h = hiddenList()
    if (h.indexOf(id) === -1) h.push(id)
    writeHidden(h)
    render()
    remount()
  }
  function show(id) {
    writeHidden(hiddenList().filter(function (x) { return x !== id }))
    render()
    remount()
  }

  function row(t, action) {
    var initial = esc((t.name || t.id || '?').trim().charAt(0).toUpperCase())
    var btn =
      action === 'remove'
        ? '<button type="button" class="vlibBtn rm" data-act="hide" data-id="' + esc(t.id) + '">Remove</button>'
        : '<button type="button" class="vlibBtn add" data-act="show" data-id="' + esc(t.id) + '">Add</button>'
    return (
      '<div class="vlibRow">' +
      '<span class="vlibIcon">' + initial + '</span>' +
      '<span class="vlibMeta"><span class="vlibName">' + esc(t.name || t.id) + '</span>' +
      '<span class="vlibSrc">' + esc(sourceLine(t)) + '</span></span>' +
      btn +
      '</div>'
    )
  }

  function render() {
    if (!overlay) return
    var body = overlay.querySelector('.vlibBody')
    var hidden = hiddenList()
    var all = registry()
    var onBoard = all.filter(function (t) { return hidden.indexOf(t.id) === -1 })
    var inLib = all.filter(function (t) { return hidden.indexOf(t.id) !== -1 })

    var html = ''
    html += '<div class="vlibSection">On your board <span class="vlibCount">' + onBoard.length + '</span></div>'
    if (!onBoard.length) html += '<div class="vlibNote">nothing on your board yet. add your first tile below.</div>'
    onBoard.forEach(function (t) { html += row(t, 'remove') })

    // The Library itself - always here, never removable.
    html +=
      '<div class="vlibRow">' +
      '<span class="vlibIcon"><svg viewBox="-12 -12 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M0 -6 C-1.7 -7.4 -3.9 -8 -7 -7.5 L-7 7.5 C-3.9 8 -1.7 7.4 0 6"/>' +
      '<path d="M0 -6 C1.7 -7.4 3.9 -8 7 -7.5 L7 7.5 C3.9 8 1.7 7.4 0 6"/>' +
      '<line x1="0" y1="-6" x2="0" y2="6"/></svg></span>' +
      '<span class="vlibMeta"><span class="vlibName">Library</span>' +
      '<span class="vlibSrc">the settings panel · always here</span></span>' +
      '<span class="vlibPill">Always on</span>' +
      '</div>'

    html += '<div class="vlibSection">In your library <span class="vlibCount">' + inLib.length + '</span></div>'
    if (!inLib.length) html += '<div class="vlibNote">everything you have is on your board.</div>'
    inLib.forEach(function (t) { html += row(t, 'add') })

    html += '<button type="button" class="vlibAdd" data-act="how">+ Add a tile</button>'
    html +=
      '<div class="vlibFoot">this is your board, laid out. every tile, what feeds it, on or off.<br>' +
      'to add or reset anything, just ask your mentor.</div>'

    body.innerHTML = html
  }

  function renderHow() {
    if (!overlay) return
    var body = overlay.querySelector('.vlibBody')
    body.innerHTML =
      '<div class="vlibSection">Add a tile</div>' +
      '<div class="vlibHow">' +
      '<p>tiles are added by your mentor. tell it what you want:</p>' +
      '<p><code>build me a sleep tile</code><br><code>add a stocks tile with my finnhub key</code></p>' +
      '<p>it writes the tile, drops it in the registry, and it shows up right here.</p>' +
      '</div>' +
      '<button type="button" class="vlibBack" data-act="back">← back</button>'
  }

  function open() {
    injectStyles()
    if (overlay) return
    overlay = document.createElement('div')
    overlay.className = 'vlibOverlay'
    overlay.setAttribute('role', 'dialog')
    overlay.setAttribute('aria-modal', 'true')
    overlay.setAttribute('aria-label', 'Library')
    overlay.innerHTML =
      '<div class="vlibCard">' +
      '<div class="vlibTop"><span class="vlibTitle">Library</span>' +
      '<button type="button" class="vlibClose" aria-label="Close">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></button></div>' +
      '<div class="vlibBody"></div>' +
      '</div>'

    // Backdrop click closes; clicks inside the card do not.
    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) close()
    })
    overlay.querySelector('.vlibClose').addEventListener('click', close)

    // One delegated handler for every action button the body redraws.
    overlay.querySelector('.vlibBody').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-act]') : null
      if (!b) return
      var act = b.getAttribute('data-act')
      var id = b.getAttribute('data-id')
      if (act === 'hide') hide(id)
      else if (act === 'show') show(id)
      else if (act === 'how') renderHow()
      else if (act === 'back') render()
    })

    document.addEventListener('keydown', onKey)
    document.body.appendChild(overlay)
    render()
  }

  function close() {
    if (!overlay) return
    document.removeEventListener('keydown', onKey)
    overlay.remove()
    overlay = null
  }
  function onKey(e) {
    if (e.key === 'Escape') close()
  }

  // ── Boot. Put the gear up as soon as the body exists.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountGear)
  } else {
    mountGear()
  }

  // Read-only handle, matching host.js's window.VitalityHost pattern.
  window.VitalityLibrary = { open: open, close: close }
})()
