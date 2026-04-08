import WallCalendar from '@/components/WallCalendar';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8"
      style={{ background: 'var(--bg, #EDECEA)' }}>
      <WallCalendar />
    </main>
  );
}
