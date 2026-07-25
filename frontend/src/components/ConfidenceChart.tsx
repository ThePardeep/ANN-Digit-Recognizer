import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface ConfidenceChartProps {
  probabilities: Record<string, number>
  prediction: number
}

const BASE_COLOR = '#94a3b8'
const HIGHLIGHT_COLOR = '#4f46e5'

export function ConfidenceChart({ probabilities, prediction }: ConfidenceChartProps) {
  const data = Array.from({ length: 10 }, (_, digit) => ({
    digit: String(digit),
    probability: probabilities[String(digit)] ?? 0,
  }))

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis dataKey="digit" tick={{ fontSize: 12 }} />
          <YAxis
            domain={[0, 1]}
            tickFormatter={(value: number) => `${Math.round(value * 100)}%`}
            tick={{ fontSize: 12 }}
            width={40}
          />
          <Tooltip
            formatter={(value) => [`${(Number(value) * 100).toFixed(2)}%`, 'Confidence']}
            labelFormatter={(label) => `Digit ${label}`}
          />
          <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.digit}
                fill={Number(entry.digit) === prediction ? HIGHLIGHT_COLOR : BASE_COLOR}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
