import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@/lib/axios";
import axios, { AxiosError } from "axios";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";

declare global {
  interface Window {
    snap: any;
  }
}

const MasjidDonationConfirmMasjid = () => {
  const [searchParams] = useSearchParams();
  const { isDark } = useHtmlDarkMode();
  const masjidDonation = Number(searchParams.get("masjid")) || 0;
  const masjidkuDonation = Number(searchParams.get("masjidku")) || 0;
  const [donationName, setDonationName] = useState("");
  const [donationMessage, setDonationMessage] = useState("");

  const fee = 4000;
  const total = masjidDonation + masjidkuDonation + fee;
  const navigate = useNavigate();

  const themeColors = isDark ? colors.dark : colors.light;

  const format = (n: number) =>
    `Rp ${new Intl.NumberFormat("id-ID").format(n)}`;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", "Mid-client-l1lXV0xwBLRhI_62");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    const masjidIdFromUrl = searchParams.get("masjid_id");
    if (!masjidIdFromUrl || masjidIdFromUrl.length !== 36) {
      alert("Masjid ID tidak valid atau tidak ditemukan.");
      return;
    }

    const donationData = {
      donation_amount: total,
      donation_masjid_id: masjidIdFromUrl,
      donation_name: donationName,
      donation_message: donationMessage,
    };

    try {
      const response = await api.post("/public/donations", donationData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 200) {
        const snapToken = response.data.snap_token;

        if (window.snap) {
          window.snap.pay(snapToken, {
            onSuccess: () => navigate("/donation-success"),
            onPending: () => alert("Pembayaran sedang diproses..."),
            onError: () => alert("Pembayaran gagal. Silakan coba lagi."),
          });
        } else {
          alert("Payment system not ready. Please refresh the page.");
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const message =
            error.response.data?.error ||
            error.response.data?.message ||
            "Server error";
          alert(`❌ Server Error (${error.response.status}): ${message}`);
        } else if (error.request) {
          alert("❌ Network Error: Tidak dapat terhubung ke server");
        } else {
          alert(`❌ Request Error: ${error.message}`);
        }
      } else {
        alert("❌ Unknown Error");
      }
    }
  };

  return (
    <>
      <PageHeaderUser
        title="Donasi Saya"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      <div className="max-w-md mx-auto">
        <p className="text-sm mb-3" style={{ color: themeColors.black2 }}>
          Berikut adalah rincian donasi detail
        </p>

        <div
          className="overflow-x-auto rounded border"
          style={{ borderColor: themeColors.silver1 }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: themeColors.white2,
                  color: themeColors.black1,
                }}
              >
                <th className="p-3">No</th>
                <th className="p-3">Deskripsi</th>
                <th className="p-3 text-right">Rincian</th>
              </tr>
            </thead>
            <tbody style={{ color: themeColors.black1 }}>
              <tr>
                <td className="p-3">1</td>
                <td className="p-3">Nominal Donasi</td>
                <td className="p-3 text-right">{format(masjidDonation)}</td>
              </tr>
              <tr>
                <td className="p-3">2</td>
                <td className="p-3">Biaya Transaksi</td>
                <td className="p-3 text-right">{format(fee)}</td>
              </tr>
              <tr>
                <td className="p-3">3</td>
                <td className="p-3">Dukungan Perkembangan Aplikasi</td>
                <td className="p-3 text-right">{format(masjidkuDonation)}</td>
              </tr>
              <tr
                className="font-semibold"
                style={{ backgroundColor: themeColors.success2 }}
              >
                <td className="p-3" colSpan={2}>
                  Total Transfer
                </td>
                <td className="p-3 text-right">{format(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p
          className="text-xs leading-relaxed"
          style={{ color: themeColors.silver2 }}
        >
          * Biaya transaksi digunakan untuk kebutuhan sistem pembayaran.
          <br />* Dukungan perkembangan aplikasi digunakan untuk operasional dan
          pengembangan fitur Masjidku.
        </p>
      </div>

      <div className="mt-4 max-w-md mx-auto space-y-3">
        <input
          type="text"
          placeholder="Nama Anda (opsional)"
          value={donationName}
          onChange={(e) => setDonationName(e.target.value)}
          className="w-full p-3 rounded-md border text-sm outline-none transition-all duration-200"
          style={{
            borderColor: themeColors.silver1,
            backgroundColor: themeColors.white1,
            color: themeColors.black1,
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = themeColors.primary)
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = themeColors.silver1)
          }
        />
        <textarea
          placeholder="Ucapan atau pesan (opsional)"
          value={donationMessage}
          onChange={(e) => setDonationMessage(e.target.value)}
          className="w-full p-3 rounded-md border text-sm outline-none transition-all duration-200"
          rows={3}
          style={{
            borderColor: themeColors.silver1,
            backgroundColor: themeColors.white1,
            color: themeColors.black1,
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = themeColors.primary)
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = themeColors.silver1)
          }
        />
      </div>

      <div
        className="fixed bottom-0 left-0 w-full px-4 py-4 border-t shadow-md"
        style={{
          backgroundColor: themeColors.white1,
          borderColor: themeColors.silver1,
        }}
      >
        <div className="max-w-xl mx-auto">
          <button
            onClick={handlePayment}
            className="w-full py-3 rounded font-semibold"
            style={{
              backgroundColor: themeColors.primary,
              color: themeColors.white1,
            }}
          >
            Lanjut
          </button>
        </div>
      </div>
    </>
  );
};

export default MasjidDonationConfirmMasjid;
