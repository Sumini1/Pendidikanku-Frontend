import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from "react";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { pickTheme } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import FormattedDate from "@/constants/formattedDate";
import parse from "html-react-parser";
import cleanTranscriptHTML from "@/constants/cleanTransciptHTML";
export default function MasjidSummaryLectureSessions() {
    const { lecture_session_slug = "", slug = "" } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark, themeName } = useHtmlDarkMode();
    const theme = pickTheme(themeName, isDark);
    const backUrl = useMemo(() => location.state?.from ||
        `/masjid/${slug}/soal-materi/${lecture_session_slug}`, [location.state?.from, slug, lecture_session_slug]);
    /** 1) Ambil ringkasan materi (sekalian ambil lecture_session_id untuk fallback) */
    const { data: materialData, isLoading: isLoadingSummary, isError: isErrorSummary, error: errorSummary, } = useQuery({
        queryKey: ["public-lecture-session-summary", lecture_session_slug],
        queryFn: async () => {
            const res = await axios.get("/public/lecture-sessions-materials/filter-slug", {
                params: { lecture_session_slug, type: "summary" },
            });
            const payload = res?.data;
            // Normalisasi struktur respons
            const first = Array.isArray(payload?.data)
                ? payload.data[0]
                : Array.isArray(payload?.data?.data)
                    ? payload.data.data[0]
                    : (payload ?? null);
            return first ?? null;
        },
        enabled: !!lecture_session_slug,
        staleTime: 5 * 60 * 1000,
        retry: (count, err) => err?.response?.status === 404 ? false : count < 2,
    });
    const materialSessionId = materialData?.lecture_sessions_material_lecture_session_id;
    /** 2) Ambil detail sesi: coba by-slug; kalau 404 dan kita punya ID dari material, fallback by-id */
    const { data: sessionDetail, isLoading: isLoadingSession, isError: isErrorSession, error: errorSession, } = useQuery({
        queryKey: [
            "lecture-session-detail",
            lecture_session_slug,
            materialSessionId,
        ],
        enabled: !!lecture_session_slug,
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            const url = `/public/lecture-sessions-u/by-slug/${encodeURIComponent(lecture_session_slug.trim())}`;
            try {
                const res = await axios.get(url);
                return { ...res.data, __via: "slug" };
            }
            catch (err) {
                const status = err?.response?.status;
                if (status === 404 && materialSessionId) {
                    const res2 = await axios.get(`/public/lecture-sessions-u/by-id/${materialSessionId}`);
                    return { ...res2.data, __via: "id" };
                }
                throw err;
            }
        },
        retry: (count, err) => err?.response?.status === 404 ? false : count < 2,
    });
    const summaryHTML = materialData?.lecture_sessions_material_summary ?? "";
    const isLoading = isLoadingSession || isLoadingSummary;
    const anyError = isErrorSession || isErrorSummary;
    return (_jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsx(PageHeaderUser, { title: "Materi Kajian", onBackClick: () => navigate(backUrl) }), _jsx("div", { className: "p-4 rounded-xl shadow-sm", style: { backgroundColor: theme.white1, color: theme.black1 }, children: isLoading ? (_jsx("p", { children: "Memuat data..." })) : anyError ? (_jsxs("div", { className: "text-sm", children: [isErrorSession && (_jsxs("p", { className: "text-red-500", children: ["Gagal memuat detail sesi kajian.", _jsxs("span", { className: "block text-xs opacity-70", children: [errorSession?.response?.status, " \u2014", " ", errorSession?.message] })] })), isErrorSummary && (_jsxs("p", { className: "text-red-500", children: ["Gagal memuat ringkasan kajian.", _jsxs("span", { className: "block text-xs opacity-70", children: [errorSummary?.response?.status, " \u2014", " ", errorSummary?.message] })] }))] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-1 mb-4", children: [_jsx("h2", { className: "text-base font-semibold text-sky-600", children: sessionDetail?.lecture_session_title || "-" }), _jsxs("p", { className: "text-sm text-gray-500", children: [sessionDetail?.lecture_session_start_time ? (_jsx(FormattedDate, { value: sessionDetail.lecture_session_start_time, fullMonth: true, className: "inline" })) : ("-"), " ", "/ ", sessionDetail?.lecture_session_place || "-"] }), _jsx("p", { className: "text-sm font-semibold", style: { color: theme.primary }, children: sessionDetail?.lecture_session_teacher_name || "-" }), sessionDetail?.__via === "id" && (_jsx("span", { className: "inline-block mt-1 text-[11px] px-2 py-0.5 rounded border", children: "loaded via ID (fallback)" }))] }), _jsx("div", { className: "space-y-4 text-sm leading-relaxed text-justify", style: { color: theme.black1 }, children: summaryHTML ? (_jsx("div", { className: "whitespace-pre-wrap text-sm text-justify leading-relaxed", children: parse(cleanTranscriptHTML(summaryHTML)) })) : (_jsx("p", { className: "italic text-gray-500", children: "Belum ada materi ringkasan tersedia." })) })] })) })] }));
}
