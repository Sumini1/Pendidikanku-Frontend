import { jsx as _jsx } from "react/jsx-runtime";
import { pickTheme } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
export default function StatusBadge({ text, variant }) {
    const { isDark, themeName } = useHtmlDarkMode();
    const theme = pickTheme(themeName, isDark);
    const variants = {
        info: {
            bg: theme.primary2,
            text: theme.primary,
        },
        success: {
            bg: theme.success2,
            text: theme.success1,
        },
        error: {
            bg: theme.error2,
            text: theme.error1,
        },
        warning: {
            bg: theme.warning1 + "33", // transparan
            text: theme.warning1,
        },
        secondary: {
            bg: theme.silver1,
            text: theme.silver2,
        },
        default: {
            bg: theme.silver1,
            text: theme.black1,
        },
    };
    const { bg, text: textColor } = variants[variant] || variants.default;
    return (_jsx("span", { className: "px-2 py-0.5 text-xs rounded font-medium whitespace-nowrap", style: { backgroundColor: bg, color: textColor }, children: text }));
}
