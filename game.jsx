import React, { useEffect, useRef, useState } from "react";

// Music Tutor - Single-file React component
// - TailwindCSS classes used for styling (no import required in this file)
// - Exports a default React component that implements:
//   Main Menu -> Game -> Summary
// - Synthesizes piano-like tones with WebAudio
// - Renders notes on a simple SVG staff for treble & bass clefs

// Usage: drop this component into a React app (create-react-app, Vite, Next.js, etc.)
// Make sure Tailwind is enabled in the project for proper styling.

// Helpers: note <-> frequency mapping
const A4 = 440;
const noteToSemitoneOffset = {
  C: -9,
  D: -7,
  E: -5,
  F: -4,
  G: -2,
  A: 0,
  B: 2,
};

function noteFrequency(noteNameWithOctave) {
  // ex: C4, A4, G#3 (we only use natural notes here)
  const match = noteNameWithOctave.match(/^([A-G])([0-9]+)$/);
  if (!match) return A4;
  const [, letter, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const semitoneOffsetFromA4 = noteToSemitoneOffset[letter] + (octave - 4) * 12;
  return A4 * Math.pow(2, semitoneOffsetFromA4 / 12);
}

// Predefined note ranges for clefs (natural notes only for simplicity)
const TREBLE_RANGE = ["E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5"]; // visible notes
const BASS_RANGE = ["G2", "A2", "B2", "C3", "D3", "E3", "F3", "G3", "A3", "B3"];

function getRandomNoteForClef(clef) {
  const list = clef === "treble" ? TREBLE_RANGE : BASS_RANGE;
  return list[Math.floor(Math.random() * list.length)];
}

// Convert note name to a vertical position on staff SVG (0..100) - relative
function noteYPositionOnStaff(note, clef) {
  // We'll map each note in our ranges to a Y value on the staff
  const list = clef === "treble" ? TREBLE_RANGE : BASS_RANGE;
  const index = list.indexOf(note);
  // Staff area from 20 (top) to 80 (bottom)
  const top = 22;
  const bottom = 78;
  if (index === -1) return 50;
  const ratio = index / (list.length - 1);
  return top + (1 - ratio) * (bottom - top);
}

// Simple piano-like synth using WebAudio
function useSynth() {
  const audioCtxRef = useRef(null);
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  function ensureCtx() {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtxRef.current;
  }

  function playNote(noteNameWithOctave, duration = 1) {
    const ctx = ensureCtx();
    const freq = noteFrequency(noteNameWithOctave);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // mix of two oscillators for richer tone
    osc.type = "sine";
    osc.frequency.value = freq;
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = freq * 2.0005; // slight detune

    // simple ADSR
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.7, now + 0.02); // attack
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.12); // decay
    gain.gain.setValueAtTime(0.2, now + duration - 0.05); // sustain until near end
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration); // release

    const merger = ctx.createGain();
    merger.gain.value = 0.6;

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(merger);
    merger.connect(ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);
  }

  return { playNote };
}

// Main App
export default function MusicTutorApp() {
  const [screen, setScreen] = useState("menu"); // menu, game, summary
  const [clef, setClef] = useState("treble");
  const [timeLimit, setTimeLimit] = useState(60);
  const [currentNote, setCurrentNote] = useState(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [startedAt, setStartedAt] = useState(null);
  const [history, setHistory] = useState([]);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem("musicTutorHigh")) || 0);

  const { playNote } = useSynth();

  // Start game
  function startGame() {
    const first = getRandomNoteForClef(clef);
    setCurrentNote(first);
    setScore(0);
    setTotal(0);
    setMistakes([]);
    setHistory([]);
    setSecondsLeft(timeLimit);
    setStartedAt(Date.now());
    setScreen("game");
  }

  // Select answer
  function answer(noteLetter) {
    if (!currentNote) return;
    const correctLetter = currentNote[0];
    const isCorrect = noteLetter === correctLetter;

    setTotal((t) => t + 1);
    setHistory((h) => [{ note: currentNote, guess: noteLetter, correct: isCorrect, time: new Date().toISOString() }, ...h]);
    if (isCorrect) {
      setScore((s) => s + 1);
      playNote(currentNote, 0.9);
    } else {
      setMistakes((m) => [...m, { note: currentNote, guess: noteLetter }]);
      playNote(currentNote, 0.9);
    }

    // next note
    const next = getRandomNoteForClef(clef);
    // small delay for UX
    setTimeout(() => setCurrentNote(next), 130);
  }

  // Timer effect
  useEffect(() => {
    if (screen !== "game") return;
    if (secondsLeft <= 0) {
      // end game
      setScreen("summary");
      // update high score
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("musicTutorHigh", String(score));
      }
      return;
    }
    const id = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [screen, secondsLeft, score, highScore]);

  // When entering summary, ensure current note cleared
  useEffect(() => {
    if (screen === "summary") setCurrentNote(null);
  }, [screen]);

  // UI components inside this file
  function MainMenu() {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Music Tutor — Web</h1>
        <p className="mb-4 text-gray-700">Practice sight-reading. Select clef and duration, then identify notes as quickly as you can.</p>

        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="flex items-center gap-4 mb-3">
            <label className="font-medium">Clef</label>
            <div className="flex gap-2">
              <button className={`px-3 py-1 rounded ${clef === "treble" ? "bg-slate-800 text-white" : "bg-slate-100"}`} onClick={() => setClef("treble")}>Treble</button>
              <button className={`px-3 py-1 rounded ${clef === "bass" ? "bg-slate-800 text-white" : "bg-slate-100"}`} onClick={() => setClef("bass")}>Bass</button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <label className="font-medium">Duration</label>
            <div className="flex gap-2">
              {[30, 60, 120].map((t) => (
                <button key={t} className={`px-3 py-1 rounded ${timeLimit === t ? "bg-slate-800 text-white" : "bg-slate-100"}`} onClick={() => setTimeLimit(t)}>{t}s</button>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded shadow" onClick={startGame}>Start</button>
            <button className="ml-3 px-3 py-2 rounded border" onClick={() => { setClef("treble"); setTimeLimit(60); }}>Reset</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">High score</h3>
          <div className="text-4xl font-bold">{highScore}</div>
          <p className="text-sm text-gray-500 mt-2">Your high score is saved in this browser.</p>
        </div>
      </div>
    );
  }

  function GameScreen() {
    const letters = ["A", "B", "C", "D", "E", "F", "G"];
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-sm text-gray-600">Clef: <span className="font-medium">{clef}</span></div>
            <div className="text-sm text-gray-600">Time left: <span className="font-bold">{secondsLeft}s</span></div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Score</div>
            <div className="text-2xl font-bold">{score}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <div className="mb-4 text-center">
            <strong className="block mb-2">Identify this note</strong>
            <div className="mx-auto max-w-lg">
              <StaffSVG note={currentNote} clef={clef} />
            </div>
            <div className="mt-3 text-sm text-gray-500">(Click the correct letter or press keyboard keys A–G)</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {letters.map((l) => (
              <button key={l} onClick={() => answer(l)} className="py-3 rounded bg-slate-100 hover:bg-slate-200">{l}</button>
            ))}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Correct: {score} • Attempts: {total} • Mistakes: {mistakes.length}
          </div>
        </div>

        <div className="flex gap-2">
          <button className="px-3 py-2 rounded border" onClick={() => { setScreen("menu"); }}>Quit</button>
          <button className="px-3 py-2 rounded border" onClick={() => { setCurrentNote(getRandomNoteForClef(clef)); }}>Skip</button>
        </div>

        <HistoryList history={history} />
      </div>
    );
  }

  function SummaryScreen() {
    const accuracy = total === 0 ? 0 : Math.round((score / total) * 100);
    const notesPerMin = Math.round((total / (timeLimit / 60)) || 0);
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-2">Summary</h2>
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Score</div>
              <div className="text-3xl font-bold">{score}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Accuracy</div>
              <div className="text-3xl font-bold">{accuracy}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Attempts</div>
              <div className="text-2xl font-bold">{total}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Notes/min</div>
              <div className="text-2xl font-bold">{notesPerMin}</div>
            </div>
          </div>

          <div className="mt-4">
            <button className="px-3 py-2 rounded bg-indigo-600 text-white mr-2" onClick={() => startGame()}>Play again</button>
            <button className="px-3 py-2 rounded border" onClick={() => setScreen("menu")}>Back to menu</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Mistakes</h3>
          {mistakes.length === 0 ? (
            <div className="text-sm text-gray-500">Nice! No mistakes.</div>
          ) : (
            <ul className="list-disc pl-5 text-sm">
              {mistakes.map((m, i) => (
                <li key={i}>{m.note} — you guessed {m.guess}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="container mx-auto">
        <div className="mx-4">
          {screen === "menu" && <MainMenu />}
          {screen === "game" && <GameScreen />}
          {screen === "summary" && <SummaryScreen />}
        </div>
      </div>

      <div className="fixed bottom-4 right-4 text-sm text-gray-600 bg-white p-2 rounded shadow">Made with ❤️ — Music Tutor Web</div>

      <KeyboardListener onKey={(key) => {
        const k = key.toUpperCase();
        if (k >= "A" && k <= "G" && screen === "game") answer(k);
      }} />
    </div>
  );
}

// Small components: StaffSVG, HistoryList, KeyboardListener
function StaffSVG({ note, clef }) {
  const width = 600;
  const height = 160;
  const y = note ? noteYPositionOnStaff(note, clef) : 50;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="120px" className="mx-auto">
      <rect x="0" y="0" width={width} height={height} fill="transparent" />

      {/* staff lines */}
      {[0, 1, 2, 3, 4].map((i) => {
        const ly = 30 + i * 14;
        return <line key={i} x1={40} x2={width - 40} y1={ly} y2={ly} stroke="#111827" strokeWidth={1} opacity={0.15} />;
      })}

      {/* Clef text */}
      <text x={50} y={70} fontSize={42} fontFamily="serif" fill="#111827">{clef === "treble" ? "𝄞" : "𝄢"}</text>

      {/* Note (circle) */}
      {note ? (
        <g>
          <ellipse cx={width / 2} cy={(y / 100) * height} rx={18} ry={12} fill="#111827" />
          {/* stem */}
          <line x1={width / 2 + 16} x2={width / 2 + 16} y1={(y / 100) * height} y2={(y / 100) * height - 44} stroke="#111827" strokeWidth={2} />
        </g>
      ) : (
        <text x={width / 2} y={height / 2} textAnchor="middle" fontSize={14} fill="#6b7280">No note</text>
      )}
    </svg>
  );
}

function HistoryList({ history }) {
  if (!history || history.length === 0) return null;
  return (
    <div className="mt-6 bg-white p-4 rounded shadow">
      <h4 className="font-semibold mb-2">Recent attempts</h4>
      <ul className="text-sm text-gray-700">
        {history.slice(0, 8).map((h, i) => (
          <li key={i}>{h.correct ? "✅" : "❌"} {h.note} — you guessed {h.guess}</li>
        ))}
      </ul>
    </div>
  );
}

function KeyboardListener({ onKey }) {
  useEffect(() => {
    function handler(e) {
      if (onKey) onKey(e.key);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onKey]);
  return null;
}
