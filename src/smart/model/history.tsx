import React from 'react';
import { ModelWrapper } from './modelwrapper';

interface Breadcrumb {
  label: JSX.Element;
  onNavigate: () => void;
}

export interface HistoryItem {
  page: string;
  pathtext: string;
}

export interface PageHistory {
  items: HistoryItem[];
}

export function cloneHistory(history: PageHistory): PageHistory {
  return {
    items: history.items.map(item => ({
      page: item.page,
      pathtext: item.pathtext,
    })),
  };
}

export function createPageHistory(mw: ModelWrapper): PageHistory {
  return {
    items: [
      {
        page: mw.model.root,
        pathtext:
          mw.model.meta.namespace === '' ? 'root' : mw.model.meta.namespace,
      },
    ],
  };
}

export function getBreadcrumbs(
  ph: PageHistory,
  onPageChange: (updated: PageHistory, newPage: string) => void
): Breadcrumb[] {
  const breadcrumbs: Breadcrumb[] = [];
  ph.items.forEach((item, index) => {
    breadcrumbs.push({
      label: <>{item.pathtext}</>,
      onNavigate: () => {
        const page = popUntil(ph, index);
        onPageChange(ph, page);
      },
    });
  });
  return breadcrumbs;
}

export function addToHistory(
  ph: PageHistory,
  pageid: string,
  label: string
): void {
  ph.items.push({
    page: pageid,
    pathtext: label,
  });
}

export function popPage(ph: PageHistory): string {
  if (ph.items.length > 1) {
    ph.items.pop();
  }
  return ph.items[ph.items.length - 1].page;
}

export function popUntil(ph: PageHistory, i: number): string {
  while (i + 1 < ph.items.length) {
    ph.items.pop();
  }
  return ph.items[ph.items.length - 1].page;
}
