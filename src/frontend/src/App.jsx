function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 px-6 py-5">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
          Innovation Hacks 2.0
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          GreenRoute Transit
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-300">
          Embodied Carbon Transit Design Assistant for planners, agencies, and
          communities comparing lower-carbon, more buildable rail corridors.
        </p>
      </header>

      <main className="grid gap-6 p-6 lg:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-xl border border-gray-700 bg-gray-800 p-8">
          <p className="text-sm text-emerald-300">
            Google Maps helps communities see the city.
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Plan the lowest-carbon, most buildable rail corridor together.
          </h2>
          <p className="mt-4 max-w-2xl text-gray-300">
            The MVP compares corridor alternatives by embodied carbon, cost,
            schedule, disruption, buildability, and community benefit. It is
            grounded in real transit section tradeoffs such as slab thickness,
            reinforcement strategy, SCM replacement, and construction context.
          </p>
        </section>

        <section className="rounded-xl border border-gray-700 bg-gray-800 p-8">
          <h3 className="text-lg font-semibold text-white">Current Build Focus</h3>
          <ul className="mt-4 space-y-3 text-sm text-gray-300">
            <li>City presets and conceptual corridor alternatives</li>
            <li>Track slab and rail slab section comparison</li>
            <li>Traffic, utility, and right-of-way buildability factors</li>
            <li>Community benefit metrics like population and job access</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App
