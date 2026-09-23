import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client.js'

const PACKAGE_OPTIONS = [
  { code: 'STD', label: 'แพ็กเกจพื้นฐาน' },
  { code: 'PLUS', label: 'แพ็กเกจ Plus' },
  { code: 'VIP', label: 'แพ็กเกจ VIP' },
]

const formatDisplayDate = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString('th-TH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

const dateRange = (days = 5) => {
  const today = new Date()
  return Array.from({ length: days }, (_, index) => {
    const next = new Date(today)
    next.setDate(today.getDate() + index)
    return {
      value: next.toISOString().slice(0, 10),
      label: formatDisplayDate(next.toISOString().slice(0, 10)),
    }
  })
}

export default function SlotPicker({ client = api }) {
  const [selectedPackage, setSelectedPackage] = useState(PACKAGE_OPTIONS[0].code)
  const [selectedDate, setSelectedDate] = useState(dateRange()[0].value)
  const [slots, setSlots] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadSlots = async () => {
      setIsLoading(true)
      const data = await client.getSlots({
        dateFrom: selectedDate,
        packageCode: selectedPackage,
      })

      if (active) {
        setSlots(Array.isArray(data) ? data : [])
        setIsLoading(false)
      }
    }

    loadSlots()

    return () => {
      active = false
    }
  }, [client, selectedDate, selectedPackage])

  const availableCount = useMemo(
    () => slots.filter((slot) => slot.remaining > 0).length,
    [slots],
  )

  return (
    <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
            จองคิวตรวจสุขภาพ
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">เลือกแพ็กเกจและช่วงเวลา</h2>
        </div>
        <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800">
          {availableCount} ช่วงว่าง
        </span>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-3 block text-sm font-semibold text-slate-700">แพ็กเกจ</label>
          <div className="flex flex-wrap gap-3">
            {PACKAGE_OPTIONS.map((pkg) => {
              const active = selectedPackage === pkg.code
              return (
                <button
                  key={pkg.code}
                  type="button"
                  onClick={() => setSelectedPackage(pkg.code)}
                  className={[
                    'rounded-xl border px-4 py-3 text-left transition',
                    active
                      ? 'border-teal-600 bg-teal-50 text-teal-800 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                  ].join(' ')}
                >
                  <div className="font-semibold">{pkg.label}</div>
                  <div className="text-xs text-slate-500">{pkg.code}</div>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-semibold text-slate-700">วันที่</label>
          <div className="flex flex-wrap gap-3">
            {dateRange().map((day) => {
              const active = selectedDate === day.value
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => setSelectedDate(day.value)}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm transition',
                    active
                      ? 'border-teal-600 bg-teal-600 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                  ].join(' ')}
                >
                  {day.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">ช่วงเวลา</label>
            <span className="text-xs text-slate-500">{formatDisplayDate(selectedDate)}</span>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              กำลังโหลดช่วงเวลา…
            </div>
          ) : slots.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              ไม่มีช่วงเวลาว่างในวันที่นี้
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {slots.map((slot) => {
                const full = Number(slot.remaining) <= 0

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={full}
                    className={[
                      'rounded-xl border p-4 text-left transition',
                      full
                        ? 'cursor-not-allowed border-slate-200 bg-slate-200 text-slate-400'
                        : 'border-teal-200 bg-teal-50 text-teal-900 hover:border-teal-300 hover:bg-teal-100',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{slot.start_time}</span>
                      <span className={['rounded-full px-2 py-1 text-xs font-medium', full ? 'bg-slate-300 text-slate-500' : 'bg-white text-teal-700'].join(' ')}>
                        {full ? 'เต็ม' : 'ว่าง'}
                      </span>
                    </div>
                    <div className="mt-3 text-sm">
                      {full ? 'ไม่มีที่นั่งว่าง' : `คงเหลือ ${slot.remaining} ที่`}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}