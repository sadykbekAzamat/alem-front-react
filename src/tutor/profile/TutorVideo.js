// src/pages/tutor/TutorVideo.js
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/apiClient";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const MAX_MB = 200;
const ACCEPT = ["video/mp4", "video/quicktime"]; // MP4, MOV

export default function TutorVideo() {
  const API = process.env.REACT_APP_API;

  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const inputRef = useRef(null);

  // Получаем текущий видео-URL
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setBootError("");
        const r1 = await api.get(`${API}/api/v1/auth/me`);
        if (!r1.ok) throw new Error(`auth/me ${r1.status}`);
        const j1 = await r1.json();
        const user = j1?.user || j1?.data?.user || j1?.data || {};
        if (!user?.id) throw new Error("Нет user id");

        const r2 = await api.get(`${API}/api/v1/tutors/${user.id}`);
        if (!r2.ok) throw new Error(`tutors/:id ${r2.status}`);
        const t = await r2.json();
        if (!alive) return;
        setVideoUrl((t?.videoUrl || "").trim());
      } catch (e) {
        console.error(e);
        if (alive) setBootError("Не удалось загрузить данные. Обновите страницу.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [API]);

  const pick = () => inputRef.current?.click();

  const validateFile = (file) => {
    if (!file) return "Файл не выбран";
    if (!ACCEPT.includes(file.type)) return "Загрузите видео в формате MP4 или MOV";
    const mb = file.size / (1024 * 1024);
    if (mb > MAX_MB) return `Файл слишком большой. Максимум ${MAX_MB} МБ`;
    return "";
  };

  const uploadToShared = async (file) => {
    const ext = (file.name?.split(".").pop() || "mp4").toLowerCase();
    const key = `shared/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const r = ref(storage, key);
    await uploadBytes(r, file);
    return getDownloadURL(r);
  };

  const onFile = async (file) => {
    const err = validateFile(file);
    if (err) return toast.error(err);

    try {
      setUploading(true);
      const url = await uploadToShared(file);
      setVideoUrl(url);
      toast.success("Видео загружено");
    } catch (e) {
      console.error(e);
      toast.error("Не удалось загрузить видео");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    onFile(e.dataTransfer.files?.[0]);
  };
  const onChange = (e) => onFile(e.target.files?.[0]);

  const isVideoPlayable = (u) =>
    /\.mp4($|\?)/i.test(u) || /\.mov($|\?)/i.test(u) || /firebasestorage/i.test(u);

  const handleSave = async () => {
    if (!videoUrl) return toast.error("Сначала загрузите видео");
    try {
      setSaving(true);
      const res = await api.put(
        `${API.replace(/\/+$/, "")}/api/v1/tutors/profile/video`,
        { videoUrl }
      );
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `HTTP ${res.status}`);
      }
      toast.success("Сохранено");
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="px-6 py-6 text-gray-600">Загрузка…</div>;
  if (bootError) return <div className="px-6 py-6 text-red-600">{bootError}</div>;

  return (
    <div className="px-6 py-6">
      <h1 className="text-xl md:text-xl font-muller font-bold mb-4">
        Загрузите видео-презентацию
      </h1>

      <div className="max-w-4xl grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
        <div className="rounded-2xl bg-white p-2">
          {videoUrl ? (
            <div>
              {isVideoPlayable(videoUrl) ? (
                <video
                  className="w-[160px] md:w-[200px] aspect-[9/16] rounded-2xl bg-black"
                  controls
                  src={videoUrl}
                />
              ) : (
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-[300px] md:w-[340px] aspect-[9/16] rounded-2xl bg-gray-100 grid place-items-center text-blue-600 underline"
                >
                  Открыть: {videoUrl}
                </a>
              )}
              <button
                type="button"
                onClick={pick}
                className="mt-3 text-blue-700 hover:text-blue-800 underline"
              >
                Выбрать другое видео
              </button>
            </div>
          ) : (
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className="w-[300px] md:w-[340px] aspect-[9/16] rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 grid place-items-center text-center p-4"
            >
              <div>
                <div className="text-3xl mb-2">⬆️</div>
                <div className="text-xs text-gray-600 mb-2">
                  Размер файла до 200&nbsp;МБ (MP4, MOV)
                </div>
                <button
                  type="button"
                  onClick={pick}
                  disabled={uploading}
                  className="text-blue-700 hover:text-blue-800 underline disabled:opacity-60"
                >
                  Выбрать файл
                </button>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".mp4,.mov,video/mp4,video/quicktime"
            className="hidden"
            onChange={onChange}
          />
        </div>

        {/* Требования */}
        <div className="rounded-2xl bg-blue-50 p-5 w-fit">
          <div className="flex items-center gap-2 text-blue-900 font-bold mb-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs">i</span>
            Требования к видео
          </div>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-800 text-sm">
            <li>Длительность: от 30 секунд до 1,5 минут.</li>
            <li>Снимайте вертикально.</li>
            <li>Поставьте телефон на устойчивую поверхность.</li>
            <li>Лицо и глаза должны быть хорошо видны.</li>
            <li>Не называйте полное ФИО или номер телефона.</li>
          </ul>
          <a
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-3 text-blue-700 underline text-sm"
          >
            Пример видео
          </a>
        </div>
      </div>

      {/* Кнопка сохранить (без «назад») */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={!videoUrl || uploading || saving}
          className={`rounded-full px-6 py-2.5 text-white font-muller font-medium ${
            !videoUrl || uploading || saving
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
      </div>
    </div>
  );
}
