/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

export const CUSTOM_PANELS_API_PREFIX = '/api/observability/operational_panels';
export const CUSTOM_PANELS_DOCUMENTATION_URL = 'https://www.opensearch.org';
export const CREATE_PANEL_MESSAGE = 'Enter a name to describe the purpose of this custom panel.';
export const RENAME_VISUALIZATION_MESSAGE =
  'Enter a name to describe the purpose of this visualization.';

export type VisualizationType = {
  id: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  query: string;
  type: string;
};

export type PanelType = {
  name: string;
  dateCreated: string;
  dateModified: string;
  visualizations: VisualizationType[];
  timeRange: { to: string; from: string };
  queryFilter: { query: string; language: string };
  refreshConfig: { pause: string; value: string };
};

export type SavedVisualizationType = {
  id: string;
  title: string;
  query: string;
  type: string;
};
