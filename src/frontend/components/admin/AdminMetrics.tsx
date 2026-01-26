"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Users, BookOpen, Activity, Heart } from "lucide-react";

// Mock Data
const data = [
  { name: "Ene", total: 12 },
  { name: "Feb", total: 18 },
  { name: "Mar", total: 25 },
  { name: "Abr", total: 30 },
  { name: "May", total: 45 },
  { name: "Jun", total: 55 },
];

const healthData = [
  { name: "Empatía", value: 85 },
  { name: "Resiliencia", value: 72 },
  { name: "Comunicación", value: 90 },
  { name: "Liderazgo", value: 65 },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-gray-100 shadow-lg">
          <p className="font-bold text-gray-800">{label}</p>
          <p className="text-aurora-pink font-medium">
            {payload[0].value} Participantes
          </p>
        </div>
      );
    }
  
    return null;
  };

export function AdminDashboardMetrics() {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Participantes</CardTitle>
            <Users className="h-4 w-4 text-aurora-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">1,240</div>
            <p className="text-xs text-gray-500">+20.1% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card className="glass border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">NPS Promedio</CardTitle>
            <Heart className="h-4 w-4 text-aurora-pink" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">9.8</div>
            <p className="text-xs text-gray-500">Promotores: 95%</p>
          </CardContent>
        </Card>
        <Card className="glass border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Talleres Realizados</CardTitle>
            <BookOpen className="h-4 w-4 text-aurora-yellow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">45</div>
            <p className="text-xs text-gray-500">12 agendados este mes</p>
          </CardContent>
        </Card>
        <Card className="glass border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Salud Emocional</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">8.2/10</div>
            <p className="text-xs text-gray-500">+5% vs entrada</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm bg-white/50">
          <CardHeader>
            <CardTitle className="font-heading">Crecimiento de Impacto</CardTitle>
            <CardDescription>Participantes capacitados por mes.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                 <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                <Bar
                  dataKey="total"
                  fill="currentColor"
                  radius={[4, 4, 0, 0]}
                  className="fill-aurora-cyan"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-none shadow-sm bg-white/50">
          <CardHeader>
            <CardTitle className="font-heading">Indicadores de Salud</CardTitle>
            <CardDescription>Promedios post-taller.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4 mt-4">
                {healthData.map((item) => (
                    <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-sm font-medium text-gray-600">
                            <span>{item.name}</span>
                            <span>{item.value}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-linear-to-r from-aurora-cyan to-aurora-pink rounded-full" 
                                style={{ width: `${item.value}%` }} 
                            />
                        </div>
                    </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
