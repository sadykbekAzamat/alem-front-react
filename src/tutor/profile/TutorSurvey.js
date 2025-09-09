// Survey.js
import { useEffect, useMemo, useState, useRef } from "react";
import api from "../../utils/apiClient";
import upload from "../../assets/img/upload.png";
import plus from "../../assets/img/plus.png";
import down from "../../assets/img/down.svg";
import toast from "react-hot-toast";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// tiny icons (optional; remove if you don't use lucide-react)
import { Upload as UploadIcon, Loader2, Plus as PlusIcon, Trash2, CheckCircle2 } from "lucide-react";

/** ==================================================================== */
/**                       MAIN COMPONENT (3 steps)                        */
/** ==================================================================== */
export default function TutorSurvey() {
  const API = process.env.REACT_APP_API;

  // ---------- step gating ----------
  // step: 1 (survey) | 2 (video) | 3 (schedule) | 'pending' | 'done'
  const [step, setStep] = useState(null);
  const [me, setMe] = useState(null);
  const [tutor, setTutor] = useState(null);
  const [bootError, setBootError] = useState("");

  // ---------- Step 1 state (your original) ----------
  const [university, setUniversity] = useState("");
  const [certificates, setCertificates] = useState([]); // File[] or string[]
  const [subject, setSubject] = useState("");
  const [subsections, setSubsections] = useState([{ name: "", price: "" }]);
  const [experience, setExperience] = useState("");
  const [saving, setSaving] = useState(false);

  // Universities
  const [institutions, setInstitutions] = useState([]); // [{id, name}]
  const [uniLoading, setUniLoading] = useState(false);
  const [uniError, setUniError] = useState("");

  // Subjects
  const [subjects, setSubjects] = useState([]); // [{id, label}]
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState("");

  // Subsections
  const [subOptions, setSubOptions] = useState([]); // [{id, label}]
  const [subsLoading, setSubsLoading] = useState(false);
  const [subsError, setSubsError] = useState("");

  // ---------- Step 2 state (video) ----------
  const [videoLink, setVideoLink] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [videoBusy, setVideoBusy] = useState(false);
  const fileInputRef = useRef(null);

  // ---------- Step 3 state (schedule) ----------
  const [scheduleState, setScheduleState] = useState(null); // populated after boot

  /** -------------------------------- Boot: who am I? which step? -------------------------------- */
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setBootError("");
        // 1) me
        const r1 = await api.get(`${API}/api/v1/auth/me`, { signal: ac.signal });
        if (!r1.ok) throw new Error(`auth/me ${r1.status}`);
        const j1 = await r1.json();
        const user = j1?.user || j1?.data?.user || j1?.data || {};
        if (!user?.id) throw new Error("No user id");
        setMe(user);

        // 2) tutor
        const r2 = await api.get(`${API}/api/v1/tutors/${user.id}`, { signal: ac.signal });
        if (!r2.ok) throw new Error(`tutors/:id ${r2.status}`);
        const t = await r2.json();
        setTutor(t);

        // Prefill easy bits for UX
        if (t?.universityId) setUniversity(t.universityId);
        if (typeof t?.yearsExperience === "number") setExperience(String(t.yearsExperience));
        if (Array.isArray(t?.certificateUrls) && t.certificateUrls.length) {
          setCertificates(t.certificateUrls); // keep as strings (already URLs)
        }
        if (t?.videoUrl) setVideoLink(t.videoUrl);
        setScheduleState(normalizeScheduleForState(t?.schedule));

        // Decide step
        const sections = t?.sections ?? [];
        const videoUrl = (t?.videoUrl || "").trim();
        const schedule = t?.schedule ?? [];
        if (!sections.length) setStep(1);
        else if (!videoUrl) setStep(2);
        else if (!schedule.length) setStep(3);
        else if (t?.verification === "pending") setStep("pending");
        else if (t?.verification === "verified") setStep("verified");
        else setStep("verified");
      } catch (e) {
        console.error(e);
        setBootError("Не удалось загрузить статус анкеты. Обновите страницу.");
        setStep(1); // allow user to start anyway
      }
    })();
    return () => ac.abort();
  }, [API]);

  /** -------------------------------- Load dictionaries (universities, subjects, subsections) -------------------------------- */
  useEffect(() => {
    const ac = new AbortController();
    const fetchInstitutions = async () => {
      setUniLoading(true);
      setUniError("");
      try {
        const res = await api.get(`${API}/api/v1/admin/universities`, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list = Array.isArray(json?.data)
          ? json.data.filter((it) => it?.name).map((it) => ({ id: it.id, name: it.name }))
          : [];
        setInstitutions(list);
      } catch (err) {
        if (err.name !== "AbortError") setUniError("Не удалось загрузить список ВУЗов.");
      } finally {
        setUniLoading(false);
      }
    };
    fetchInstitutions();
    return () => ac.abort();
  }, [API]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setSubjectsLoading(true);
      setSubjectsError("");
      try {
        const res = await api.get(`https://alem-api.pp.ua/api/v1/admin/sections`, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list = Array.isArray(json?.data)
          ? json.data.map((s) => ({ id: s.id, label: s?.name?.ru || s?.name?.kz || s?.name?.en || s.slug }))
          : [];
        setSubjects(list);
      } catch (err) {
        if (err.name !== "AbortError") setSubjectsError("Не удалось загрузить предметы.");
      } finally {
        setSubjectsLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (!subject) {
      setSubOptions([]);
      return;
    }
    const ac = new AbortController();
    (async () => {
      setSubsLoading(true);
      setSubsError("");
      try {
        const res = await api.get(
          `https://alem-api.pp.ua/api/v1/admin/subsections?subjectId=${encodeURIComponent(subject)}`,
          { signal: ac.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list = Array.isArray(json?.data)
          ? json.data.map((ss) => ({
              id: ss.id,
              label: ss?.name?.ru || ss?.name?.kz || ss?.name?.en || ss.slug,
            }))
          : [];
        setSubOptions(list);
        // cleanup invalid picks
        setSubsections((prev) =>
          prev.map((row) => ({ ...row, name: list.some((o) => o.id === row.name) ? row.name : "" }))
        );
      } catch (err) {
        if (err.name !== "AbortError") setSubsError("Не удалось загрузить подразделы.");
      } finally {
        setSubsLoading(false);
      }
    })();
    return () => ac.abort();
  }, [subject]);

  /** -------------------------------- Step 1 helpers -------------------------------- */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setCertificates((prev) => [...prev, ...files].slice(0, 6));
  };
  const addSubsection = () => setSubsections((prev) => [...prev, { name: "", price: "" }]);
  const updateSubsection = (idx, key, value) =>
    setSubsections((prev) => prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
  const removeCertificate = (idx) => setCertificates((prev) => prev.filter((_, i) => i !== idx));

  const uniOptions = useMemo(() => {
    if (uniLoading) return [{ id: "__loading", name: "Загрузка..." }];
    if (uniError) return [{ id: "__error", name: "Ошибка загрузки" }];
    return institutions;
  }, [uniLoading, uniError, institutions]);

  const uploadToShared = async (file) => {
    const ext = (file.name?.split(".").pop() || "bin").toLowerCase();
    const generated = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const r = ref(storage, `shared/${generated}`);
    await uploadBytes(r, file);
    return getDownloadURL(r);
  };
  const toMinor = (v) => {
    const n = parseFloat(String(v).replace(",", "."));
    if (!isFinite(n) || n <= 0) return null;
    return Math.round(n * 100);
  };
  const TEACHING_URL = `${(API || "https://alem-api.pp.ua").replace(/\/+$/, "")}/api/v1/tutors/profile/teaching`;

  const handleSaveStep1 = async () => {
    try {
      if (!university) return toast.error("Выберите учебное заведение");
      if (!subject) return toast.error("Выберите предмет");
      const validSections = subsections
        .map((row) => ({ subsectionId: row.name, hourlyRateMinor: toMinor(row.price) }))
        .filter((r) => r.subsectionId && r.hourlyRateMinor !== null);
      if (!validSections.length) return toast.error("Добавьте хотя бы один подраздел и цену");
      const years = parseInt(experience, 10);
      if (!Number.isFinite(years) || years < 0) return toast.error("Укажите стаж (целое число)");

      setSaving(true);
      toast.dismiss();

      const certUploads = await Promise.all(
        certificates.map(async (c) => (typeof c === "string" ? c : c instanceof File ? uploadToShared(c) : null))
      );
      const certifications = certUploads.filter(Boolean);

      const body = {
        universityId: university,
        yearsExperience: years,
        certifications,
        sections: validSections.map((s) => ({
          sectionId: subject,
          subsectionId: s.subsectionId,
          hourlyRateMinor: s.hourlyRateMinor,
          trialRateMinor: 0,
          currency: "KZT",
          level: "Pro",
        })),
      };

      const res = await api.put(TEACHING_URL, body);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }

      toast.success("Шаг 1 сохранен. Перейдем к видео.");
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error("Не удалось сохранить данные");
    } finally {
      setSaving(false);
    }
  };

  /** -------------------------------- Step 2 helpers (video) -------------------------------- */
  const pickVideo = () => fileInputRef.current?.click();
  const onVideoFile = (f) => {
    if (!f) return;
    const sizeMb = f.size / (1024 * 1024);
    if (sizeMb > 200) {
      toast.error("Файл слишком большой (макс 200MB).");
      return;
    }
    setVideoFile(f);
    setVideoPreview(URL.createObjectURL(f));
  };
  const uploadVideoToFirebase = async () => {
    const ext = (videoFile?.name?.split(".").pop() || "mp4").toLowerCase();
    const key = `shared/videos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const r = ref(storage, key);
    await uploadBytes(r, videoFile);
    return getDownloadURL(r);
  };
  const saveVideo = async () => {
    try {
      if (!videoLink && !videoFile) {
        toast.error("Добавьте ссылку или загрузите видео-файл.");
        return;
      }
      setVideoBusy(true);
      let finalUrl = (videoLink || "").trim();
      if (!finalUrl) finalUrl = await uploadVideoToFirebase();
      const res = await api.put(`${API}/api/v1/tutors/profile/video`, { videoUrl: finalUrl });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }
      toast.success("Видео сохранено. Теперь настроим расписание.");
      setStep(3);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сохранить видео");
    } finally {
      setVideoBusy(false);
    }
  };

  /** -------------------------------- Step 3 helpers (schedule) -------------------------------- */
  // Build fresh default on first render if boot hasn't provided one:
  useEffect(() => {
    if (!scheduleState) setScheduleState(buildDefault());
  }, [scheduleState]);

  const setDay = (key, patch) => setScheduleState((p) => ({ ...p, [key]: { ...p[key], ...patch } }));
  const addSlot = (key) =>
    setScheduleState((p) => {
      const day = p[key];
      const last = day.slots[day.slots.length - 1];
      const ns = last ? last.start : "09:00";
      const ne = last ? last.end : "17:00";
      return { ...p, [key]: { ...day, slots: [...day.slots, { start: ns, end: ne }] } };
    });
  const removeSlot = (key, idx) =>
    setScheduleState((p) => {
      const day = p[key];
      const next = day.slots.filter((_, i) => i !== idx);
      return { ...p, [key]: { ...day, slots: next.length ? next : [{ start: "09:00", end: "17:00" }] } };
    });

  const invalidSchedule = useMemo(
    () =>
      DAYS.some(({ key }) => scheduleState?.[key]?.enabled &&
        scheduleState[key].slots.some((s) => toMin(s.start) >= toMin(s.end))),
    [scheduleState]
  );

  const saveSchedule = async () => {
    try {
      if (!scheduleState) return;
      if (invalidSchedule) {
        toast.error("Интервалы времени заданы неверно.");
        return;
      }
      const days = DAYS.map(({ key }) => ({
        day: key,
        slots: scheduleState[key].enabled
          ? scheduleState[key].slots
              .filter((s) => toMin(s.start) < toMin(s.end))
              .map((s) => ({ start: s.start, end: s.end }))
          : [],
      })).filter((d) => d.slots.length);

      const res = await api.put(`${API}/api/v1/tutors/profile/schedule`, { days });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }
      toast.success("Расписание сохранено.");
      // Typically verification = pending after all steps
      setStep("pending");
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сохранить расписание");
    }
  };

  /** -------------------------------- RENDER -------------------------------- */
  if (bootError && step === null) {
    return <div className="p-6 text-red-600">{bootError}</div>;
  }
  if (step === null) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-600">
        <div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Загрузка…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <main className="w-full max-w-[960px] mx-auto">
        <StepsHeader step={step} />
        {step === 1 && (
          <>
            <h1 className="text-2xl font-muller font-bold text-gray-900 mb-6">
              Уровень владения предметом, который вы преподаете?
            </h1>

            {/* ВУЗ */}
            <label className="block text-sm font-muller text-gray-900">Где вы обучались?</label>
            <div className="relative mt-1">
              <select
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full appearance-none rounded-xl bg-blue-50 px-3 py-2 pr-9 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                disabled={uniLoading || !!uniError}
              >
                <option value="">Выберите учебное заведение</option>
                {uniOptions.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <img className="h-5 w-5 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" alt="" src={down} />
            </div>
            {uniError && <div className="mt-1 text-xs text-red-600">{uniError} Попробуйте обновить страницу.</div>}

            {/* Сертификаты */}
            <div className="mt-6">
              <label className="block text-sm font-muller text-gray-900 mb-2">Загрузите сертификаты</label>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" multiple onChange={handleFileChange} className="hidden" id="certUpload" />
              <label htmlFor="certUpload" className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 hover:bg-gray-100">
                <img src={upload} alt="upload" className="w-6 h-6" />
                <span className="text-sm text-gray-700">Вы можете загрузить до 6 сертификатов. Максимальный размер 20МБ</span>
              </label>
              {/* Selected certificates */}
              <ul className="mt-3 flex flex-wrap gap-2">
                {certificates.map((file, idx) => (
                  <li key={idx} className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700" title={typeof file === "string" ? file : file.name}>
                    <span className="truncate max-w-[220px]">{typeof file === "string" ? file : file.name}</span>
                    <button type="button" onClick={() => removeCertificate(idx)} className="ml-1 grid h-5 w-5 place-items-center rounded-full bg-gray-300/60 text-gray-700 hover:bg-gray-400" aria-label="Удалить" title="Удалить">×</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Предмет */}
            <div className="mt-8">
              <label className="block text-sm font-muller text-gray-900">Какой предмет вы преподаете?</label>
              <div className="relative mt-1">
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full appearance-none rounded-xl bg-blue-50 px-3 py-2 pr-9 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  disabled={subjectsLoading || !!subjectsError}
                >
                  <option value="">Выберите предмет</option>
                  {subjectsLoading && <option value="">Загрузка...</option>}
                  {subjectsError && <option value="">Ошибка загрузки</option>}
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <img className="h-5 w-5 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" alt="" src={down} />
              </div>
              {subjectsError && <div className="mt-1 text-xs text-red-600">{subjectsError} Попробуйте обновить страницу.</div>}
            </div>

            {/* Подразделы */}
            <div className="mt-6">
              <h2 className="text-sm font-muller font-medium text-gray-900 mb-2">Подразделы</h2>
              {subsections.map((row, idx) => (
                <div key={idx} className="flex gap-3 mb-3">
                  <div className="relative flex-1">
                    <select
                      value={row.name}
                      onChange={(e) => updateSubsection(idx, "name", e.target.value)}
                      className="w-full appearance-none rounded-xl bg-blue-50 px-3 py-2 pr-9 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                      disabled={!subject || subsLoading || !!subsError}
                    >
                      <option value="">
                        {subject ? (subsLoading ? "Загрузка подразделов..." : subsError ? "Ошибка загрузки" : "Выберите подраздел") : "Сначала выберите предмет"}
                      </option>
                      {subOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                    <img className="h-5 w-5 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" alt="" src={down} />
                  </div>
                  <input type="number" placeholder="Цена" value={row.price} onChange={(e) => updateSubsection(idx, "price", e.target.value)} className="w-32 rounded-xl bg-blue-50 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <button type="button" onClick={addSubsection} className="mt-1 text-sm inline-flex items-center gap-2 text-blue-700 hover:text-blue-800">
                <img alt="add" className="h-4 w-4" src={plus} /> Добавить подраздел
              </button>
              {subsError && <div className="mt-2 text-xs text-red-600">{subsError} Попробуйте ещё раз после выбора предмета.</div>}
            </div>

            {/* Стаж */}
            <div className="mt-8">
              <label className="block text-sm font-muller text-gray-900 mb-1">Укажите ваш стаж преподавания в годах</label>
              <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} className="mt-1 w-full rounded-xl bg-blue-50 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500" placeholder="Например: 5" />
            </div>

            {/* Кнопки */}
            <div className="mt-10 flex gap-4">
              <button onClick={handleSaveStep1} disabled={saving} className="rounded-full bg-blue-600 text-white font-muller font-medium py-3 px-6 hover:bg-blue-700 disabled:bg-blue-300">
                {saving ? "Сохранение..." : "Сохранить и продолжить"}
              </button>
              <button className="rounded-full border-2 border-gray-300 text-gray-700 font-muller font-medium py-3 px-6 hover:bg-gray-50">Отмена</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-3xl font-extrabold text-center mb-6">Загрузите видео-презентацию</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preview */}
              <div className="rounded-2xl border p-3">
                <div className="aspect-[9/16] w-64 mx-auto overflow-hidden rounded-xl bg-black/90 text-white grid place-items-center">
                  {videoPreview || videoLink ? (
                    <video src={videoPreview || videoLink} className="h-full w-full object-cover" controls />
                  ) : (
                    <div className="text-center text-sm opacity-80 p-4">Предпросмотр появится здесь</div>
                  )}
                </div>
              </div>

              {/* Uploader */}
              <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6 grid place-items-center text-center">
                <UploadIcon className="h-8 w-8 text-gray-500 mb-2" />
                <div className="text-gray-700 text-sm mb-2">Максимум 200MB (mp4, mov)</div>
                <button onClick={() => fileInputRef.current?.click()} className="rounded-full bg-blue-600 px-5 py-2 text-white font-medium hover:bg-blue-700 disabled:bg-blue-300" disabled={videoBusy}>
                  Выбрать файл
                </button>
                <input ref={fileInputRef} type="file" accept=".mp4,.mov,video/mp4,video/quicktime" className="hidden" onChange={(e) => onVideoFile(e.target.files?.[0])} />
                <div className="my-4 text-xs text-gray-500">— или —</div>
                <div className="w-full max-w-sm">
                  <label className="block text-left text-sm text-gray-700 mb-1">Ссылка (YouTube и т.д.)</label>
                  <input value={videoLink} onChange={(e) => setVideoLink(e.target.value)} placeholder="https://youtu.be/abc123" className="w-full rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            <VideoRules />

            <div className="mt-6 flex justify-center">
              <button onClick={saveVideo} disabled={videoBusy} className="rounded-full bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 disabled:bg-blue-300">
                {videoBusy ? "Сохранение…" : "Продолжить"}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-3xl font-extrabold text-center mb-6">Кесте / Расписание</h1>

            {!scheduleState ? (
              <div className="text-gray-600"><Loader2 className="h-4 w-4 inline animate-spin" /> Загрузка…</div>
            ) : (
              <div className="space-y-4">
                {DAYS.map(({ key, kk }) => {
                  const day = scheduleState[key];
                  return (
                    <div key={key} className="grid grid-cols-[60px_1fr_auto] items-start gap-4">
                      {/* toggle */}
                      <button
                        type="button"
                        onClick={() => setDay(key, { enabled: !day.enabled })}
                        className={["relative inline-flex h-7 w-12 items-center rounded-full transition-colors", day.enabled ? "bg-blue-600" : "bg-gray-300"].join(" ")}
                      >
                        <span className={["inline-block h-5 w-5 transform rounded-full bg-white transition", day.enabled ? "translate-x-6" : "translate-x-1"].join(" ")} />
                      </button>

                      <div className="flex flex-wrap items-center gap-4">
                        <div className="w-32 text-gray-900 font-medium">{kk}</div>
                        {day.slots.map((slot, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <TimeSelect
                              value={slot.start}
                              disabled={!day.enabled}
                              onChange={(val) => setDay(key, { slots: day.slots.map((s, i) => (i === idx ? { ...s, start: val } : s)) })}
                            />
                            <span className="text-gray-500 text-sm">до</span>
                            <TimeSelect
                              value={slot.end}
                              disabled={!day.enabled}
                              onChange={(val) => setDay(key, { slots: day.slots.map((s, i) => (i === idx ? { ...s, end: val } : s)) })}
                            />
                            <button type="button" disabled={!day.enabled} onClick={() => removeSlot(key, idx)} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 border border-gray-300 hover:bg-gray-50 disabled:opacity-50" title="Удалить">
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                        <button type="button" disabled={!day.enabled} onClick={() => addSlot(key)} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 border border-gray-300 hover:bg-gray-50 disabled:opacity-50" title="Добавить">
                          <PlusIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <button onClick={saveSchedule} disabled={invalidSchedule} className={["rounded-full px-6 py-3 text-white font-medium", invalidSchedule ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"].join(" ")}>
                Сохранить расписание
              </button>
            </div>
          </>
        )}

        {step === "pending" && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
            <h2 className="text-xl font-bold text-amber-800 mb-2">Вы находитесь в рассмотрении</h2>
            <p className="text-amber-800/90">Ваш профиль отправлен на модерацию. Мы уведомим вас, когда проверка завершится.</p>
          </div>
        )}

        {step === "verified" && (
          <div className="rounded-2xl border border-green-300 bg-green-50 p-6">
            <h2 className="text-xl font-bold text-green-800 mb-2">Профиль готов!</h2>
            <p className="text-green-800/90">Все шаги завершены.</p>
          </div>
        )}
      </main>
    </div>
  );
}

/** ==================================================================== */
/**                        Small subcomponents                            */
/** ==================================================================== */

function StepsHeader({ step }) {
  const items = [
    { k: 1, label: "Пән" },
    { k: 2, label: "Видео" },
    { k: 3, label: "Кесте" },
    { k: 4, label: "Модерация" },
  ];
  const done = (k) => (step === "pending" || step === "verified") ? k <= 3 : typeof step === "number" && k < step;
  return (
    <div className="mb-8 flex items-center justify-center gap-8">
      {items.map((it, i) => (
        <div key={it.k} className="flex items-center gap-3">
          <div className={[
            "h-8 w-8 rounded-full grid place-items-center border-2 text-sm font-semibold",
            done(it.k) ? "bg-green-50 border-green-600 text-green-700" :
            step === it.k ? "bg-blue-600 border-blue-600 text-white" :
            "bg-gray-100 border-gray-300 text-gray-500"
          ].join(" ")}>
            {done(it.k) ? <CheckCircle2 className="h-5 w-5" /> : it.k}
          </div>
          <div className={["text-sm", step === it.k ? "text-blue-700 font-semibold" : "text-gray-600"].join(" ")}>
            {it.label}
          </div>
          {i < items.length - 1 && <div className="w-16 h-0.5 bg-gray-200" />}
        </div>
      ))}
    </div>
  );
}

function VideoRules() {
  return (
    <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-gray-700">
      <div className="font-semibold mb-2">Требования к видео:</div>
      <ul className="list-disc pl-5 space-y-1">
        <li>Длительность от 30 секунд до 1.5 минут</li>
        <li>Снимайте в вертикальном формате</li>
        <li>Тихое окружение и четкий звук</li>
        <li>Лицо хорошо видно</li>
        <li>Не указывайте ФИО и номер телефона</li>
      </ul>
    </div>
  );
}

/** --------------------------- Schedule utils -------------------------- */
const DAYS = [
  { key: "mon", kk: "Дүйсенбі" },
  { key: "tue", kk: "Сейсенбі" },
  { key: "wed", kk: "Сәрсенбі" },
  { key: "thu", kk: "Бейсенбі" },
  { key: "fri", kk: "Жұма" },
  { key: "sat", kk: "Сенбі" },
  { key: "sun", kk: "Жексенбі" },
];
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});
function TimeSelect({ value, onChange, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "appearance-none rounded-full bg-white px-4 py-2 pr-8 text-sm text-gray-900",
          "border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
          disabled && "opacity-60 cursor-not-allowed",
        ].join(" ")}
      >
        {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500">
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 111.06 1.06l-4.24 3.36a.75.75 0 01-.94 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd"/>
      </svg>
    </div>
  );
}
function toMin(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function defaultDay() { return { enabled: false, slots: [{ start: "09:00", end: "17:00" }] }; }
function buildDefault() { return DAYS.reduce((a, d) => ((a[d.key] = defaultDay()), a), {}); }
function normalizeScheduleForState(schedule) {
  const base = buildDefault();
  if (!Array.isArray(schedule)) return base;
  for (const d of schedule) {
    if (!DAYS.some((x) => x.key === d.day)) continue;
    base[d.day] = {
      enabled: Array.isArray(d.slots) && d.slots.length > 0,
      slots: Array.isArray(d.slots) && d.slots.length > 0 ? d.slots : [{ start: "09:00", end: "17:00" }],
    };
  }
  return base;
}
