"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

export function LoadingAnimation() {
    const [loading, setLoading] = useState(true)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // Simulate initial load progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setTimeout(() => setLoading(false), 500)
                    return 100
                }
                return prev + 2
            })
        }, 30)

        return () => clearInterval(interval)
    }, [])

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="fixed inset-0 z-[9999] bg-[#0f172a] flex flex-col items-center justify-center p-6 overflow-hidden"
                >
                    {/* Animated Background Glow */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 4, repeat: Double.POSITIVE_INFINITY }}
                        className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-blue-600/20 blur-[100px]"
                    />

                    <div className="relative z-10 flex flex-col items-center">
                        {/* Logo Container */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: "backOut" }}
                            className="w-32 h-32 mb-8 relative"
                        >
                            <img src="/icon.svg" alt="Nova Logo" className="w-full h-full" />
                            <motion.div
                                className="absolute inset-0 rounded-3xl border-2 border-white/10"
                                animate={{ opacity: [0, 0.5, 0] }}
                                transition={{ duration: 2, repeat: Double.POSITIVE_INFINITY }}
                            />
                        </motion.div>

                        {/* App Name */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="text-center space-y-2"
                        >
                            <h1 className="text-5xl font-black tracking-tighter text-white">
                                NOVA
                            </h1>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em]">
                                Note & Traffic Tracker
                            </p>
                        </motion.div>

                        {/* Progress Bar Area */}
                        <div className="mt-16 w-64 h-[2px] bg-white/5 rounded-full overflow-hidden relative">
                            <motion.div
                                className="h-full bg-gradient-to-r from-violet-500 to-blue-500 shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: "linear" }}
                            />
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 text-[10px] font-bold text-white/20 uppercase tracking-widest"
                        >
                            Initializing System... {progress}%
                        </motion.div>
                    </div>

                    {/* Bottom Branding */}
                    <div className="absolute bottom-12 flex flex-col items-center opacity-20">
                        <div className="h-px w-12 bg-white/50 mb-4" />
                        <p className="text-[10px] font-medium tracking-[0.5em] text-white uppercase italic">
                            Premium Intelligence
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
