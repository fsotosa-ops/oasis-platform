'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useJourneys } from '@/features/journey/hooks/useJourneys';
import { useEnrollments } from '@/features/journey/hooks/useEnrollment';
import { JourneyCard, JourneyCardSkeleton } from '@/features/journey/components/JourneyCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  BookOpen,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function JourneyListPage() {
  const { isLoading: authLoading } = useAuth();
  const {
    journeys,
    isLoading: journeysLoading,
    error: journeysError,
    refresh,
  } = useJourneys({ status: 'active' });
  const { enroll } = useEnrollments();

  const [searchQuery, setSearchQuery] = useState('');
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isLoading = authLoading || journeysLoading;

  // Filter journeys by search
  const filteredJourneys = journeys.filter((journey) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      journey.title.toLowerCase().includes(query) ||
      (journey.description?.toLowerCase() || '').includes(query)
    );
  });

  // Separate enrolled and available journeys
  const enrolledJourneys = filteredJourneys.filter((j) => j.isEnrolled);
  const availableJourneys = filteredJourneys.filter((j) => !j.isEnrolled);
  const completedJourneys = enrolledJourneys.filter(
    (j) => j.enrollment?.status === 'completed'
  );
  const inProgressJourneys = enrolledJourneys.filter(
    (j) => j.enrollment?.status !== 'completed'
  );

  const handleEnroll = async (journeyId: string) => {
    setEnrollError(null);
    setEnrollingId(journeyId);
    try {
      await enroll(journeyId);
      await refresh();
    } catch (err) {
      setEnrollError(
        err instanceof Error ? err.message : 'Error al inscribirse'
      );
    } finally {
      setEnrollingId(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Mi Viaje
          </h1>
          <p className="text-gray-500 mt-1">
            Cargando tus journeys...
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <JourneyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Mi Viaje
          </h1>
          <p className="text-gray-500 mt-1">
            Explora y avanza en tus journeys de aprendizaje
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          Actualizar
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar journeys..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Error display */}
      {(journeysError || enrollError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{journeysError || enrollError}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="enrolled" className="space-y-6">
        <TabsList className="bg-white/60 backdrop-blur-sm border border-gray-200/50 p-1 rounded-xl">
          <TabsTrigger
            value="enrolled"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 gap-2"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">En Progreso</span>
            <span className="sm:hidden">Progreso</span>
            {inProgressJourneys.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                {inProgressJourneys.length}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">Completados</span>
            <span className="sm:hidden">Completos</span>
            {completedJourneys.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                {completedJourneys.length}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="available"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Disponibles</span>
            <span className="sm:hidden">Nuevos</span>
            {availableJourneys.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                {availableJourneys.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* In Progress */}
        <TabsContent value="enrolled" className="mt-6">
          {inProgressJourneys.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {inProgressJourneys.map((journey) => (
                <JourneyCard key={journey.id} journey={journey} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="Sin journeys en progreso"
              description="Inscríbete en un journey para comenzar tu aprendizaje."
            />
          )}
        </TabsContent>

        {/* Completed */}
        <TabsContent value="completed" className="mt-6">
          {completedJourneys.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedJourneys.map((journey) => (
                <JourneyCard key={journey.id} journey={journey} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="No has completado journeys aún"
              description="Completa tus journeys en progreso para verlos aquí."
            />
          )}
        </TabsContent>

        {/* Available */}
        <TabsContent value="available" className="mt-6">
          {availableJourneys.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableJourneys.map((journey) => (
                <JourneyCard
                  key={journey.id}
                  journey={journey}
                  onEnroll={handleEnroll}
                  isEnrolling={enrollingId === journey.id}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="No hay journeys disponibles"
              description="Todos los journeys disponibles ya están en tu lista."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
      <Icon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      <p className="text-gray-500 mt-2">{description}</p>
    </div>
  );
}
