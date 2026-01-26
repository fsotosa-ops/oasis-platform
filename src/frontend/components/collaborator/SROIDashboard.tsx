"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { DollarSign, TrendingUp, Heart } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip } from "recharts";

const sroiData = [
  { name: "Mejora Clima", value: 4000, investment: 1500 },
  { name: "Retención", value: 8000, investment: 2000 },
  { name: "Productividad", value: 6500, investment: 2500 },
  { name: "Bajas Médicas", value: 3000, investment: 1000 },
];

export function SROIDashboard() {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Retorno Total (S-ROI)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-heading text-green-700">1:4.5</div>
                        <p className="text-xs text-gray-500">Por cada $1 invirtido, $4.5 de valor social</p>
                    </CardContent>
                </Card>
                <Card className="glass border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Ahorro Estimado</CardTitle>
                        <DollarSign className="h-4 w-4 text-aurora-yellow" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-heading">$125,000</div>
                        <p className="text-xs text-gray-500">En reducción de rotación y bajas</p>
                    </CardContent>
                </Card>
                 <Card className="glass border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Bienestar Percibido</CardTitle>
                        <Heart className="h-4 w-4 text-aurora-pink" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-heading">+42%</div>
                        <p className="text-xs text-gray-500">Mejora en encuestas de salida</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm bg-white/50">
                <CardHeader>
                    <CardTitle className="font-heading text-xl">Impacto Financiero vs Inversión</CardTitle>
                </CardHeader>
                <CardContent className="pl-0">
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={sroiData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{fill: 'transparent'}}
                            />
                            <Legend />
                            <Bar dataKey="investment" name="Inversión" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="value" name="Valor Generado" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
