'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useJourneys } from '@/features/journey/hooks/useJourneys';
import { useGamification } from '@/features/gamification/hooks/useGamification';
import { JourneyCard, JourneyCardSkeleton } from '@/features/journey/components/JourneyCard';
import { ProgressBar } from '@/features/journey/components/ProgressBar';
import { LevelBadge, PointsBadge } from '@/features/gamification/components/PointsBadge';
import { LeaderboardMini } from '@/features/gamification/components/Leaderboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  BookOpen,
  Trophy,
  Target,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp,
  Loader2,
} from 'lucide-react';

export default function ParticipantDashboard() {
  const { profile, isLoading: authLoading } = useAuth();
  const { journeys, isLoading: journeysLoading } = useJourneys({
    onlyEnrolled: true,
  });
  const { stats, leaderboard, isLoading: gamificationLoading } = useGamification();

  const isLoading = authLoading || journeysLoading || gamificationLoading;

  // Get in-progress journeys (limit 3)
  const inProgressJourneys = journeys
    .filter((j) => j.enrollment?.status !== 'completed')
    .slice(0, 3);

  // Get recently completed (limit 2)
  const completedJourneys = journeys
    .filter((j) => j.enrollment?.status === 'completed')
    .slice(0, 2);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-muted rounded animate-pulse w-48 mb-2" />
          <div className="h-5 bg-muted rounded animate-pulse w-64" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="py-12 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="py-12 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Hola, {profile?.full_name?.split(' ')[0] || 'Participante'}
        </h1>
        <p className="text-gray-500 mt-1">
          Continúa tu viaje de aprendizaje
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {stats?.total_points || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Puntos totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-700">
                      {stats?.journeys_completed || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Completados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-700">
                      {stats?.journeys_in_progress || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">En progreso</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Continue learning section */}
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Continúa aprendiendo
                </CardTitle>
                <CardDescription>
                  Tus journeys en progreso
                </CardDescription>
              </div>
              <Link href="/participant/journey">
                <Button variant="ghost" size="sm" className="gap-1">
                  Ver todos
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {inProgressJourneys.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {inProgressJourneys.map((journey) => (
                    <JourneyCard
                      key={journey.id}
                      journey={journey}
                      variant="compact"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-gray-600">No tienes journeys en progreso</p>
                  <Link href="/participant/journey">
                    <Button variant="outline" className="mt-4">
                      Explorar journeys
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recently completed */}
          {completedJourneys.length > 0 && (
            <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-5 w-5 text-green-500" />
                  Completados recientemente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {completedJourneys.map((journey) => (
                    <JourneyCard
                      key={journey.id}
                      journey={journey}
                      variant="compact"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Level card */}
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tu Nivel
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-4">
              <LevelBadge
                level={stats?.level || 1}
                levelName={stats?.level_name || 'Novato'}
                size="lg"
                showProgress
                progress={stats?.level_progress || 0}
              />
              <div className="mt-4 w-full">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progreso al siguiente nivel</span>
                  <span>{stats?.level_progress || 0}%</span>
                </div>
                <ProgressBar
                  value={stats?.level_progress || 0}
                  size="sm"
                  variant="info"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Badges obtenidos
                </span>
                <span className="font-semibold">
                  {stats?.badges_earned || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Puntos totales
                </span>
                <PointsBadge points={stats?.total_points || 0} size="sm" />
              </div>
              {stats?.rank && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Posición ranking
                  </span>
                  <span className="font-semibold">#{stats.rank}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mini leaderboard */}
          {leaderboard.length > 0 && (
            <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Top 5
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardMini
                  entries={leaderboard}
                  currentUserId={profile?.id}
                  limit={5}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
