import React, { useContext } from "react";
import { MyContext } from "../contexts/MyContext";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

const Toaster = () => {
  const { toasts } = useContext(MyContext);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md transform transition-all duration-300 translate-y-0 scale-100 animate-slide-in ${
            t.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : t.type === "error"
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
              : "bg-sky-500/10 border-sky-500/20 text-sky-400"
          }`}
        >
          {t.type === "success" && <CheckCircle className="h-5 w-5 shrink-0" />}
          {t.type === "error" && <AlertTriangle className="h-5 w-5 shrink-0" />}
          {t.type !== "success" && t.type !== "error" && <Info className="h-5 w-5 shrink-0" />}
          
          <div className="flex-1 text-sm font-medium">{t.message}</div>
        </div>
      ))}
    </div>
  );
};

export default Toaster;
