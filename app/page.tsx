
"use client";

import { useMemo, useState } from "react";

const SIZE = 11;
const RACK_SIZE = 7;

const LETTERS =
  "EEEEEEEEAAAAAAAIIIIIIIOOOOOONNNNNNRRRRRRTTTTTTLLLLSSSSUUUUDDDDGGGGBBCCMMPPFFHHVVWWYYKJXQZ";

const INITIAL_LETTERS = ["A", "R", "R", "I", "K", "A", "E"];

const PREMIUM: Record<string, number> = {
  "5,5": 3,
  "2,2": 2,
  "2,8": 2,
  "8,2": 2,
  "8,8": 2,
  "0,0": 3,
  "0,10": 3,
  "10,0": 3,
  "10,10": 3,
};

const VALUES: Record<string, number> = {
  A: 1, E: 1, I: 1, O: 1, U: 1, L: 1, N: 1, S: 1, T: 1, R: 1,
  D: 2, G: 2, B: 3, C: 3, M: 3, P: 3, F: 4, H: 4, V: 4, W: 4,
  Y: 4, K: 5, J: 8, X: 8, Q: 10, Z: 10,
};

type Tile = {
  id: number;
  letter: string;
};

type PlacedTile = Tile & {
  row: number;
  col: number;
};

function makeTile(id: number): Tile {
  return {
    id,
    letter: LETTERS[Math.floor(Math.random() * LETTERS.length)],
  };
}

function makeInitialRack(): Tile[] {
  return INITIAL_LETTERS.map((letter, index) => ({
    id: index + 1,
    letter,
  }));
}

function points(letter: string): number {
  return VALUES[letter] ?? 0;
}

export default function Home() {
  const [rack, setRack] = useState<Tile[]>(makeInitialRack);
  const [placed, setPlaced] = useState<PlacedTile[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [message, setMessage] = useState(
    "Your next great word starts here."
  );
  const [turn, setTurn] = useState(1);
  const [nextId, setNextId] = useState(RACK_SIZE + 1);

  const boardMap = useMemo(
    () =>
      new Map(
        placed.map((tile) => [`${tile.row},${tile.col}`, tile])
      ),
    [placed]
  );

  const word = useMemo(
    () =>
      [...placed]
        .sort((a, b) =>
          a.row === b.row ? a.col - b.col : a.row - b.row
        )
        .map((tile) => tile.letter)
        .join(""),
    [placed]
  );

  const previewPoints = placed.reduce(
    (sum, tile) => sum + points(tile.letter),
    0
  );

  function placeAt(row: number, col: number) {
    if (boardMap.has(`${row},${col}`)) {
      setMessage("That square is already occupied.");
      return;
    }

    if (selected === null) {
      setMessage("Choose a letter tile first.");
      return;
    }

    const tile = rack.find((item) => item.id === selected);

    if (!tile) return;

    setPlaced((previous) => [
      ...previous,
      { ...tile, row, col },
    ]);

    setRack((previous) =>
      previous.filter((item) => item.id !== selected)
    );

    setSelected(null);
    setMessage(`${tile.letter} placed. Build your word.`);
  }

  function returnTile(tile: PlacedTile) {
    setPlaced((previous) =>
      previous.filter((item) => item.id !== tile.id)
    );

    setRack((previous) => [
      ...previous,
      { id: tile.id, letter: tile.letter },
    ]);

    setSelected(null);
    setMessage("Tile returned to your rack.");
  }

  function playWord() {
    if (placed.length === 0) {
      setMessage("Place some letters on the board first.");
      return;
    }

    const sorted = [...placed].sort((a, b) =>
      a.row === b.row ? a.col - b.col : a.row - b.row
    );

    const sameRow = sorted.every(
      (tile) => tile.row === sorted[0].row
    );

    const sameCol = sorted.every(
      (tile) => tile.col === sorted[0].col
    );

    if (sorted.length > 1 && !sameRow && !sameCol) {
      setMessage("Keep your letters in one row or column.");
      return;
    }

    const axis: "row" | "col" = sameRow ? "col" : "row";
    const coordinates = sorted.map((tile) => tile[axis]);
    const min = Math.min(...coordinates);
    const max = Math.max(...coordinates);

    if (max - min + 1 !== sorted.length) {
      setMessage("Close the gaps between your letters first.");
      return;
    }

    const earned =
      sorted.reduce(
        (sum, tile) => sum + points(tile.letter),
        0
      ) + (sorted.length === RACK_SIZE ? 10 : 0);

    setScore((previous) => previous + earned);
    setBest((previous) => Math.max(previous, score + earned));

    setRack((previous) => {
      const needed = Math.max(0, RACK_SIZE - previous.length);

      const replacements = Array.from(
        { length: Math.min(needed, sorted.length) },
        (_, index) => makeTile(nextId + index)
      );

      return [...previous, ...replacements].slice(0, RACK_SIZE);
    });

    setNextId((previous) => previous + sorted.length);
    setPlaced([]);
    setSelected(null);
    setTurn((previous) => previous + 1);

    setMessage(
      `Nice move! You earned ${earned} points${
        sorted.length === RACK_SIZE
          ? ", including the seven-tile bonus"
          : ""
      }.`
    );
  }

  function shuffleRack() {
    setRack((previous) => {
      const shuffled = [...previous];

      for (let index = shuffled.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(
          Math.random() * (index + 1)
        );

        [shuffled[index], shuffled[randomIndex]] = [
          shuffled[randomIndex],
          shuffled[index],
        ];
      }

      return shuffled;
    });

    setSelected(null);
    setMessage("A fresh perspective. Choose your next tile.");
  }

  function recallTiles() {
    setRack((previous) => [
      ...previous,
      ...placed.map(({ id, letter }) => ({ id, letter })),
    ]);

    setPlaced([]);
    setSelected(null);
    setMessage("All placed tiles returned to your rack.");
  }

  function newGame() {
    setRack(
      Array.from({ length: RACK_SIZE }, (_, index) =>
        makeTile(index + 1)
      )
    );

    setPlaced([]);
    setSelected(null);
    setScore(0);
    setTurn(1);
    setNextId(RACK_SIZE + 1);
    setMessage("A new game. A world of possibilities.");
  }

  return (
    <main className="arrika-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Arrika home">
          <span className="brand-mark">a.</span>
          <span>arrika</span>
        </a>

        <span className="topbar-label">THE ART OF WORDS</span>

        <button className="quiet-button" onClick={newGame}>
          New game <span>↗</span>
        </button>
      </header>

      <section className="intro">
        <p className="eyebrow">
          <span className="live-dot" />
          YOUR DAILY MOMENT OF CLARITY
        </p>

        <h1>
          Words have
          <br />
          <em>their own magic.</em>
        </h1>

        <p className="intro-copy">
          A little space to think. A new way to play.
          <br className="desktop-break" /> Make every letter count.
        </p>
      </section>

      <section
        className="game-layout"
        aria-label="Arrika word game"
      >
        <div className="board-panel">
          <div className="board-heading">
            <div>
              <p className="eyebrow">THE PLAYING FIELD</p>
              <h2>
                Your board<span>.</span>
              </h2>
            </div>

            <span className="turn-chip">
              ROUND {String(turn).padStart(2, "0")}
            </span>
          </div>

          <div className="board" role="grid" aria-label="Word game board">
            {Array.from({ length: SIZE * SIZE }, (_, index) => {
              const row = Math.floor(index / SIZE);
              const col = index % SIZE;
              const key = `${row},${col}`;
              const tile = boardMap.get(key);
              const premium = PREMIUM[key];

              return (
                <button
                  key={key}
                  role="gridcell"
                  className={`cell ${
                    tile ? "cell-filled" : ""
                  } ${
                    premium ? `premium premium-${premium}` : ""
                  } ${
                    row === 5 && col === 5 ? "centre-cell" : ""
                  }`}
                  onClick={() =>
                    tile ? returnTile(tile) : placeAt(row, col)
                  }
                  aria-label={
                    tile
                      ? `${tile.letter}, row ${row + 1}, column ${
                          col + 1
                        }. Click to return tile`
                      : `Empty square, row ${row + 1}, column ${
                          col + 1
                        }`
                  }
                >
                  {tile ? (
                    <>
                      <span className="cell-letter">{tile.letter}</span>
                      <span className="cell-points">
                        {points(tile.letter)}
                      </span>
                    </>
                  ) : premium ? (
                    <span className="premium-label">
                      {premium === 3 ? "3×" : "2×"}
                    </span>
                  ) : row === 5 && col === 5 ? (
                    <span className="centre-star">✳</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="board-footer">
            <span>
              <span className="legend-dot" />
              Letter tile
            </span>
            <span>Tap a tile, then tap a square</span>
          </div>
        </div>

        <aside className="side-panel">
          <div className="score-card">
            <p className="eyebrow">YOUR SCORE</p>

            <div className="score-number">
              {score}
              <span>pts</span>
            </div>

            <div className="score-divider" />

            <div className="score-meta">
              <span>Personal best</span>
              <strong>{best}</strong>
            </div>

            <div className="score-meta">
              <span>Rounds played</span>
              <strong>{turn}</strong>
            </div>
          </div>

          <div className="play-card">
            <div className="play-card-heading">
              <div>
                <p className="eyebrow">YOUR LETTERS</p>
                <h3>
                  The rack<span>.</span>
                </h3>
              </div>

              <button
                className="shuffle-button"
                onClick={shuffleRack}
                aria-label="Shuffle letters"
                title="Shuffle letters"
              >
                ⤨
              </button>
            </div>

            <p className="rack-hint">
              Choose a letter, then a square.
            </p>

            <div className="rack">
              {rack.map((tile) => (
                <button
                  key={tile.id}
                  className={`rack-tile ${
                    selected === tile.id
                      ? "rack-tile-selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelected(
                      selected === tile.id ? null : tile.id
                    )
                  }
                  aria-pressed={selected === tile.id}
                >
                  <span>{tile.letter}</span>
                  <small>{points(tile.letter)}</small>
                </button>
              ))}

              {rack.length === 0 && (
                <span className="empty-rack">
                  Your rack is empty.
                </span>
              )}
            </div>

            <div className="move-preview">
              <span>WORD PREVIEW</span>
              <strong>{word || "— — —"}</strong>
              <span>{previewPoints} base points</span>
            </div>

            <button className="primary-button" onClick={playWord}>
              Play word <span>↗</span>
            </button>

            <button className="secondary-button" onClick={recallTiles}>
              Recall all tiles
            </button>

            <p className="feedback" aria-live="polite">
              <span>✳</span>
              {message}
            </p>
          </div>

          <div className="note-card">
            <span className="note-icon">✳</span>
            <p>
              <strong>A thought for today</strong>
              <br />
              Great words begin with a single letter.
            </p>
          </div>
        </aside>
      </section>

      <footer className="site-footer">
        <span>ARRIKA © 2026</span>
        <span>MADE FOR THE LOVE OF WORDS</span>
        <button onClick={newGame}>Start fresh ↑</button>
      </footer>
    </main>
  );
}
