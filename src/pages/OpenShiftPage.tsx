import { useEffect, useState } from "react";
import { BsFingerprint } from "react-icons/bs";
import { FiMapPin, FiLoader } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useMutate from "@/hooks/useMutate";
import { useAuth } from "@/context/AuthContext";

interface Coords {
  latitude: number;
  longitude: number;
}

const OpenShiftPage = () => {
  const navigate = useNavigate();
  const { user, setShiftOpen } = useAuth();
  const isReceptionist = user?.type === "receptionist";
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [initialBalance, setInitialBalance] = useState("500");



  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("المتصفح مايدعمش تحديد الموقع");
      setLocating(false);
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "لازم تسمح بالوصول لموقعك عشان تقدر تفتح الشفت"
            : "تعذّر تحديد موقعك الحالي، حاول تاني"
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const { mutate, isLoading } = useMutate({
    endpoint: "shifts/open",
    method: "post",
    mutationKey: ["shift-open"],
    successMessage: "تم فتح الشفت بنجاح، بالتوفيق في يومك!",
    onSuccess: () => {
      setShiftOpen(true);
      navigate("/", { replace: true });
    },
  });

  const handleOpenShift = () => {
    if (!coords) {
      toast.error("لازم نحدد موقعك الحالي الأول");
      requestLocation();
      return;
    }
    
  if (isReceptionist && (!initialBalance || Number(initialBalance) < 0)) {
    toast.error("من فضلك أدخل الرصيد الافتتاحي");
    return;
  }
  mutate({
    initial_balance: isReceptionist ? Number(initialBalance || 0) : 0,
    latitude: coords.latitude,
    longitude: coords.longitude,
  });
  };


  const mapSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords.longitude - 0.006}%2C${coords.latitude - 0.006
    }%2C${coords.longitude + 0.006}%2C${coords.latitude + 0.006}&layer=mapnik&marker=${coords.latitude
    }%2C${coords.longitude}`
    : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 font-display text-xl font-extrabold text-white">
            س
          </span>
          <h1 className="font-display text-xl font-extrabold text-ink">
            أهلاً {user?.name ?? ""} 👋
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            لازم تفتح الشفت الأول عشان تقدر تستخدم النظام
          </p>
        </div>

        <div className="card overflow-hidden">
          <div className="relative h-48 w-full bg-mint-100">
            {mapSrc ? (
              <iframe
                title="موقعك الحالي"
                src={mapSrc}
                className="h-full w-full border-0"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink/40">
                {locating ? (
                  <>
                    <FiLoader className="animate-spin" size={22} />
                    <span className="text-xs font-bold">جاري تحديد موقعك...</span>
                  </>
                ) : (
                  <>
                    <FiMapPin size={22} />
                    <span className="px-6 text-center text-xs font-bold">
                      {locationError ?? "لم يتم تحديد الموقع"}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 p-5">
            {coords && (
              <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-ink/45">
                <FiMapPin size={13} />
                {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
              </p>
            )}

            {locationError && (
              <button
                type="button"
                onClick={requestLocation}
                className="text-center text-xs font-bold text-coral-600 underline"
              >
                {locationError} — إعادة المحاولة
              </button>
            )}
            {isReceptionist && (
              <div>
                <label htmlFor="initial_balance" className="field-label text-center">
                  الرصيد الافتتاحي (ج.م)
                </label>
                <input
                  id="initial_balance"
                  type="number"
                  min={0}
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="field-input text-center text-lg font-extrabold"
                />
              </div>
            )}

            <div className="mt-2 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleOpenShift}
                disabled={isLoading || locating || !coords}
                aria-label="فتح الشفت"
                className="group relative flex h-24 w-24 items-center justify-center rounded-full bg-primary-500 text-white shadow-soft transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-30 group-disabled:hidden" />
                {isLoading ? (
                  <FiLoader className="relative animate-spin" size={34} />
                ) : (
                  <BsFingerprint className="relative" size={40} />
                )}
              </button>
              <p className="text-sm font-bold text-ink/60">
                {isLoading
                  ? "جاري فتح الشفت..."
                  : locating
                    ? "بنحدد موقعك الحالي..."
                    : "دوس على البصمة لفتح الشفت"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenShiftPage;