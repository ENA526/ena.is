<script>
    // --- Difficulty presets ---
    const PRESETS = {
        basic:        { rows: 9,  cols: 9,  mines: 10 },
        intermediate: { rows: 16, cols: 16, mines: 40 },
        advanced:     { rows: 16, cols: 30, mines: 99 }
    };

    // --- Mode & custom controls ---
    let mode = $state('basic'); // 'basic' | 'intermediate' | 'advanced' | 'custom'
    let customRows = $state(9);
    let customCols = $state(9);
    let customMines = $state(10);

    // --- Config (dynamic, driven by mode/custom) ---
    let rows = $state(9);
    let cols = $state(9);
    let totalMines = $state(10);

    // --- Options / runtime flags ---
    let firstClickSafe = $state(true);
    let firstClickDone = $state(false);
    let gameOver = $state(false);
    let won = $state(false);

    // Timer (count-up)
    let running = $state(false);
    let elapsedMs = $state(0);
    let clearTimeMs = $state(null);

    // HUD
    let lastClick = $state(null);

    // Track which mine exploded (only when you click a mine)
    let exploded = $state(null); // { r, c } | null

    // --- Cell model ---
    // { mine, count, revealed, flagged }
    let board = $state([]);

    // Helpers
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

    function applyMode(startNew = true) {
        if (mode === 'custom') {
            const r = clamp(Math.floor(customRows || 1), 1, 60);
            const c = clamp(Math.floor(customCols || 1), 1, 60);
            const maxM = Math.max(0, r * c - 1);
            const m = clamp(Math.floor(customMines || 0), 0, maxM);
            rows = r; cols = c; totalMines = m;
        } else {
            const p = PRESETS[mode];
            rows = p.rows; cols = p.cols; totalMines = p.mines;
        }
        if (startNew) newGame();
    }

    // --- Board utilities ---
    function makeEmptyBoard() {
        return Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => ({
            mine: false,
            count: 0,
            revealed: false,
            flagged: false
            }))
        );
    }

    const inBounds = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols;

    function neighbors(r, c) {
        const out = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr, nc = c + dc;
            if (inBounds(nr, nc)) out.push([nr, nc]);
            }
        }
        return out;
    }

    function placeMines(n = totalMines, excludeSet = null) {
        let placed = 0;
        while (placed < n) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            const key = `${r},${c}`;
            if (excludeSet?.has(key)) continue;
            if (!board[r][c].mine) {
            board[r][c].mine = true;
            placed++;
            }
        }
    }

    function computeCounts() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
            if (board[r][c].mine) { board[r][c].count = 0; continue; }
            let cnt = 0;
            for (const [nr, nc] of neighbors(r, c)) if (board[nr][nc].mine) cnt++;
            board[r][c].count = cnt;
            }
        }
    }

    function revealAllMines() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
            if (board[r][c].mine) board[r][c].revealed = true;
            }
        }
        board = board;
    }

    // Flood that ignores flags on safe cells
    function floodReveal(sr, sc) {
        const q = [[sr, sc]];
        const seen = new Set([`${sr},${sc}`]);

        while (q.length) {
            const [r, c] = q.shift();
            const cell = board[r][c];

            if (cell.revealed) continue;
            if (cell.mine) continue;

            if (cell.flagged) cell.flagged = false;
            cell.revealed = true;

            if (cell.count === 0) {
                for (const [nr, nc] of neighbors(r, c)) {
                    const key = `${nr},${nc}`;
                    const ncell = board[nr][nc];
                    if (seen.has(key) || ncell.revealed) continue;
                    if (!ncell.mine) { seen.add(key); q.push([nr, nc]); }
                }
            }
        }
        board = board;
    }

    function newGame() {
        board = makeEmptyBoard();
        lastClick = null;
        firstClickDone = false;
        gameOver = false;
        won = false;
        exploded = null;

        running = false;
        elapsedMs = 0;
        clearTimeMs = null;

        if (!firstClickSafe) {
            placeMines();
            computeCounts();
        }
        board = board;
    }

    // init
    applyMode(true);

    // --- Derived HUD values ---
    const flagsCount = $derived(board.flat().filter(c => c.flagged).length);
    const minesRemaining = $derived(totalMines - flagsCount);

    // --- Timer effect ---
    $effect(() => {
        if (!running || gameOver || won) return;
        let start = performance.now() - elapsedMs;
        let raf;
        function tick(now) {
            elapsedMs = now - start;
            raf = requestAnimationFrame(tick);
        }
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    });

    // --- Win check ---
    function checkWinStrict() {
        if (gameOver) return;
        if (firstClickSafe && !firstClickDone) return;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
            const cell = board[r][c];
            if (cell.flagged !== cell.mine) return;
            if (!cell.mine && !cell.revealed) return;
            }
        }
        won = true;
        running = false;
        clearTimeMs = elapsedMs;
    }

    // --- Interactions ---
    function onLeft(r, c) {
        if (gameOver || won) return;
        const cell = board[r][c];
        lastClick = `${r + 1} x ${c + 1}`;
        if (!running) running = true;
        if (firstClickSafe && !firstClickDone) {
            const exclude = new Set([`${r},${c}`]);
            placeMines(totalMines, exclude);
            computeCounts();
            firstClickDone = true;
            board = board;
        }
        if (cell.revealed || cell.flagged) return;
        if (cell.mine) {
            cell.revealed = true;
            gameOver = true;
            running = false;
            exploded = { r, c };
            revealAllMines();
            return;
        }
        if (cell.count === 0) floodReveal(r, c);
        else { cell.revealed = true; board = board; }
        checkWinStrict();
    }

    function onRight(e, r, c) {
        e.preventDefault();
        if (gameOver || won) return;
        const cell = board[r][c];
        if (cell.revealed) return;
        cell.flagged = !cell.flagged;
        lastClick = (cell.flagged ? 'flag ' : 'unflag ') + `${r + 1} x ${c + 1}`;
        board = board;
        checkWinStrict();
    }

    // Styling helpers
    function numberClass(n) {
    switch (n) {
        case 1: return 'text-blue-700';
        case 2: return 'text-green-700';
        case 3: return 'text-red-600';
        case 4: return 'text-indigo-700';
        case 5: return 'text-rose-700';
        case 6: return 'text-teal-700';
        case 7: return 'text-slate-800';
        case 8: return 'text-slate-600';
        default: return '';
    }
    }

    function isExploded(r, c) {
        return gameOver && exploded && exploded.r === r && exploded.c === c;
    }

    function isMisflag(r, c) {
        return gameOver && exploded && board[r][c].flagged && !board[r][c].mine;
    }

    function cellClasses(r, c) {
        if (isExploded(r, c)) return 'bg-red-500 border-red-600 text-white';
        if (isMisflag(r, c)) return 'bg-rose-100 border-rose-300';
        return board[r][c].revealed
            ? 'bg-white border-slate-300'
            : 'bg-slate-100 border-slate-300 hover:bg-slate-50 active:translate-y-[1px]';
    }

    function fmt(ms) {
        if (ms == null) return '0.000s';
        return (ms / 1000).toFixed(3) + 's';
    }

    function onCustomRows(e) { customRows = Number(e.target.value); applyMode(true); }
    function onCustomCols(e) { customCols = Number(e.target.value); applyMode(true); }
    function onCustomMines(e) { customMines = Number(e.target.value); applyMode(true); }
</script>

<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-20 lg:py-24 grid gap-10 lg:items-center justify-items-center">
    <div class="@container w-full max-w-4xl xl:max-w-6xl rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div class="flex flex-col @md:flex-row">
            <div class="p-6 @md:p-8 @lg:p-10 flex-1">
                <h2 class="text-xl md:text-2xl font-bold">Minesweeper</h2>
                <p class="mt-2 text-slate-600">Minesweeper is a classic puzzle game.</p>

                <!-- Controls -->
                <div class="mt-4 grid gap-3 rounded-xl border bg-slate-50 p-4">
                    <div class="flex flex-wrap items-center gap-3">
                    <!-- <label class="text-sm font-medium">Mode:</label>
                    <select class="rounded-md border px-2 py-1 text-sm"
                            bind:value={mode}
                            onchange={() => applyMode(true)}>
                        <option value="basic">Basic (9x9, 10)</option>
                        <option value="intermediate">Intermediate (16x16, 40)</option>
                        <option value="advanced">Advanced (30x16, 99)</option>
                        <option value="custom">Custom…</option>
                    </select> -->

                    

                    <!-- <button class="rounded-md border px-3 py-1 text-sm hover:bg-white" onclick={() => applyMode(true)}>
                        Apply / New Game
                    </button> -->
                    </div>

                    <!-- {#if mode === 'custom'}
                    <div class="flex flex-wrap items-end gap-3">
                        <div class="flex flex-col">
                        <label class="text-xs text-slate-600">Rows</label>
                        <input type="number" min="1" max="60" class="w-24 rounded-md border px-2 py-1 text-sm"
                                value={customRows} oninput={onCustomRows} />
                        </div>
                        <div class="flex flex-col">
                        <label class="text-xs text-slate-600">Columns</label>
                        <input type="number" min="1" max="60" class="w-24 rounded-md border px-2 py-1 text-sm"
                                value={customCols} oninput={onCustomCols} />
                        </div>
                        <div class="flex flex-col">
                        <label class="text-xs text-slate-600">Mines</label>
                        <input type="number" min="0" class="w-28 rounded-md border px-2 py-1 text-sm"
                                value={customMines} oninput={onCustomMines} />
                        </div>
                        <div class="text-xs text-slate-500">
                        Tip: Mines are clamped to <span class="font-mono">{rows * cols - 1}</span> max.
                        </div>
                    </div>
                    {/if} -->

                    <!-- HUD -->
                    <div class="flex flex-wrap items-center justify-between gap-3">
                    <label class="flex gap-2 text-sm">
                        <input type="checkbox" bind:checked={firstClickSafe} />
                        <span>First-click safe</span>
                    </label>
                    <div class="text-sm font-semibold tabular-nums">Time: {fmt(won ? clearTimeMs : elapsedMs)}</div>
                    <div class="text-sm font-semibold tabular-nums">Mines left: {minesRemaining}</div>
                    <button class="rounded-md border px-3 py-1 text-sm hover:bg-white" onclick={newGame}>
                        New Game
                    </button>
                    </div>
                </div>

                <!-- Status banners -->
                {#if gameOver}
                    <div class="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 text-sm">
                    Game Over — Mine clicked.
                    </div>
                {:else if won}
                    <div class="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700 text-sm">
                    You win! Clear time: <span class="font-semibold">{fmt(clearTimeMs)}</span>
                    </div>
                {/if}

                <!-- Board -->
                <div class="mt-6">
                    <div class="mx-auto w-fit overflow-auto">
                        <div
                            class="grid gap-1 rounded-xl bg-slate-200/70 p-1 shadow-inner
                                @md:gap-1.5 @lg:gap-2 @md:p-1.5 @lg:p-2
                                [--cell:24px] md:[--cell:28px] lg:[--cell:28px]"
                            role="grid"
                            aria-label={`Minesweeper board ${rows} by ${cols}`}
                            style="
                            grid-template-columns: repeat({cols}, var(--cell));
                            grid-auto-rows: var(--cell);
                            "
                        >
                            {#each Array(rows) as _, r}
                                {#each Array(cols) as _, c}
                                    <button
                                    type="button"
                                    aria-label={`Cell ${r + 1},${c + 1}`}
                                    onclick={() => onLeft(r, c)}
                                    oncontextmenu={(e) => onRight(e, r, c)}
                                    class="relative rounded-md border shadow-sm select-none
                                            focus:outline-none focus:ring focus:ring-slate-400/50 {cellClasses(r, c)}"
                                    disabled={gameOver || won}
                                    >
                                    {#if board[r][c].revealed}
                                        {#if board[r][c].mine}
                                            <span class="absolute inset-0 grid place-items-center text-lg">💣</span>
                                        {:else if board[r][c].count > 0}
                                            <span class="absolute inset-0 grid place-items-center font-semibold {numberClass(board[r][c].count)}">
                                            {board[r][c].count}
                                        </span>
                                        {/if}
                                    {:else}
                                        {#if board[r][c].flagged}
                                            <span class="absolute inset-0 grid place-items-center text-lg">🚩</span>
                                        {/if}
                                    {/if}
                                    </button>
                                {/each}
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
