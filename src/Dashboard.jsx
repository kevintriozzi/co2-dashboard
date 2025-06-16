import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const activities = [
  "Abfalltrennung / Recycling", "Absenkpfad", "Akademie", "Arbeitssicherheit + Gesundheitsschutz", "Aufforderung ÖV-Nutzung MA",
  "Aufgummierung Reifen", "Bahnzugang Kieswerk", "Beiträge individuelle PSA", "Bewegungsmelder DLZ", "Bikte to work",
  "Biodiesel (HVO)", "Biodiesel (RME)", "Brecher Diesel / Strom", "E-Auto-Ladestationen", "EcoDrive-Kurse", "Eigene Tankstellen",
  "E-LKW Tests", "Energieverbrauch IT", "Euro 6 LKW", "Fachtagungen", "Fair Recycling Kompensation", "Förderbänder Kiesgrube",
  "GHG Protokoll", "Grosszügig Ferien", "Home Office", "ISO 14001", "ISO 45001", "ISO 9001", "Kreislaufwirtschaft",
  "LED-Beleuchtung DLZ", "Lernende", "Lernort Kiesgrube", "Lohngleichheit", "Mitarbeitendenanlässe", "Mitspracherecht",
  "Moderner Maschinenpark", "Optimierte Disposition", "Pikettdienst für Gesellschaft", "PV-Anlage", "Rationelle Fahrtechnik",
  "reCIRCLE", "Regionale Markttätigkeit", "Regionale Versorgung", "TWIKE", "Verbandsmitgliedschaften", "Verdunkelnde Scheiben",
  "Wiederverwendung Stahlträger", "Zirkulit, Zireco"
];

const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
const scenarios = ["Hohe Reduktion", "Mittlere Reduktion", "Minimale Reduktion"];

export default function CO2Dashboard() {
  const [reductions, setReductions] = useState({});
  const [startEmissions, setStartEmissions] = useState(0);

  const handleInputChange = (activity, year, scenario, value) => {
    const num = parseFloat(value);
    setReductions(prev => ({
      ...prev,
      [activity]: {
        ...(prev[activity] || {}),
        [year]: {
          ...(prev[activity]?.[year] || {}),
          [scenario]: isNaN(num) ? 0 : num
        }
      }
    }));
  };

  const computeChartData = () => {
    const result = [];
    const scenarioTotals = Object.fromEntries(scenarios.map(s => [s, startEmissions]));

    for (const year of years) {
      const yearStr = year.toString();
      const entry = { year: yearStr };

      for (const scenario of scenarios) {
        let totalReduction = 0;
        for (const activity of activities) {
          totalReduction += reductions[activity]?.[year]?.[scenario] || 0;
        }
        scenarioTotals[scenario] = Math.max(scenarioTotals[scenario] - totalReduction, 0);
        entry[scenario] = scenarioTotals[scenario];
      }

      result.push(entry);
    }

    return result;
  };

  const chartData = computeChartData();

  const exportCSV = () => {
    const rows = ["Jahr;" + scenarios.join(";")];
    for (const row of chartData) {
      const line = [row.year, ...scenarios.map(s => row[s] ?? 0)].join(";");
      rows.push(line);
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "co2_emissionen_szenarien.csv");
    link.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Startemissionen (in Tonnen CO₂)</h2>
        <input
          type="number"
          className="w-64 p-2 border"
          placeholder="z. B. 10000"
          min="0"
          step="any"
          value={startEmissions}
          onChange={(e) => setStartEmissions(parseFloat(e.target.value) || 0)}
        />
        <button onClick={exportCSV} className="ml-4 px-4 py-2 bg-blue-500 text-white rounded">CSV exportieren</button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full table-auto border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left p-2 border">Aktivität</th>
              {years.map(year => (
                <th key={year} className="text-center p-2 border" colSpan={scenarios.length}>{year}</th>
              ))}
            </tr>
            <tr>
              <th></th>
              {years.map(() => (
                scenarios.map(scenario => (
                  <th key={scenario} className="text-center p-1 border">{scenario}</th>
                ))
              ))}
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, idx) => (
              <tr key={idx}>
                <td className="p-2 border font-medium whitespace-nowrap align-top">{activity}</td>
                {years.map(year =>
                  scenarios.map(scenario => (
                    <td key={activity + year + scenario} className="p-1 border">
                      <input
                        type="number"
                        className="w-20 p-1 border"
                        placeholder="0"
                        min="0"
                        step="any"
                        onChange={(e) => handleInputChange(activity, year, scenario, e.target.value)}
                      />
                    </td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Verbleibende CO₂-Emissionen</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis label={{ value: "Tonnen", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
            {scenarios.map((scenario, idx) => (
              <Line
                key={scenario}
                type="monotone"
                dataKey={scenario}
                strokeWidth={2}
                stroke={["#4caf50", "#2196f3", "#f44336"][idx]}
                dot={{ r: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
