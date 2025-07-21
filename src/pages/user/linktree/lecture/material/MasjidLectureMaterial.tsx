import React, { useState } from "react";
import LectureMaterialMonthList from "@/components/pages/lecture/LectureMonthList";
import LectureMaterialList from "@/components/pages/lecture/LectureMaterialList";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { useNavigate, useParams } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/common/main/Tabs";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

type LectureSessionAPIItem = {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_session_teacher_name: string;
  lecture_session_start_time: string;
  lecture_session_place: string;
  lecture_session_image_url: string;
  lecture_session_approved_by_dkm_at: string | null;
  lecture_session_lecture_id: string;
  lecture_title: string;
};

type LectureMaterialItem = {
  id: string;
  title: string;
  teacher: string;
  masjidName: string;
  location: string;
  time: string;
  status: "tersedia" | "proses";
  lectureId: string;
};

type LectureTheme = {
  lecture_id: string;
  lecture_title: string;
  lecture_total_sessions: number;
};

const monthData = [
  { month: "Januari", total: 12 },
  { month: "Februari", total: 12 },
  { month: "Maret", total: 12 },
];

export default function MasjidLectureMaterial() {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [tab, setTab] = useState("terbaru");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const navigate = useNavigate();
  const { slug = "" } = useParams();

  const { data: kajianList, isLoading: loadingKajian } = useQuery<
    LectureSessionAPIItem[]
  >({
    queryKey: ["kajianListBySlug", slug],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-u/soal-materi/${slug}`
      );
      console.log("✅ Response data lecture sessions:", res.data);
      return res.data?.data ?? [];
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: lectureThemes = [], isLoading: loadingThemes } = useQuery<
    LectureTheme[]
  >({
    queryKey: ["lectureThemesBySlug", slug],
    queryFn: async () => {
      const res = await axios.get(`/public/lectures/slug/${slug}`);
      console.log("📚 Tema kajian:", res.data.data);
      return res.data?.data ?? [];
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const mappedMaterial: LectureMaterialItem[] =
    kajianList?.map((item) => ({
      id: item.lecture_session_id,
      title: item.lecture_session_title,
      teacher: item.lecture_session_teacher_name,
      masjidName: "", // optional, bisa ambil dari masjid jika disediakan
      location: item.lecture_session_place,
      time: new Date(item.lecture_session_start_time).toLocaleString("id-ID", {
        dateStyle: "long",
        timeStyle: "short",
      }),
      status: item.lecture_session_approved_by_dkm_at ? "tersedia" : "proses",
      lectureId: item.lecture_session_lecture_id,
    })) ?? [];

  const filteredByTheme = mappedMaterial.filter(
    (item) => selectedTheme === "" || item.lectureId === selectedTheme
  );

  return (
    <div className="p-4 space-y-4 pb-20">
      <PageHeaderUser
        title="Soal & Materi Kajian"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { label: "Terbaru", value: "terbaru" },
          { label: "Tema", value: "tema" },
          { label: "Tanggal", value: "tanggal" },
        ]}
      />

      <TabsContent value="terbaru" current={tab}>
        {loadingKajian ? (
          <p>Memuat data...</p>
        ) : (
          <LectureMaterialList data={mappedMaterial} />
        )}
      </TabsContent>

      <TabsContent value="tanggal" current={tab}>
        {selectedMonth ? (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedMonth(null)}
              className="text-sm text-primary font-medium"
            >
              ← Kembali ke daftar bulan
            </button>
            <h2 className="text-base font-semibold">Bulan {selectedMonth}</h2>
            <LectureMaterialList data={mappedMaterial} />
          </div>
        ) : (
          <LectureMaterialMonthList
            data={monthData}
            onSelectMonth={setSelectedMonth}
          />
        )}
      </TabsContent>

      <TabsContent value="tema" current={tab}>
        <div className="space-y-3">
          <h2 className="text-sm font-medium">Daftar Tema Kajian</h2>

          {loadingThemes ? (
            <p>Memuat tema kajian...</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTheme("")}
                className={`px-3 py-1 rounded border text-sm ${
                  selectedTheme === ""
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white"
                }`}
              >
                Semua Tema
              </button>

              {lectureThemes.map((theme) => (
                <button
                  key={theme.lecture_id}
                  onClick={() => setSelectedTheme(theme.lecture_id)}
                  className={`px-3 py-1 rounded border text-sm ${
                    selectedTheme === theme.lecture_id
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white"
                  }`}
                >
                  {theme.lecture_title}
                </button>
              ))}
            </div>
          )}

          <LectureMaterialList data={filteredByTheme} />
        </div>
      </TabsContent>
    </div>
  );
}
