import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/dkm/setting/faq/FaqPage.tsx
import { useState } from 'react';
import FaqItem from './AdminFaqItem';
import FaqCategorySidebar from './AdminFaqCategorySidebar';
import useHtmlDarkMode from '@/hooks/userHTMLDarkMode';
import { colors } from '@/constants/colorsThema';
const dummyFaqs = [
    {
        question: 'Bagi pemula tingkat mana yang sebaiknya dipilih?',
        answer: 'Mengimani rukun iman harus sesuai dalil dari Al-Qur\'an dan Sunnah sebab agama islam dibangun dari tawaqquf yaitu seluruh ibadah membutuhkan dalil dan menjalankan rukun ...',
        category: 'general',
    },
    {
        question: 'Apakah pemula bisa mengikuti kelas penuntut ilmu?',
        answer: 'Bisa, dengan niat dan mengikuti aturan kelas yang berlaku ...',
        category: 'news',
    },
    {
        question: 'Jika sudah memilih salah satu tingkatan. Apakah bisa memilih lagi?',
        answer: 'Selama belum terdaftar permanen, peserta masih bisa memilih ulang tingkat yang lebih sesuai dengan kondisi masing-masing ...',
        category: 'news',
    },
];
export default function Faq() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const { isDark } = useHtmlDarkMode();
    const theme = isDark ? colors.dark : colors.light;
    const filtered = selectedCategory === 'all'
        ? dummyFaqs
        : dummyFaqs.filter((faq) => faq.category === selectedCategory);
    return (_jsxs("div", { className: "flex flex-col md:flex-row gap-4 p-6 rounded-xl shadow-sm", style: { backgroundColor: theme.white1, color: theme.black1 }, children: [_jsx("div", { className: "w-full md:w-1/4", children: _jsx(FaqCategorySidebar, { categories: ['all', 'general', 'news'], selected: selectedCategory, onSelect: setSelectedCategory }) }), _jsx("div", { className: "flex-1 space-y-4", children: filtered.map((faq, i) => (_jsx(FaqItem, { number: i + 1, question: faq.question, answer: faq.answer }, i))) })] }));
}
