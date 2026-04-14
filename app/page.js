"use client";
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { supabase } from "../lib/supabase";

const TARGETS = { startWeight: 110, goalWeight: 90, kcal: 2400, protein: 200, deadline: new Date("2026-07-01") };

const SESSIONS = {
  torso1: {
    name: "Torso 1",
    exercises: [
      { id: "t1_1", name: "Jalón con isquios", reps: "8-10", sets: 2 },
      { id: "t1_2", name: "Press inclinado", reps: "5-8", sets: 2 },
      { id: "t1_3", name: "Remo analítico", reps: "6-8", sets: 2 },
      { id: "t1_4", name: "Press plano", reps: "6-8", sets: 2 },
      { id: "t1_5", name: "Vuelos laterales v1", reps: "6-8", sets: 2 },
      { id: "t1_6", name: "Tríceps", reps: "8-10", sets: 2 },
      { id: "t1_7", name: "Bíceps + antebrazo", reps: "7-10", sets: 2 },
    ],
  },
  pierna1: {
    name: "Pierna 1",
    exercises: [
      { id: "p1_1", name: "Aductor", reps: "7-10", sets: 2 },
      { id: "p1_2", name: "Gemelo", reps: "7-10", sets: 2 },
      { id: "p1_3", name: "Isquio", reps: "8-10", sets: 2 },
      { id: "p1_4", name: "Sentadilla v1", reps: "4-6", sets: 2 },
      { id: "p1_5", name: "Sentadilla v2", reps: "7-9", sets: 1 },
      { id: "p1_6", name: "Extensión cuádriceps", reps: "8-10", sets: 2 },
    ],
  },
  torso2: {
    name: "Torso 2",
    exercises: [
      { id: "t2_1", name: "Remo espalda completa", reps: "6-8", sets: 2 },
      { id: "t2_2", name: "Press inclinado", reps: "5-8", sets: 2 },
      { id: "t2_3", name: "Jalón analítico", reps: "6-8", sets: 2 },
      { id: "t2_4", name: "Aperturas pecho", reps: "8-10", sets: 2 },
      { id: "t2_5", name: "Vuelos laterales v2", reps: "6-8", sets: 2 },
      { id: "t2_6", name: "Bíceps", reps: "8-10", sets: 2 },
      { id: "t2_7", name: "Tríceps", reps: "7-10", sets: 2 },
      { id: "t2_8", name: "Trapecio", reps: "10", sets: 2 },
    ],
  },
  pierna2: {
    name: "Pierna 2",
    exercises: [
      { id: "p2_1", name: "Aductor", reps: "7-10", sets: 2 },
      { id: "p2_2", name: "Gemelo", reps: "7-10", sets: 2 },
      { id: "p2_3", name: "Peso muerto", reps: "4-6", sets: 1 },
      { id: "p2_4", name: "Sentadilla", reps: "6-8", sets: 2 },
      { id: "p2_5", name: "Extensión cuádriceps", reps: "8-10", sets: 2 },
      { id: "p2_6", name: "Isquio", reps: "8-10", sets: 2 },
    ],
  },
};

const MODALITIES = ["Barra", "Mancuerna", "Máquina", "Polea", "Cuerpo"];

export default function App() {
  const [tab, setTab] = useState("nutricion");
  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-2xl font-medium tracking-tight">Martin</h1>
          <p className="text-neutral-500 text-sm mt-1">110 → 90 kg · julio</p>
        </header>
        <nav className="flex gap-6 mb-10 text-sm border-b border-neutral-200">
          <TabBtn active={tab === "nutricion"} onClick={() => setTab("nutricion")}>Nutrición</TabBtn>
          <TabBtn active={tab === "gimnasio"} onClick={() => setTab("gimnasio")}>Gimnasio</TabBtn>
        </nav>
        {tab === "nutricion" ? <NutritionTab /> : <GymTab />}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return <button onClick={onClick} className={`pb-3 -mb-px border-b transition ${active ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-700"}`}>{children}</button>;
}

function NutritionTab() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState(() => new Date().toISOString().split("T")[0]);
  const [weight, setWeight] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [trained, setTrained] = useState(false);
  const [sessionKey, setSessionKey] = useState(null);
  const [notes, setNotes] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("nutrition_logs").select("*").order("date", { ascending: true });
    if (data) {
      setEntries(data);
      const te = data.find(e => e.date === today);
      if (te) fill(te);
    }
    setLoading(false);
  }

  function fill(e) {
    setWeight(e.weight ?? ""); setKcal(e.kcal ?? ""); setProtein(e.protein ?? "");
    setTrained(e.trained ?? false); setSessionKey(e.session_key ?? null); setNotes(e.notes ?? "");
  }

  function reset() {
    setWeight(""); setKcal(""); setProtein(""); setTrained(false); setSessionKey(null); setNotes("");
  }

  async function save() {
    if (!weight && !kcal && !protein) return;
    const entry = { date: today, weight: weight ? parseFloat(weight) : null, kcal: kcal ? parseInt(kcal) : null, protein: protein ? parseInt(protein) : null, trained, session_key: sessionKey, notes };
    await supabase.from("nutrition_logs").upsert(entry, { onConflict: "date" });
    await load();
  }

  async function del(date) {
    await supabase.from("nutrition_logs").delete().eq("date", date);
    setEntries(entries.filter(e => e.date !== date));
    if (date === today) reset();
  }

  function changeDate(d) {
    setToday(d);
    const e = entries.find(x => x.date === d);
    if (e) fill(e); else reset();
  }

  function pickSession(key) {
    if (key === null) { setTrained(false); setSessionKey(null); }
    else if (key === "otro") { setTrained(true); setSessionKey(null); }
    else { setTrained(true); setSessionKey(key); }
  }

  const weightE = entries.filter(e => e.weight != null);
  const latest = weightE.length ? weightE[weightE.length - 1].weight : TARGETS.startWeight;
  const toGo = (latest - TARGETS.goalWeight).toFixed(1);
  const daysLeft = Math.ceil((TARGETS.deadline - new Date()) / (1000 * 60 * 60 * 24));
  const last7 = entries.slice(-7);
  const avgK = last7.filter(e => e.kcal).length ? Math.round(last7.filter(e => e.kcal).reduce((s, e) => s + e.kcal, 0) / last7.filter(e => e.kcal).length) : null;
  const avgP = last7.filter(e => e.protein).length ? Math.round(last7.filter(e => e.protein).reduce((s, e) => s + e.protein, 0) / last7.filter(e => e.protein).length) : null;
  const chartData = weightE.map(e => ({ date: e.date.slice(5), weight: e.weight }));

  const recent = weightE.slice(-14);
  let pace = null, projection = null;
  if (recent.length >= 2) {
    const a = recent[0], b = recent[recent.length - 1];
    const days = Math.max(1, (new Date(b.date) - new Date(a.date)) / (1000 * 60 * 60 * 24));
    pace = ((a.weight - b.weight) / days) * 7;
    projection = (latest - (pace * (daysLeft / 7))).toFixed(1);
  }

  let streak = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (e.kcal != null && e.protein != null && e.kcal <= TARGETS.kcal && e.protein >= TARGETS.protein) streak++;
    else break;
  }

  if (loading) return <p className="text-sm text-neutral-400">Cargando...</p>;

  return (
    <>
      <section className="grid grid-cols-4 gap-6 mb-4 text-sm">
        <Metric label="Faltan" value={toGo} unit="kg" />
        <Metric label="Ritmo" value={pace != null ? pace.toFixed(2) : "—"} unit={pace != null ? "kg/sem" : ""} />
        <Metric label="kcal 7d" value={avgK ?? "—"} sub="/ 2400" />
        <Metric label="prot 7d" value={avgP ?? "—"} sub="/ 200g" />
      </section>

      {projection != null && (
        <p className="text-xs text-neutral-400 mb-12">
          Proyección 1 jul: <span className="text-neutral-700">{projection} kg</span>
          {parseFloat(projection) <= TARGETS.goalWeight ? " ✓ en ritmo" : " · falta ajustar"}
        </p>
      )}

      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-6">
          <div className="flex items-baseline gap-3">
            <h2 className="text-sm font-medium">Hoy</h2>
            {streak > 0 && <span className="text-xs text-neutral-500">🔥 {streak}d</span>}
          </div>
          <input type="date" value={today} onChange={(e) => changeDate(e.target.value)} className="text-sm text-neutral-500 bg-transparent outline-none" />
        </div>
        <div className="space-y-4">
          <Row label="Peso" value={weight} onChange={setWeight} unit="kg" step="0.1" />
          <Row label="Calorías" value={kcal} onChange={setKcal} unit="kcal" />
          <Row label="Proteína" value={protein} onChange={setProtein} unit="g" />
          <div className="py-3 border-b border-neutral-100">
            <div className="text-sm text-neutral-600 mb-2">Entrené</div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {(() => {
                const current = !trained ? null : (sessionKey ?? "otro");
                const opts = [
                  { k: null, label: "No" },
                  ...Object.entries(SESSIONS).map(([k, s]) => ({ k, label: s.name })),
                  { k: "otro", label: "Otro" },
                ];
                return opts.map(o => (
                  <button
                    key={o.k ?? "none"}
                    onClick={() => pickSession(o.k)}
                    className={`px-2.5 py-1 rounded transition ${current === o.k ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"}`}
                  >
                    {o.label}
                  </button>
                ));
              })()}
            </div>
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas" className="w-full text-sm text-neutral-700 placeholder-neutral-400 bg-transparent outline-none resize-none pt-2" rows="2" />
        </div>
        <button onClick={save} className="mt-6 w-full text-sm py-3 bg-neutral-900 text-white rounded-full hover:bg-neutral-700 transition">Guardar</button>
      </section>

      {chartData.length > 1 && (
        <section className="mb-12">
          <h2 className="text-sm font-medium mb-4">Peso</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: "6px", fontSize: "12px" }} />
                <ReferenceLine y={90} stroke="#a3a3a3" strokeDasharray="2 2" />
                <Line type="monotone" dataKey="weight" stroke="#171717" strokeWidth={1.5} dot={{ fill: "#171717", r: 2.5, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-medium mb-4">Historial</h2>
        {entries.length === 0 ? <p className="text-sm text-neutral-400">—</p> : (
          <div className="divide-y divide-neutral-100">
            {[...entries].reverse().slice(0, 14).map(e => (
              <div key={e.date} className="flex items-center justify-between py-3 text-sm group">
                <div className="flex items-center gap-5">
                  <span className="font-mono text-neutral-400 w-12 text-xs">{e.date.slice(5)}</span>
                  <div className="flex gap-4 text-neutral-700">
                    {e.weight && <span>{e.weight}kg</span>}
                    {e.kcal && <span className="text-neutral-500">{e.kcal}</span>}
                    {e.protein && <span className="text-neutral-500">{e.protein}g</span>}
                    {e.trained && (
                      <span className="text-neutral-900 text-xs">
                        {e.session_key ? SESSIONS[e.session_key]?.name : "●"}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => del(e.date)} className="text-neutral-300 hover:text-neutral-700 opacity-0 group-hover:opacity-100 transition text-xs">borrar</button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-neutral-400 mt-6">{daysLeft} días restantes</p>
      </section>
    </>
  );
}

function GymTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("workouts").select("*").order("date", { ascending: false });
    if (data) setSessions(data.map(d => ({ ...d, exercises: d.exercises || [] })));
    setLoading(false);
  }

  async function saveSession(session) {
    await supabase.from("workouts").upsert({
      id: `${session.date}_${session.sessionKey}`,
      date: session.date,
      session_key: session.sessionKey,
      exercises: session.exercises,
    }, { onConflict: "id" });
    await load();
    setActive(null);
  }

  async function deleteSession(id) {
    await supabase.from("workouts").delete().eq("id", id);
    await load();
  }

  if (loading) return <p className="text-sm text-neutral-400">Cargando...</p>;
  if (active) return <ActiveSession session={active} previousSessions={sessions.map(s => ({ ...s, sessionKey: s.session_key }))} onSave={saveSession} onCancel={() => setActive(null)} />;

  return (
    <>
      <section className="mb-12">
        <h2 className="text-sm font-medium mb-4">Empezar</h2>
        <div className="divide-y divide-neutral-100 border-t border-b border-neutral-100">
          {Object.entries(SESSIONS).map(([key, s]) => {
            const last = sessions.find(x => x.session_key === key);
            return (
              <button key={key} onClick={() => setActive({
                date: new Date().toISOString().split("T")[0],
                sessionKey: key,
                exercises: s.exercises.map(e => ({ id: e.id, name: e.name, sets: [] })),
              })} className="w-full flex items-center justify-between py-4 text-sm text-left hover:bg-neutral-50 transition -mx-2 px-2 rounded">
                <div>
                  <div className="text-neutral-900">{s.name}</div>
                  <div className="text-xs text-neutral-400 mt-0.5">{s.exercises.length} ejercicios</div>
                </div>
                <div className="text-xs text-neutral-400">{last ? last.date.slice(5) : "—"}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium mb-4">Historial</h2>
        {sessions.length === 0 ? <p className="text-sm text-neutral-400">—</p> : (
          <div className="divide-y divide-neutral-100">
            {sessions.slice(0, 15).map(s => {
              const totalSets = (s.exercises || []).reduce((n, e) => n + (e.sets?.length || 0), 0);
              return (
                <div key={s.id} className="flex items-center justify-between py-3 text-sm group">
                  <div className="flex items-center gap-5">
                    <span className="font-mono text-neutral-400 w-12 text-xs">{s.date.slice(5)}</span>
                    <span className="text-neutral-700">{SESSIONS[s.session_key]?.name}</span>
                    <span className="text-neutral-400 text-xs">{totalSets} series</span>
                  </div>
                  <button onClick={() => deleteSession(s.id)} className="text-neutral-300 hover:text-neutral-700 opacity-0 group-hover:opacity-100 transition text-xs">borrar</button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

function ActiveSession({ session, previousSessions, onSave, onCancel }) {
  const [exercises, setExercises] = useState(session.exercises);
  const def = SESSIONS[session.sessionKey];

  function addSet(exIdx, set) {
    const updated = [...exercises];
    updated[exIdx] = { ...updated[exIdx], sets: [...updated[exIdx].sets, set] };
    setExercises(updated);
  }

  function removeSet(exIdx, setIdx) {
    const updated = [...exercises];
    updated[exIdx] = { ...updated[exIdx], sets: updated[exIdx].sets.filter((_, i) => i !== setIdx) };
    setExercises(updated);
  }

  function getLastFor(exId) {
    for (const s of previousSessions) {
      const ex = (s.exercises || []).find(e => e.id === exId);
      if (ex && ex.sets && ex.sets.length > 0) return { date: s.date, sets: ex.sets };
    }
    return null;
  }

  function getPRFor(exId) {
    let pr = null;
    for (const s of previousSessions) {
      const ex = (s.exercises || []).find(e => e.id === exId);
      if (!ex || !ex.sets) continue;
      for (const set of ex.sets) {
        if (set.weight != null && (pr == null || set.weight > pr.weight)) {
          pr = { weight: set.weight, reps: set.reps, date: s.date };
        }
      }
    }
    return pr;
  }

  function handleSave() {
    if (!exercises.some(e => e.sets.length > 0)) return;
    onSave({ date: session.date, sessionKey: session.sessionKey, exercises });
  }

  return (
    <>
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h2 className="text-lg font-medium">{def.name}</h2>
          <p className="text-xs text-neutral-400 mt-0.5">{session.date}</p>
        </div>
        <div className="flex gap-4 text-sm">
          <button onClick={onCancel} className="text-neutral-400 hover:text-neutral-700 transition">Cancelar</button>
          <button onClick={handleSave} className="text-neutral-900 font-medium">Guardar</button>
        </div>
      </div>
      <div className="space-y-8">
        {exercises.map((ex, idx) => {
          const defEx = def.exercises.find(e => e.id === ex.id);
          const last = getLastFor(ex.id);
          const pr = getPRFor(ex.id);
          return <ExerciseBlock key={ex.id} exercise={ex} def={defEx} last={last} pr={pr} onAdd={(s) => addSet(idx, s)} onRemove={(i) => removeSet(idx, i)} />;
        })}
      </div>
    </>
  );
}

function ExerciseBlock({ exercise, def, last, pr, onAdd, onRemove }) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [modality, setModality] = useState("Máquina");
  const [unilateral, setUnilateral] = useState(false);

  useEffect(() => {
    if (last && last.sets.length > 0) {
      const ls = last.sets[last.sets.length - 1];
      setModality(ls.modality || "Máquina");
      setUnilateral(ls.unilateral || false);
    }
  }, [last]);

  function add() {
    if (!weight || !reps) return;
    onAdd({ weight: parseFloat(weight), reps: parseInt(reps), modality, unilateral });
    setWeight(""); setReps("");
  }

  return (
    <div className="border-b border-neutral-100 pb-6">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-sm font-medium">{exercise.name}</h3>
        <span className="text-xs text-neutral-400">{def.sets} × {def.reps}</span>
      </div>
      {pr && (
        <p className="text-xs text-neutral-500 mb-1">
          PR <span className="text-neutral-900 font-medium">{pr.weight}kg</span>
          <span className="text-neutral-400"> × {pr.reps} · {pr.date.slice(5)}</span>
        </p>
      )}
      {last && (
        <p className="text-xs text-neutral-400 mb-3">
          {last.date.slice(5)} ·{" "}
          {last.sets.map((s, i) => (
            <span key={i}>{i > 0 && " · "}{s.weight}×{s.reps}{s.unilateral && "u"}</span>
          ))}
        </p>
      )}
      {exercise.sets.length > 0 && (
        <div className="space-y-1 mb-3">
          {exercise.sets.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1 text-sm group">
              <span className="text-neutral-700">
                <span className="text-neutral-400 mr-3 font-mono text-xs">{i + 1}</span>
                {s.weight}kg × {s.reps}
                <span className="text-neutral-400 text-xs ml-2">{s.modality}{s.unilateral && " · unilat"}</span>
              </span>
              <button onClick={() => onRemove(i)} className="text-neutral-300 hover:text-neutral-700 opacity-0 group-hover:opacity-100 transition text-xs">×</button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 mb-2">
        <input type="number" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="kg" className="flex-1 text-sm py-2 px-3 border border-neutral-200 rounded outline-none focus:border-neutral-900 transition" />
        <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="reps" className="flex-1 text-sm py-2 px-3 border border-neutral-200 rounded outline-none focus:border-neutral-900 transition" />
        <button onClick={add} className="px-4 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-700 transition">+</button>
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs">
        {MODALITIES.map(m => (
          <button key={m} onClick={() => setModality(m)} className={`px-2 py-1 rounded transition ${modality === m ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"}`}>{m}</button>
        ))}
        <button onClick={() => setUnilateral(!unilateral)} className={`px-2 py-1 rounded transition ${unilateral ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"}`}>Unilateral</button>
      </div>
    </div>
  );
}

function Metric({ label, value, unit, sub }) {
  return (
    <div>
      <div className="text-xs text-neutral-400 mb-1">{label}</div>
      <div className="text-2xl font-light tracking-tight text-neutral-900">
        {value}
        {unit && <span className="text-sm text-neutral-400 ml-1">{unit}</span>}
      </div>
      {sub && <div className="text-xs text-neutral-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function Row({ label, value, onChange, unit, step }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-neutral-100">
      <span className="text-sm text-neutral-600">{label}</span>
      <div className="flex items-baseline gap-1">
        <input type="number" step={step || "1"} value={value} onChange={(e) => onChange(e.target.value)} placeholder="—" className="text-sm text-right w-20 bg-transparent outline-none text-neutral-900" />
        <span className="text-xs text-neutral-400">{unit}</span>
      </div>
    </div>
  );
}
