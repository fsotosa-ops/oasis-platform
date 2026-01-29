'use client';

import React from 'react';
import { Trophy, Star, Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface PointsBadgeProps {
  points: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gold' | 'outline';
  showIcon?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
  lg: 'text-base px-4 py-1.5 gap-2',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const variantStyles = {
  default: 'bg-primary/10 text-primary',
  gold: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700',
  outline: 'border border-primary/30 text-primary bg-transparent',
};

export function PointsBadge({
  points,
  size = 'md',
  variant = 'default',
  showIcon = true,
  className,
}: PointsBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {showIcon && <Trophy className={iconSizes[size]} />}
      <span>{points.toLocaleString()}</span>
      <span className="opacity-75">pts</span>
    </div>
  );
}

interface LevelBadgeProps {
  level: number;
  levelName: string;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

export function LevelBadge({
  level,
  levelName,
  size = 'md',
  showProgress = false,
  progress = 0,
  className,
}: LevelBadgeProps) {
  const levelColors = [
    'from-gray-400 to-gray-500', // Level 1
    'from-green-400 to-green-500', // Level 2
    'from-blue-400 to-blue-500', // Level 3
    'from-purple-400 to-purple-500', // Level 4
    'from-yellow-400 to-amber-500', // Level 5
    'from-orange-400 to-orange-500', // Level 6
    'from-red-400 to-red-500', // Level 7
    'from-pink-400 to-pink-500', // Level 8
    'from-indigo-400 to-indigo-500', // Level 9
    'from-violet-400 to-violet-600', // Level 10+
  ];

  const colorClass = levelColors[Math.min(level - 1, levelColors.length - 1)];

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <div
        className={cn(
          'relative rounded-full bg-gradient-to-br text-white font-bold flex items-center justify-center shadow-lg',
          colorClass,
          size === 'sm' && 'w-8 h-8 text-sm',
          size === 'md' && 'w-12 h-12 text-lg',
          size === 'lg' && 'w-16 h-16 text-2xl'
        )}
      >
        {level}
        <Zap
          className={cn(
            'absolute -top-1 -right-1 text-yellow-300',
            size === 'sm' && 'h-3 w-3',
            size === 'md' && 'h-4 w-4',
            size === 'lg' && 'h-5 w-5'
          )}
        />
      </div>
      <span
        className={cn(
          'mt-1 font-medium text-center',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        )}
      >
        {levelName}
      </span>
      {showProgress && (
        <div
          className={cn(
            'w-full mt-1 bg-muted rounded-full overflow-hidden',
            size === 'sm' && 'h-1',
            size === 'md' && 'h-1.5',
            size === 'lg' && 'h-2'
          )}
        >
          <div
            className={cn('h-full bg-gradient-to-r', colorClass)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StreakBadge({ streak, size = 'md', className }: StreakBadgeProps) {
  if (streak < 1) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full bg-orange-100 text-orange-700 font-medium',
        sizeStyles[size],
        className
      )}
    >
      <TrendingUp className={iconSizes[size]} />
      <span>{streak} días</span>
    </div>
  );
}
