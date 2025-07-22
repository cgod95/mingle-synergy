import React from "react"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "@/lib/utils"

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Record<string, unknown>[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  startEndOnly?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  yAxisWidth?: number
  showAnimation?: boolean
  showTooltip?: boolean
  showGridLines?: boolean
  showLegend?: boolean
  autoMinValue?: boolean
  minValue?: number
  maxValue?: number
  type?: "default" | "line"
}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  (
    {
      data,
      index,
      categories,
      colors,
      valueFormatter,
      startEndOnly = false,
      showXAxis = true,
      showYAxis = true,
      yAxisWidth = 60,
      showAnimation = true,
      showTooltip = true,
      showGridLines = true,
      showLegend = true,
      autoMinValue = false,
      minValue,
      maxValue,
      type = "default",
      className,
      ...props
    },
    ref
  ) => {
    const colorPalette = colors || [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ]

    const formatValue = valueFormatter || ((value: number) => value.toString())

    const max = maxValue ?? Math.max(...data.map((item) => Math.max(...categories.map((category) => Number(item[category])))))
    const min = minValue ?? (autoMinValue ? Math.min(...data.map((item) => Math.min(...categories.map((category) => Number(item[category]))))) : 0)

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <ResponsiveContainer width="100%" height={350}>
          {type === "line" ? (
            <LineChart data={data}>
              {showXAxis && (
                <XAxis
                  dataKey={index}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  padding={{ left: 20, right: 20 }}
                  minTickGap={5}
                />
              )}
              {showYAxis && (
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatValue}
                  width={yAxisWidth}
                />
              )}
              {categories.map((category, i) => (
                <Line
                  key={category}
                  dataKey={category}
                  stroke={colorPalette[i % colorPalette.length]}
                  strokeWidth={2}
                  dot={{ fill: colorPalette[i % colorPalette.length], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={showAnimation ? 750 : 0}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={data}>
              {showXAxis && (
                <XAxis
                  dataKey={index}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  padding={{ left: 20, right: 20 }}
                  minTickGap={5}
                />
              )}
              {showYAxis && (
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatValue}
                  width={yAxisWidth}
                />
              )}
              {categories.map((category, i) => (
                <Bar
                  key={category}
                  dataKey={category}
                  fill={colorPalette[i % colorPalette.length]}
                  radius={[4, 4, 0, 0]}
                  animationDuration={showAnimation ? 750 : 0}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    )
  }
)
Chart.displayName = "Chart"

export { Chart }
