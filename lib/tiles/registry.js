/**
 * THE REGISTRY - the list of tiles on this board.
 *
 * This is move 2 of adding a tile. The file lands in tiles/, then it gets one
 * line here, and the board renders it. That is the whole registration.
 *
 * Each entry:
 *   id    a short stable slug. THIS IS THE STORAGE KEY. Never change it after
 *         data exists under it, or the tile boots empty and its history is
 *         orphaned. Renaming an id is a data migration, not a rename.
 *   name  what a human calls it. Safe to change any time.
 *   file  the path to the tile's html, relative to index.html.
 *   size  how much grid it takes. One of:
 *           s     1 wide, 1 tall
 *           m     2 wide, 1 tall
 *           tall  1 wide, 2 tall
 *           hero  3 wide, 1 tall
 *           big   2 wide, 2 tall
 *           band  4 wide, 1 tall
 *           l     4 wide, 2 tall
 *         (matches lib/tiles/tileSkin.ts SIZE_PRESETS on Vitality)
 *
 * Ships empty on purpose. An empty board is the seed. Every tile from here is
 * theirs, added one at a time.
 */
window.TILES = [
  // { id: 'stocks', name: 'Stocks', file: 'tiles/stocks.html', size: 'big' },
]
