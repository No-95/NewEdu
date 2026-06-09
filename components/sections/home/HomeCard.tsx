'use client';

import React from 'react';

type HomeCardVariant = 'default' | 'muted' | 'stat' | 'chip' | 'feature';

interface HomeCardProps {
  children: React.ReactNode;
  variant?: HomeCardVariant;
  className?: string;
  style?: React.CSSProperties;
  as?: 'div' | 'button';
  onClick?: () => void;
  type?: 'button';
}

const variantClass: Record<HomeCardVariant, string> = {
  default: 'home-card',
  muted: 'home-card-muted',
  stat: 'home-card-stat',
  chip: 'home-card-chip',
  feature: 'home-card-feature',
};

export const HomeCard: React.FC<HomeCardProps> = ({
  children,
  variant = 'default',
  className = '',
  style,
  as = 'div',
  onClick,
  type,
}) => {
  const classes = `${variantClass[variant]} ${className}`.trim();

  if (as === 'button') {
    return (
      <button type={type ?? 'button'} onClick={onClick} style={style} className={classes}>
        {children}
      </button>
    );
  }

  return (
    <div style={style} className={classes}>
      {children}
    </div>
  );
};

interface HomeBulletListProps {
  items: string[];
  className?: string;
  inCards?: boolean;
}

export const HomeBulletList: React.FC<HomeBulletListProps> = ({
  items,
  className = '',
  inCards = false,
}) => {
  if (inCards) {
    return (
      <div className={`grid gap-2 sm:grid-cols-2 ${className}`}>
        {items.map((item, index) => (
          <HomeCard key={index} variant="muted" className="!p-3.5">
            <p className="home-check-item !text-xs md:!text-sm">
              <span className="shrink-0 text-primary">✓</span>
              <span>{item}</span>
            </p>
          </HomeCard>
        ))}
      </div>
    );
  }

  return (
    <ul className={`space-y-2.5 ${className}`}>
      {items.map((item, index) => (
        <li key={index} className="home-check-item">
          <span className="shrink-0 text-primary">✓</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};
