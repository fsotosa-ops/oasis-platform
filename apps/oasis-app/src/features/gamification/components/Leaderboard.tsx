'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { PointsBadge } from './PointsBadge';
import { Trophy, Medal, Crown, Loader2 } from 'lucide-react';
import type { LeaderboardEntry } from '@/core/types';
import { cn } from '@/shared/lib/utils';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  isLoading?: boolean;
  title?: string;
  limit?: number;
}

const rankConfig: Record<number, { icon: React.ElementType; color: string }> = {
  1: { icon: Crown, color: 'text-yellow-500' },
  2: { icon: Medal, color: 'text-gray-400' },
  3: { icon: Medal, color: 'text-amber-600' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Leaderboard({
  entries,
  currentUserId,
  isLoading = false,
  title = 'Tabla de Posiciones',
  limit = 10,
}: LeaderboardProps) {
  const displayEntries = entries.slice(0, limit);

  if (isLoading) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No hay participantes en el ranking aún.</p>
          <p className="text-sm mt-1">
            Completa journeys para aparecer aquí.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayEntries.map((entry) => {
          const isCurrentUser = entry.user_id === currentUserId;
          const rankInfo = rankConfig[entry.rank];
          const RankIcon = rankInfo?.icon;

          return (
            <div
              key={entry.user_id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-colors',
                isCurrentUser
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-muted/50',
                entry.rank <= 3 && 'bg-gradient-to-r from-amber-50/50 to-transparent'
              )}
            >
              {/* Rank */}
              <div className="w-8 flex items-center justify-center">
                {RankIcon ? (
                  <RankIcon className={cn('h-6 w-6', rankInfo.color)} />
                ) : (
                  <span className="text-lg font-bold text-muted-foreground">
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarImage src={entry.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(entry.full_name)}
                </AvatarFallback>
              </Avatar>

              {/* Name and level */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'font-medium truncate',
                      isCurrentUser && 'text-primary'
                    )}
                  >
                    {entry.full_name}
                  </span>
                  {isCurrentUser && (
                    <Badge variant="secondary" className="text-xs">
                      Tú
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Nivel {entry.level}</span>
                  {entry.badges_count > 0 && (
                    <>
                      <span>•</span>
                      <span>{entry.badges_count} badges</span>
                    </>
                  )}
                </div>
              </div>

              {/* Points */}
              <PointsBadge
                points={entry.points}
                size="sm"
                variant={entry.rank === 1 ? 'gold' : 'default'}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

interface LeaderboardMiniProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  limit?: number;
}

export function LeaderboardMini({
  entries,
  currentUserId,
  limit = 5,
}: LeaderboardMiniProps) {
  const displayEntries = entries.slice(0, limit);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1.5">
      {displayEntries.map((entry) => {
        const isCurrentUser = entry.user_id === currentUserId;

        return (
          <div
            key={entry.user_id}
            className={cn(
              'flex items-center gap-2 text-sm',
              isCurrentUser && 'font-medium text-primary'
            )}
          >
            <span className="w-5 text-muted-foreground">#{entry.rank}</span>
            <Avatar className="h-6 w-6">
              <AvatarImage src={entry.avatar_url || undefined} />
              <AvatarFallback className="text-[10px]">
                {getInitials(entry.full_name)}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate">{entry.full_name}</span>
            <span className="text-muted-foreground">{entry.points}pts</span>
          </div>
        );
      })}
    </div>
  );
}
