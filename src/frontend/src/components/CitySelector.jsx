import { CITY_PRESETS } from './mapUtils'

export default function CitySelector({ city, onCityChange }) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs font-medium uppercase tracking-wider text-gray-500">City</label>
      <select
        value={city}
        onChange={(e) => onCityChange(e.target.value)}
        className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 focus:border-emerald-500 focus:outline-none"
      >
        {Object.entries(CITY_PRESETS).map(([key, preset]) => (
          <option key={key} value={key}>{preset.name}</option>
        ))}
      </select>
    </div>
  )
}
