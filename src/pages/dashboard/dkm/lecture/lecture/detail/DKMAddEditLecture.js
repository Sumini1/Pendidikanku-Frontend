import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import toast from "react-hot-toast";
import InputField from "@/components/common/main/InputField";
import RichEditor from "@/components/common/main/RichEditor";
import SubmitActionButtons from "@/components/common/main/SubmitActionButton";
import ShimmerImage from "@/components/common/main/ShimmerImage";
import { pickTheme } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
export default function DKMAddEditLecture() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams();
    const isEditMode = !!id;
    const { isDark, themeName } = useHtmlDarkMode();
    const theme = pickTheme(themeName, isDark);
    const [form, setForm] = useState({
        lecture_title: "",
        lecture_description: "",
        lecture_image_file: null,
        lecture_image_url: "",
    });
    const isFormValid = () => {
        return form.lecture_title.trim() && form.lecture_description.trim();
    };
    useEffect(() => {
        if (isEditMode) {
            console.log("[EditMode] Ambil data untuk ID:", id);
            axios.get(`/api/a/lectures/${id}`).then((res) => {
                const data = res.data.data; // ✅ ambil data sebenarnya
                console.log("[EditMode] Data diterima dari backend:", data);
                setForm({
                    lecture_title: data.lecture_title || "",
                    lecture_description: data.lecture_description || "",
                    lecture_image_file: null,
                    lecture_image_url: data.lecture_image_url || "",
                });
            });
        }
    }, [id]);
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            console.log("[Submit] Form data:", form);
            const data = new FormData();
            data.append("lecture_title", form.lecture_title);
            data.append("lecture_description", form.lecture_description);
            if (form.lecture_image_file) {
                console.log("[Submit] Gambar baru dilampirkan:", form.lecture_image_file);
                data.append("lecture_image_url", form.lecture_image_file);
            }
            const method = isEditMode ? axios.put : axios.post;
            const url = isEditMode ? `/api/a/lectures/${id}` : "/api/a/lectures";
            console.log("[Submit] Mengirim data ke:", url);
            const res = await method(url, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("[Submit] Respons backend:", res.data);
            return res.data;
        },
        onSuccess: () => {
            console.log("[Submit] Sukses simpan");
            toast.success(isEditMode
                ? "Berhasil mengubah tema kajian"
                : "Berhasil membuat tema kajian");
            queryClient.invalidateQueries({ queryKey: ["lectures"] });
            navigate("/dkm/tema");
        },
        onError: (err) => {
            console.error("[Submit] Gagal simpan:", err);
            toast.error("Gagal menyimpan tema kajian");
        },
    });
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm((prev) => ({
                ...prev,
                lecture_image_file: file,
                lecture_image_url: URL.createObjectURL(file),
            }));
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: isEditMode ? "Edit Tema Kajian" : "Buat Tema Kajian", onBackClick: () => history.back() }), _jsxs("form", { onSubmit: (e) => {
                    e.preventDefault();
                    mutate();
                }, className: "space-y-4", children: [_jsx(InputField, { label: "Judul Tema Kajian", name: "lecture_title", value: form.lecture_title, placeholder: "Contoh: Tafsir Surat Al-Fatihah", onChange: handleChange }), _jsx(RichEditor, { label: "Deskripsi Tema", value: form.lecture_description, onChange: (val) => setForm((prev) => ({
                            ...prev,
                            lecture_description: val,
                        })) }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-sm font-medium", style: { color: theme.black1 }, children: "Upload Gambar Tema" }), _jsx("input", { type: "file", accept: "image/*", onChange: handleFileChange, className: "block w-full text-sm rounded px-3 py-2", style: {
                                    backgroundColor: theme.white2,
                                    color: theme.black1,
                                    border: `1px solid ${theme.silver1}`,
                                } }), form.lecture_image_url && (_jsx(ShimmerImage, { src: form.lecture_image_url, alt: "Preview Gambar", className: "w-32 h-32 object-cover rounded mt-2", shimmerClassName: "rounded" }))] }), _jsx(SubmitActionButtons, { isPending: isPending, isEditMode: isEditMode, disabled: !isFormValid() })] })] }));
}
