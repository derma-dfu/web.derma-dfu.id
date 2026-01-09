"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface DailyRevenue {
    date: string;
    revenue: number;
    orders: number;
}

interface SalesChartProps {
    data: DailyRevenue[];
    formatCurrency: (amount: number) => string;
    revenueLabel: string;
}

export const SalesChart = ({ data, formatCurrency, revenueLabel }: SalesChartProps) => {
    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 12 }}
                        stroke="#94a3b8"
                    />
                    <Tooltip
                        formatter={(value: number) => [formatCurrency(value), revenueLabel]}
                        labelStyle={{ color: '#1e293b' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
