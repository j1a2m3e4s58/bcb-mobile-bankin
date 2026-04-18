import { useAuthStore } from "@/store/auth-store";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect } from "react";

export default function SplashPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ to: isAuthenticated ? "/dashboard" : "/login" });
    }, 3000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex items-center justify-center min-h-dvh desktop-bg">
      <div
        className="mobile-frame relative overflow-hidden flex flex-col items-center justify-center"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.45 0.14 148) 0%, oklch(0.34 0.11 148) 55%, oklch(0.24 0.08 148) 100%)",
        }}
        data-ocid="splash.page"
      >
        {/* Decorative circles */}
        <motion.div
          className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full"
          style={{ background: "oklch(0.99 0.002 0 / 0.07)" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <motion.div
          className="absolute bottom-[-60px] left-[-60px] w-52 h-52 rounded-full"
          style={{ background: "oklch(0.76 0.16 70 / 0.12)" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
        />
        <motion.div
          className="absolute top-[28%] right-[-40px] w-36 h-36 rounded-full"
          style={{ background: "oklch(0.76 0.16 70 / 0.07)" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.0, ease: "easeOut", delay: 0.4 }}
        />

        {/* Logo + bank name — spring scale+fade */}
        <motion.div
          className="flex flex-col items-center gap-7 z-10"
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 18,
            duration: 1,
          }}
        >
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center shadow-elevated overflow-hidden"
            style={{
              background: "oklch(0.99 0.002 0 / 0.12)",
              backdropFilter: "blur(8px)",
              border: "1px solid oklch(0.99 0.002 0 / 0.22)",
            }}
          >
            <img
              src="/assets/bcb-logo.png"
              alt="BCB Logo"
              className="w-full h-full rounded-full object-cover drop-shadow-lg"
            />
          </div>

          {/* Bank name fades in after 0.5s */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
          >
            <h1
              className="text-2xl font-bold tracking-wide font-display"
              style={{ color: "oklch(0.99 0.002 0)" }}
            >
              Bawjiase Community Bank
            </h1>
            {/* Tagline in gold after 0.8s */}
            <motion.p
              className="mt-2 text-sm font-semibold tracking-widest uppercase font-body"
              style={{ color: "oklch(0.76 0.16 70)" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
            >
              Leaders in Innovation
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Animated loading dots */}
        <motion.div
          className="absolute bottom-16 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full block"
              style={{ background: "oklch(0.99 0.002 0 / 0.55)" }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.15, 0.8] }}
              transition={{
                duration: 1.1,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>

        {/* Bottom tagline */}
        <motion.p
          className="absolute bottom-8 text-xs font-body"
          style={{ color: "oklch(0.99 0.002 0 / 0.45)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          Your trusted banking partner in Ghana
        </motion.p>
      </div>
    </div>
  );
}
