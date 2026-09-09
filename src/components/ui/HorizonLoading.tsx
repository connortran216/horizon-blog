import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export default function HorizonLoading() {
  const [slow, setSlow] = useState(false)
  const reduced = useReducedMotion()
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 6000)
    return () => window.clearTimeout(timer)
  }, [])
  return (
    <motion.div
      className="horizon-loading"
      role="status"
      aria-label="Loading writing"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.22 }}
    >
      <div className="horizon-loading-brand" aria-hidden="true">
        horizon<span>.</span>
      </div>
      <p>{slow ? 'Đang tải nội dung…' : 'Đang mở những trang viết…'}</p>
      {slow && <a href={window.location.href}>Tải lại trang</a>}
    </motion.div>
  )
}
