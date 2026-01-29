'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/backend/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { UserStats, Badge, LeaderboardEntry } from '@/core/types';

interface UseGamificationReturn {
  stats: UserStats | null;
  badges: Badge[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useGamification(): UseGamificationReturn {
  const { profile, currentOrg } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchGamificationData = useCallback(async () => {
    if (!profile) {
      setStats(null);
      setBadges([]);
      setLeaderboard([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch user stats from enrollments
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('status, points_earned')
        .eq('user_id', profile.id);

      if (enrollmentsError) throw enrollmentsError;

      // Calculate stats
      const totalPoints = (enrollments || []).reduce(
        (sum, e) => sum + (e.points_earned || 0),
        0
      );
      const completedJourneys = (enrollments || []).filter(
        (e) => e.status === 'completed'
      ).length;
      const inProgressJourneys = (enrollments || []).filter(
        (e) => e.status === 'in_progress' || e.status === 'enrolled'
      ).length;

      // Calculate level based on points
      const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
      const levelNames = [
        'Novato',
        'Aprendiz',
        'Explorador',
        'Aventurero',
        'Veterano',
        'Experto',
        'Maestro',
        'Leyenda',
        'Campeón',
        'Héroe',
      ];

      let level = 1;
      for (let i = levelThresholds.length - 1; i >= 0; i--) {
        if (totalPoints >= levelThresholds[i]) {
          level = i + 1;
          break;
        }
      }

      const currentLevelThreshold = levelThresholds[level - 1] || 0;
      const nextLevelThreshold = levelThresholds[level] || levelThresholds[level - 1] + 500;
      const levelProgress = Math.min(
        100,
        Math.round(
          ((totalPoints - currentLevelThreshold) /
            (nextLevelThreshold - currentLevelThreshold)) *
            100
        )
      );

      // Fetch user badges/rewards
      const { data: userBadges, error: badgesError } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges (
            id,
            name,
            description,
            icon_url,
            category,
            points_required
          )
        `)
        .eq('user_id', profile.id);

      if (badgesError) {
        console.error('Error fetching badges:', badgesError);
      }

      const earnedBadges: Badge[] = (userBadges || [])
        .map((ub) => {
          const badgeData = Array.isArray(ub.badge) ? ub.badge[0] : ub.badge;
          if (!badgeData) return null;
          return {
            ...badgeData,
            earned_at: ub.earned_at,
          } as Badge;
        })
        .filter((b): b is Badge => b !== null);

      // Fetch leaderboard for current organization
      if (currentOrg) {
        const { data: leaderboardData, error: leaderboardError } = await supabase
          .from('enrollments')
          .select(`
            user_id,
            points_earned,
            profile:profiles!enrollments_user_id_fkey (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('status', 'completed')
          .order('points_earned', { ascending: false })
          .limit(10);

        if (leaderboardError) {
          console.error('Error fetching leaderboard:', leaderboardError);
        } else {
          // Group by user and sum points
          const userPointsMap = new Map<
            string,
            { points: number; name: string; avatar: string | null }
          >();

          for (const entry of leaderboardData || []) {
            const profileData = Array.isArray(entry.profile)
              ? entry.profile[0]
              : entry.profile;

            if (!profileData) continue;

            const existing = userPointsMap.get(entry.user_id);
            if (existing) {
              existing.points += entry.points_earned || 0;
            } else {
              userPointsMap.set(entry.user_id, {
                points: entry.points_earned || 0,
                name: profileData.full_name || 'Usuario',
                avatar: profileData.avatar_url,
              });
            }
          }

          // Sort and create leaderboard entries
          const sortedEntries = Array.from(userPointsMap.entries())
            .sort((a, b) => b[1].points - a[1].points)
            .slice(0, 10);

          const leaderboardEntries: LeaderboardEntry[] = sortedEntries.map(
            ([userId, data], index) => ({
              rank: index + 1,
              user_id: userId,
              full_name: data.name,
              avatar_url: data.avatar,
              points: data.points,
              level: Math.floor(data.points / 100) + 1,
              badges_count: 0,
            })
          );

          setLeaderboard(leaderboardEntries);
        }
      }

      setStats({
        total_points: totalPoints,
        level,
        level_name: levelNames[level - 1] || 'Novato',
        level_progress: levelProgress,
        journeys_completed: completedJourneys,
        journeys_in_progress: inProgressJourneys,
        badges_earned: earnedBadges.length,
      });

      setBadges(earnedBadges);
    } catch (err) {
      console.error('Error fetching gamification data:', err);
      setError(
        err instanceof Error ? err.message : 'Error al cargar datos de gamificación'
      );
    } finally {
      setIsLoading(false);
    }
  }, [profile, currentOrg, supabase]);

  useEffect(() => {
    fetchGamificationData();
  }, [fetchGamificationData]);

  return {
    stats,
    badges,
    leaderboard,
    isLoading,
    error,
    refresh: fetchGamificationData,
  };
}
