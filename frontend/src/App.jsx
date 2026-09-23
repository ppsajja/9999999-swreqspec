import SlotPicker from './pages/SlotPicker.jsx'

export default function App() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-teal-800">ระบบจองคิวตรวจสุขภาพ</h1>
        <SlotPicker />
      </div>
    </main>
  )
}
