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

import { schema } from '@osd/config-schema';
import { CustomPanelsAdaptor } from '../../adaptors/custom_panels/custom_panel_adaptor';
import {
  IRouter,
  IOpenSearchDashboardsResponse,
  ResponseError,
  ILegacyScopedClusterClient,
} from '../../../../../src/core/server';
import { CUSTOM_PANELS_API_PREFIX as API_PREFIX } from '../../../common/constants/custom_panels';

export function PanelsRouter(router: IRouter) {
  const customPanelBackend = new CustomPanelsAdaptor();
  // Fetch all the custom panels available
  router.get(
    {
      path: `${API_PREFIX}/panels`,
      validate: {},
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      const opensearchNotebooksClient: ILegacyScopedClusterClient = context.observability_plugin.observabilityClient.asScoped(
        request
      );

      let panelsList;
      try {
        panelsList = await customPanelBackend.viewPanelList(opensearchNotebooksClient);
        return response.ok({
          body: {
            panels: panelsList,
          },
        });
      } catch (error) {
        console.log('Issue in fetching panels:', error);
        return response.custom({
          statusCode: error.statusCode || 500,
          body: error.message,
        });
      }
    }
  );

  // Fetch the required panel by id
  router.get(
    {
      path: `${API_PREFIX}/panels/{panelId}`,
      validate: {
        params: schema.object({
          panelId: schema.string(),
        }),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      let panelObject;
      const opensearchNotebooksClient: ILegacyScopedClusterClient = context.observability_plugin.observabilityClient.asScoped(
        request
      );

      try {
        panelObject = await customPanelBackend.getPanel(
          opensearchNotebooksClient,
          request.params.panelId
        );
        return response.ok({
          body: panelObject,
        });
      } catch (error) {
        console.log('Issue in fetching panel:', error);
        return response.custom({
          statusCode: error.statusCode || 500,
          body: error.message,
        });
      }
    }
  );

  //Create a new panel
  router.post(
    {
      path: `${API_PREFIX}/panels`,
      validate: {
        body: schema.object({
          panelName: schema.string(),
        }),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      let newPanelId: string;

      const opensearchNotebooksClient: ILegacyScopedClusterClient = context.observability_plugin.observabilityClient.asScoped(
        request
      );
      try {
        newPanelId = await customPanelBackend.createNewPanel(
          opensearchNotebooksClient,
          request.body.panelName
        );
        return response.ok({
          body: {
            message: 'Panel Created',
            newPanelId: newPanelId,
          },
        });
      } catch (error) {
        console.log('Issue in creating new panel', error);
        return response.custom({
          statusCode: error.statusCode || 500,
          body: error.message,
        });
      }
    }
  );

  // rename an existing panel
  router.patch(
    {
      path: `${API_PREFIX}/panels/rename`,
      validate: {
        body: schema.object({
          panelId: schema.string(),
          panelName: schema.string(),
        }),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      const opensearchNotebooksClient: ILegacyScopedClusterClient = context.observability_plugin.observabilityClient.asScoped(
        request
      );

      try {
        const responseBody = await customPanelBackend.renamePanel(
          opensearchNotebooksClient,
          request.body.panelId,
          request.body.panelName
        );
        return response.ok({
          body: {
            message: 'Panel Renamed',
          },
        });
      } catch (error) {
        console.log('Issue in renaming panel', error);
        return response.custom({
          statusCode: error.statusCode || 500,
          body: error.message,
        });
      }
    }
  );

  // clones an existing panel
  // returns new panel Id
  router.post(
    {
      path: `${API_PREFIX}/panels/clone`,
      validate: {
        body: schema.object({
          panelId: schema.string(),
          panelName: schema.string(),
        }),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      const opensearchNotebooksClient: ILegacyScopedClusterClient = context.observability_plugin.observabilityClient.asScoped(
        request
      );

      try {
        const cloneResponse = await customPanelBackend.clonePanel(
          opensearchNotebooksClient,
          request.body.panelId,
          request.body.panelName
        );
        return response.ok({
          body: {
            message: 'Panel Cloned',
            clonePanelId: cloneResponse.clonePanelId,
            dateCreated: cloneResponse.dateCreated,
            dateModified: cloneResponse.dateModified,
          },
        });
      } catch (error) {
        console.log('Issue in renaming panel', error);
        return response.custom({
          statusCode: error.statusCode || 500,
          body: error.message,
        });
      }
    }
  );

  // delete an existing panel
  router.delete(
    {
      path: `${API_PREFIX}/panels/{panelId}`,
      validate: {
        params: schema.object({
          panelId: schema.string(),
        }),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      const opensearchNotebooksClient: ILegacyScopedClusterClient = context.observability_plugin.observabilityClient.asScoped(
        request
      );
      const panelId = request.params.panelId;

      try {
        const deleteResponse = await customPanelBackend.deletePanel(
          opensearchNotebooksClient,
          panelId
        );
        return response.noContent({
          body: {
            message: 'Panel Deleted',
          },
        });
      } catch (error) {
        console.log('Issue in deleting panel', error);
        return response.custom({
          statusCode: error.statusCode || 500,
          body: error.message,
        });
      }
    }
  );

  // replaces the ppl query filter in panel
  router.patch(
    {
      path: `${API_PREFIX}/panels/filter`,
      validate: {
        body: schema.object({
          panelId: schema.string(),
          query: schema.string(),
          language: schema.string(),
          to: schema.string(),
          from: schema.string(),
        }),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      const opensearchNotebooksClient: ILegacyScopedClusterClient = context.observability_plugin.observabilityClient.asScoped(
        request
      );

      try {
        const panelFilterResponse = await customPanelBackend.addPanelFilter(
          opensearchNotebooksClient,
          request.body.panelId,
          request.body.query,
          request.body.language,
          request.body.to,
          request.body.from
        );
        return response.ok({
          body: {
            message: 'Panel PPL Filter Changed',
          },
        });
      } catch (error) {
        console.log('Issue in adding query filter', error);
        return response.custom({
          statusCode: error.statusCode || 500,
          body: error.message,
        });
      }
    }
  );
}
