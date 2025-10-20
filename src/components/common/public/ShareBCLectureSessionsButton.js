import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Share2, X, Copy, MessageCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { pickTheme } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
const isValid = (v) => {
    if (!v)
        return false;
    const s = v.trim().toLowerCase();
    if (!s || s === "update")
        return false;
    return (s.startsWith("http") || s.startsWith("wa.me") || s.startsWith("maps.app"));
};
const formatTanggalId = (iso) => {
    if (!iso)
        return "-";
    const d = new Date(iso);
    const tgl = d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
    const jam = d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
    return `${tgl} • ${jam} WIB`;
};
export default function ShareBCLectureSessionsButton({ title, dateIso, teacher, place, url, buttonLabel = "Bagikan", className, variant = "primary", masjidSlug, socialLinks, prefetchOnHover = true, }) {
    const { isDark, themeName } = useHtmlDarkMode();
    const theme = pickTheme(themeName, isDark);
    const qc = useQueryClient();
    const [open, setOpen] = useState(false);
    const [copiedBC, setCopiedBC] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const shareUrl = useMemo(() => url || (typeof window !== "undefined" ? window.location.href : ""), [url]);
    /* ============== Lazy fetch data masjid dari slug ============== */
    const shouldFetch = open && !socialLinks && !!masjidSlug;
    const { data: masjid } = useQuery({
        queryKey: ["masjid-public", masjidSlug],
        enabled: shouldFetch,
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            const res = await axios.get(`/public/masjids/${masjidSlug}`);
            return res.data?.data;
        },
    });
    // prefetch saat hover
    const handleMouseEnter = async () => {
        if (!prefetchOnHover || !masjidSlug || socialLinks)
            return;
        await qc.prefetchQuery({
            queryKey: ["masjid-public", masjidSlug],
            staleTime: 5 * 60 * 1000,
            queryFn: async () => {
                const res = await axios.get(`/public/masjids/${masjidSlug}`);
                return res.data?.data;
            },
        });
    };
    // normalisasi field API → SocialLinks
    const normalizedFromApi = useMemo(() => {
        if (!masjid)
            return undefined;
        const website = masjid.masjid_domain
            ? masjid.masjid_domain.startsWith("http")
                ? masjid.masjid_domain
                : `https://${masjid.masjid_domain}`
            : undefined;
        return {
            maps: masjid.masjid_google_maps_url,
            instagram: masjid.masjid_instagram_url,
            whatsapp: masjid.masjid_whatsapp_url,
            youtube: masjid.masjid_youtube_url,
            facebook: masjid.masjid_facebook_url,
            tiktok: masjid.masjid_tiktok_url,
            groupIkhwan: masjid.masjid_whatsapp_group_ikhwan_url,
            groupAkhwat: masjid.masjid_whatsapp_group_akhwat_url,
            website,
        };
    }, [masjid]);
    const finalSocials = socialLinks ?? normalizedFromApi;
    const masjidName = masjid?.masjid_name;
    const socialsBlock = useMemo(() => {
        if (!finalSocials)
            return [];
        const lines = [];
        if (isValid(finalSocials.maps))
            lines.push(`🗺️ Maps: ${finalSocials.maps}`);
        if (isValid(finalSocials.whatsapp))
            lines.push(`💬 WhatsApp: ${finalSocials.whatsapp}`);
        if (isValid(finalSocials.groupIkhwan))
            lines.push(`👥 Grup Ikhwan: ${finalSocials.groupIkhwan}`);
        if (isValid(finalSocials.groupAkhwat))
            lines.push(`👩 Grup Akhwat: ${finalSocials.groupAkhwat}`);
        if (isValid(finalSocials.instagram))
            lines.push(`📸 Instagram: ${finalSocials.instagram}`);
        if (isValid(finalSocials.youtube))
            lines.push(`▶️ YouTube: ${finalSocials.youtube}`);
        if (isValid(finalSocials.facebook))
            lines.push(`📘 Facebook: ${finalSocials.facebook}`);
        if (isValid(finalSocials.tiktok))
            lines.push(`🎵 TikTok: ${finalSocials.tiktok}`);
        if (isValid(finalSocials.website))
            lines.push(`🌐 Website: ${finalSocials.website}`);
        return lines;
    }, [finalSocials]);
    const bcText = useMemo(() => {
        const waktu = formatTanggalId(dateIso);
        const lines = [
            `*${title || "Kajian Masjid"}*`,
            teacher ? `👤 Pemateri: *${teacher}*` : null,
            dateIso ? `🗓️ Waktu: ${waktu}` : null,
            place ? `📍 Tempat: ${place}` : null,
            "",
            "InsyaAllah kajian terbuka untuk umum. Yuk hadir & ajak keluarga/teman.",
            "",
            shareUrl ? `🔗 Info lengkap: ${shareUrl}` : null,
        ].filter(Boolean);
        if (socialsBlock.length) {
            lines.push("");
            lines.push(`Kontak & Sosial${masjidName ? ` — ${masjidName}` : ""}:`);
            lines.push(...socialsBlock);
        }
        lines.push("", "#KajianMasjid #MasjidKu");
        return lines.join("\n");
    }, [title, teacher, dateIso, place, shareUrl, socialsBlock, masjidName]);
    // copy helpers
    const copy = useCallback(async (text, set) => {
        try {
            await navigator.clipboard.writeText(text);
            set(true);
            setTimeout(() => set(false), 1500);
        }
        catch {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            set(true);
            setTimeout(() => set(false), 1500);
        }
    }, []);
    const handleCopyBC = () => copy(bcText, setCopiedBC);
    const handleCopyLink = () => copy(shareUrl, setCopiedLink);
    const handleWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(bcText)}`, "_blank", "noopener,noreferrer");
    // lock scroll + esc close
    useEffect(() => {
        if (!open)
            return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);
    // trigger style
    const triggerStyle = variant === "primary"
        ? { backgroundColor: theme.primary, color: theme.white1 }
        : variant === "soft"
            ? {
                backgroundColor: theme.primary2,
                color: theme.primary,
                borderColor: theme.primary,
            }
            : {
                backgroundColor: "transparent",
                color: theme.primary,
                borderColor: theme.primary,
            };
    const triggerHasRing = variant !== "primary";
    return (_jsxs(_Fragment, { children: [_jsxs("button", { onMouseEnter: prefetchOnHover ? handleMouseEnter : undefined, onClick: () => setOpen(true), className: [
                    "inline-flex items-center gap-2 px-3 py-2 rounded-md font-medium hover:opacity-90 transition",
                    triggerHasRing ? "ring-1" : "",
                    className || "",
                ].join(" "), style: triggerStyle, "aria-label": "Bagikan kajian ini", children: [_jsx(Share2, { size: 16 }), _jsx("span", { children: buttonLabel })] }), open &&
                createPortal(_jsxs("div", { className: "fixed inset-0 z-[1000] flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 z-0", style: {
                                backgroundColor: "rgba(0,0,0,0.55)",
                                backdropFilter: "blur(2px)",
                            }, onClick: () => setOpen(false) }), _jsxs("div", { role: "dialog", "aria-modal": "true", className: "relative z-10 w-[92%] max-w-md rounded-xl p-4 shadow-lg space-y-3", style: {
                                backgroundColor: theme.white1,
                                borderColor: theme.white3,
                                color: theme.black1,
                            }, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-base font-semibold", style: { color: theme.primary }, children: "Bagikan Kajian" }), _jsx("button", { onClick: () => setOpen(false), className: "p-1 rounded hover:opacity-80", "aria-label": "Tutup modal", style: { color: theme.black1 }, children: _jsx(X, { size: 18 }) })] }), _jsx("div", { className: "rounded-md p-3 text-sm max-h-60 overflow-auto whitespace-pre-wrap", style: {
                                        backgroundColor: theme.white2,
                                        borderColor: theme.white3,
                                        color: theme.black1,
                                    }, children: bcText }), _jsxs("div", { className: "space-y-2", children: [_jsxs("button", { onClick: handleCopyBC, className: "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium hover:opacity-90 transition", style: {
                                                backgroundColor: theme.primary,
                                                color: theme.white1,
                                            }, children: [_jsx(Copy, { size: 16 }), _jsx("span", { children: copiedBC ? "Broadcast Tersalin!" : "Salin Broadcast" })] }), shareUrl && (_jsxs("button", { onClick: handleCopyLink, className: "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium ring-1 hover:opacity-90 transition", style: {
                                                backgroundColor: theme.white2,
                                                color: theme.black1,
                                                borderColor: theme.white3,
                                            }, children: [_jsx(Copy, { size: 16 }), _jsx("span", { children: copiedLink ? "Link Tersalin!" : "Salin Link Saja" })] })), _jsxs("button", { onClick: handleWhatsApp, className: "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium hover:opacity-90 transition", style: {
                                                backgroundColor: theme.secondary,
                                                color: theme.white1,
                                            }, children: [_jsx(MessageCircle, { size: 16 }), _jsx("span", { children: "Kirim via WhatsApp" })] })] })] })] }), document.body)] }));
}
