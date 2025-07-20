import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { ArrowLeft } from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

export default function MasjidDetailLecture() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const {
    data: kajian,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["detail-agenda", id],
    queryFn: async () => {
      console.log("[🔁 FETCH] Meminta detail kajian dari API");
      const res = await axios.get(`/public/lecture-sessions-u/by-id/${id}`);
      return res.data;
    },
    enabled: !!id,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // cache 5 menit
  });

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  if (isLoading) return <p className="p-4">Memuat data...</p>;
  if (isError || !kajian)
    return (
      <p className="p-4 text-red-500">
        Gagal memuat data kajian. {String(error)}
      </p>
    );

  return (
    <div
      className="pb-20"
      style={{
        backgroundColor: themeColors.white1,
        color: themeColors.black1,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full"
          style={{ backgroundColor: themeColors.white2 }}
        >
          <ArrowLeft className="w-5 h-5" color={themeColors.black1} />
        </button>
        <h1 className="text-lg font-semibold">Detail Agenda</h1>
      </div>

      {/* Gambar Kajian */}
      <div className="px-4">
        <img
          src={
            kajian.lecture_session_image_url ||
            "/assets/placeholder/lecture.png"
          }
          alt={kajian.lecture_session_title}
          className="w-full rounded-xl mb-4"
        />
      </div>

      {/* Informasi Kajian */}
      <div className="px-4 space-y-4">
        <div>
          <h2
            className="text-base font-semibold"
            style={{ color: themeColors.quaternary }}
          >
            Informasi Kajian
          </h2>
          <ul className="text-sm space-y-1 mt-1">
            <li>
              📘 <strong>Materi:</strong> {kajian.lecture_session_title}
            </li>
            <li>
              👤 <strong>Pengajar:</strong>{" "}
              {kajian.lecture_session_teacher_name || "-"}
            </li>
            <li>
              🕒 <strong>Jadwal:</strong>{" "}
              {formatDate(kajian.lecture_session_start_time)}
            </li>
            <li>
              📍 <strong>Tempat:</strong> {kajian.lecture_session_place || "-"}
            </li>
          </ul>
        </div>

        {/* Keterangan Kajian */}
        <div>
          <h2
            className="text-base font-semibold"
            style={{ color: themeColors.quaternary }}
          >
            Keterangan
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: themeColors.black2 }}
          >
            {kajian.lecture_session_description ||
              "Tidak ada deskripsi yang tersedia."}
          </p>
        </div>
      </div>
    </div>
  );
}
