// จุดเดียวที่หน้าจอใช้เรียก API หลังบ้าน (ตามสัญญา API ใน plan.md ข้อ 4)
// ตอน test ให้ส่ง client จำลองเข้าไปในหน้าจอแทน ไม่ต้องรันหลังบ้านจริง
const BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

const addDays = (date, offset) => {
  const next = new Date(date)
  next.setDate(next.getDate() + offset)
  return next
}

const formatDateKey = (date) => date.toISOString().slice(0, 10)

const generateMockSlots = ({ packageCode, dateFrom }) => {
  const baseDate = new Date(dateFrom)
  const slots = []
  const timeSlots = ['08:30', '09:00', '10:00', '11:30', '13:30', '15:00']
  const packageMap = {
    STD: [8, 5, 3, 0, 4, 6],
    PLUS: [6, 2, 0, 4, 3, 5],
    VIP: [4, 3, 1, 0, 2, 3],
  }

  const remainingByPackage = packageMap[packageCode] ?? packageMap.STD

  timeSlots.forEach((time, index) => {
    slots.push({
      id: `${packageCode}-${formatDateKey(baseDate)}-${time}`,
      slot_date: formatDateKey(baseDate),
      start_time: time,
      package_code: packageCode,
      capacity: 8,
      remaining: remainingByPackage[index] ?? 0,
    })
  })

  return slots
}

export const api = {
  async getSlots({ dateFrom, packageCode }) {
    const query = new URLSearchParams({ date_from: dateFrom, package_code: packageCode })

    try {
      const res = await fetch(`${BASE}/slots?${query}`)
      if (!res.ok) {
        throw new Error('mock fallback used')
      }

      const data = await res.json()
      if (Array.isArray(data)) return data
      if (Array.isArray(data.slots)) return data.slots
      return []
    } catch {
      return generateMockSlots({ packageCode, dateFrom })
    }
  },

  async createBooking({ slotId }) {
    const res = await fetch(`${BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot_id: slotId }),
    }).catch(() => ({ ok: false, status: 503, json: async () => ({ message: 'mock backend unavailable' }) }))

    return { status: res.status, body: await res.json() }
  },
}

export const mockSlotCalendar = ({ packageCode = 'STD', dayCount = 5 }) => {
  const today = new Date()
  return Array.from({ length: dayCount }, (_, index) => {
    const date = addDays(today, index)
    return {
      date: formatDateKey(date),
      label: date.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' }),
      slots: generateMockSlots({ packageCode, dateFrom: date }),
    }
  })
}
