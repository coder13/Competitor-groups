import { ComponentType, ReactNode } from 'react';
import type { To } from 'react-router-dom';

export interface LinkRendererProps {
  to: To;
  className?: string;
  children: ReactNode;
}

export type LinkRenderer = ComponentType<LinkRendererProps>;

export const AnchorLink: LinkRenderer = ({ to, className, children }) => (
  <a className={className} href={typeof to === 'string' ? to : to.pathname || ''}>
    {children}
  </a>
);
