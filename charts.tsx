import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

const grid = "#3a3f55";
const axisColor = "#9aa3b8";

export const CHART_COLORS = {
  primary: "#f5c542",
  orange: "#f37335",
  purple: "#a36cf0",
  gold: "#f0c14b",
  teal: "#4fd1c5",
  blue: "#5aa7f0",
};

const tooltipStyle = {
  background: "#1f2438",
  border: "1px solid #3a3f55",
  borderRadius: 8,
  color: "#f5f5f5",
  fontSize: 12,
};

interface BarSpec { key: string; color: string; name?: string }
interface LineSpec { key: string; color: string; name?: string }

export function BarChartBlock({ data, xKey, bars, height = 280 }: { data: unknown[]; xKey: string; bars: BarSpec[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data as object[]} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey={xKey} stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} interval={0} angle={data.length > 8 ? -25 : 0} textAnchor={data.length > 8 ? "end" : "middle"} height={data.length > 8 ? 60 : 30} />
        <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {bars.map((b) => <Bar key={b.key} dataKey={b.key} name={b.name ?? b.key} fill={b.color} radius={[6, 6, 0, 0]} isAnimationActive={false} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineChartBlock({ data, xKey, lines, height = 280 }: { data: unknown[]; xKey: string; lines: LineSpec[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data as object[]} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey={xKey} stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {lines.map((l) => <Line key={l.key} type="monotone" dataKey={l.key} name={l.name ?? l.key} stroke={l.color} strokeWidth={2.5} dot={{ r: 3, fill: l.color }} isAnimationActive={false} />)}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PieChartBlock({ data, height = 260 }: { data: { name: string; value: number; color: string }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
