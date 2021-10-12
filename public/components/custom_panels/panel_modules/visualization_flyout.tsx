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

import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiCallOut,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiIcon,
  EuiLoadingChart,
  EuiSelect,
  EuiSelectOption,
  EuiSpacer,
  EuiText,
  EuiTitle,
  htmlIdGenerator,
  ShortDate,
} from '@elastic/eui';
import _ from 'lodash';
import { UI_DATE_FORMAT } from '../../../../common/constants/shared';
import React, { useEffect, useState } from 'react';
import { FlyoutContainers } from '../helpers/flyout_containers';
import {
  displayVisualization,
  getNewVizDimensions,
  getQueryResponse,
  isDateValid,
  onTimeChange,
  savedVisualizationsQueryBuilder,
} from '../helpers/utils';
import { convertDateTime } from '../helpers/utils';
import PPLService from '../../../services/requests/ppl';
import { CoreStart } from '../../../../../../src/core/public';
import { CUSTOM_PANELS_API_PREFIX } from '../../../../common/constants/custom_panels';
import {
  pplResponse,
  SavedVisualizationType,
  VisualizationType,
} from '../../../../common/types/custom_panels';

type Props = {
  panelId: string;
  closeFlyout: () => void;
  start: ShortDate;
  end: ShortDate;
  setToast: (
    title: string,
    color?: string,
    text?: React.ReactChild | undefined,
    side?: string | undefined
  ) => void;
  http: CoreStart['http'];
  pplService: PPLService;
  panelVisualizations: VisualizationType[];
  setPanelVisualizations: React.Dispatch<React.SetStateAction<VisualizationType[]>>;
  isFlyoutReplacement?: boolean | undefined;
  replaceVisualizationId?: string | undefined;
};

export const VisaulizationFlyout = ({
  panelId,
  closeFlyout,
  start,
  end,
  setToast,
  http,
  pplService,
  panelVisualizations,
  setPanelVisualizations,
  isFlyoutReplacement,
  replaceVisualizationId,
}: Props) => {
  const [newVisualizationTitle, setNewVisualizationTitle] = useState('');
  const [newVisualizationType, setNewVisualizationType] = useState('');
  const [newVisualizationTimeField, setNewVisualizationTimeField] = useState('');
  const [pplQuery, setPPLQuery] = useState('');
  const [previewData, setPreviewData] = useState<pplResponse>({} as pplResponse);
  const [previewArea, setPreviewArea] = useState(<></>);
  const [showPreviewArea, setShowPreviewArea] = useState(false);
  const [previewIconType, setPreviewIconType] = useState('arrowRight');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isPreviewError, setIsPreviewError] = useState('');
  const [savedVisualizations, setSavedVisualizations] = useState<SavedVisualizationType[]>([]);
  const [visualizationOptions, setVisualizationOptions] = useState<EuiSelectOption[]>([]);
  const [selectValue, setSelectValue] = useState('');

  // DateTimePicker States
  const startDate = convertDateTime(start, true, false);
  const endDate = convertDateTime(end, false, false);

  const onPreviewClick = () => {
    if (previewIconType == 'arrowRight') {
      setPreviewIconType('arrowUp');
      setShowPreviewArea(true);
    } else {
      setPreviewIconType('arrowRight');
      setShowPreviewArea(false);
    }
  };

  const isInputValid = () => {
    if (!isDateValid(convertDateTime(start), convertDateTime(end, false), setToast, 'left')) {
      return false;
    }

    if (selectValue === '') {
      setToast('Please make a valid selection', 'danger', undefined, 'left');
      return false;
    }

    return true;
  };

  const addVisualization = () => {
    if (!isInputValid()) return;
    // Adding bang(!) operator here and the newdimensions cannot be null or undefined,
    // as they come from presaved visualization
    // let newDimensions!: {
    //   x: number;
    //   y: number;
    //   w: number;
    //   h: number;
    // };
    // let visualizationsList = [] as VisualizationType[];

    if (isFlyoutReplacement) {
      // panelVisualizations.map((visualization) => {
      //   if (visualization.id != replaceVisualizationId) {
      //     visualizationsList.push(visualization);
      //   } else {
      //     newDimensions = {
      //       x: visualization.x,
      //       y: visualization.y,
      //       w: visualization.w,
      //       h: visualization.h,
      //     };
      //   }
      // });

      http
        .post(`${CUSTOM_PANELS_API_PREFIX}/visualizations/replace`, {
          body: JSON.stringify({
            panelId: panelId,
            oldVisualizationId: replaceVisualizationId,
            newVisualization: {
              id: 'panelViz_' + htmlIdGenerator()(),
              title: newVisualizationTitle,
              query: pplQuery,
              type: newVisualizationType,
              timeField: newVisualizationTimeField,
            },
          }),
        })
        .then(async (res) => {
          setPanelVisualizations(res.visualizations);
          setToast(`Visualization ${newVisualizationTitle} successfully added!`, 'success');
        })
        .catch((err) => {
          setToast(`Error in adding ${newVisualizationTitle} visualization to the panel`, 'danger');
          console.error(err);
        });
    } else {
      // visualizationsList = panelVisualizations;
      // newDimensions = getNewVizDimensions(panelVisualizations);
      console.log('added time', newVisualizationTimeField);
      http
        .post(`${CUSTOM_PANELS_API_PREFIX}/visualizations`, {
          body: JSON.stringify({
            panelId: panelId,
            newVisualization: {
              id: 'panelViz_' + htmlIdGenerator()(),
              title: newVisualizationTitle,
              query: pplQuery,
              type: newVisualizationType,
              timeField: newVisualizationTimeField,
            },
          }),
        })
        .then(async (res) => {
          // console.log('here it is', res);
          setPanelVisualizations(res.visualizations);
          setToast(`Visualization ${newVisualizationTitle} successfully added!`, 'success');
        })
        .catch((err) => {
          setToast(`Error in adding ${newVisualizationTitle} visualization to the panel`, 'danger');
          console.error(err);
        });
    }

    // setPanelVisualizations([
    //   ...visualizationsList,
    //   {
    //     id: 'panelViz_' + htmlIdGenerator()(),
    //     title: newVisualizationTitle,
    //     query: pplQuery,
    //     type: newVisualizationType,
    //     ...newDimensions,
    //   },
    // ]);

    //NOTE: Add a backend call to add a visualization
    // setToast(
    //   `Visualization ${newVisualizationTitle} successfully added!`,
    //   'success',
    //   undefined,
    //   'left'
    // );
    closeFlyout();
  };

  const onRefreshPreview = () => {
    if (!isInputValid()) return;

    getQueryResponse(
      pplService,
      pplQuery,
      newVisualizationType,
      start,
      end,
      setPreviewData,
      setPreviewLoading,
      setIsPreviewError,
      '',
      newVisualizationTimeField
    );
  };

  const timeRange = (
    <EuiFormRow label="Panel Time Range">
      <EuiDatePickerRange
        style={{ height: '3vh' }}
        readOnly
        startDateControl={
          <EuiDatePicker
            selected={startDate}
            startDate={startDate}
            endDate={endDate}
            isInvalid={startDate > endDate}
            aria-label="Start date"
            dateFormat={UI_DATE_FORMAT}
          />
        }
        endDateControl={
          <EuiDatePicker
            selected={endDate}
            startDate={startDate}
            endDate={endDate}
            isInvalid={startDate > endDate}
            aria-label="End date"
            dateFormat={UI_DATE_FORMAT}
          />
        }
      />
    </EuiFormRow>
  );

  const flyoutHeader = (
    <EuiFlyoutHeader hasBorder>
      <EuiTitle size="m">
        <h2 id="addVisualizationFlyout">
          {isFlyoutReplacement ? 'Replace Visualization' : 'Select Existing Visualization'}
        </h2>
      </EuiTitle>
    </EuiFlyoutHeader>
  );

  const onChangeSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectValue(e.target.value);
  };

  const emptySavedVisualizations = (
    <EuiCallOut iconType="help">
      <p>No saved visualizations found!</p>
    </EuiCallOut>
  );

  const flyoutBody =
    savedVisualizations.length > 0 ? (
      <EuiFlyoutBody>
        <>
          <EuiSpacer size="l" />
          <EuiFormRow label="Visualization name">
            <EuiSelect
              hasNoInitialSelection
              onChange={(e) => onChangeSelection(e)}
              options={visualizationOptions}
            />
          </EuiFormRow>
          <EuiSpacer size="l" />
          <EuiSpacer size="l" />
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                iconSide="left"
                onClick={onPreviewClick}
                iconType={previewIconType}
                size="s"
                isLoading={previewLoading}
              >
                Preview
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                aria-label="refreshPreview"
                iconType="refresh"
                onClick={onRefreshPreview}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="m" />
          {showPreviewArea && previewArea}
          <EuiSpacer size="m" />
        </>
      </EuiFlyoutBody>
    ) : (
      <EuiFlyoutBody banner={emptySavedVisualizations}>
        <>
          <div>
            You don't have any saved visualizations. Please use the "create new visualization"
            option in add visualization menu.
          </div>
        </>
      </EuiFlyoutBody>
    );

  const flyoutFooter = (
    <EuiFlyoutFooter>
      <EuiFlexGroup gutterSize="s" justifyContent="spaceBetween">
        <EuiFlexItem grow={false}>
          <EuiButton onClick={closeFlyout}>Cancel</EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={addVisualization} fill>
            Add
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlyoutFooter>
  );

  // Fetch all saved visualizations
  const fetchSavedVisualizations = async () => {
    return http
      .get(`${CUSTOM_PANELS_API_PREFIX}/visualizations`)
      .then((res) => {
        if (res.visualizations.length > 0) {
          setSavedVisualizations(res.visualizations);
          setVisualizationOptions(
            res.visualizations.map((visualization: SavedVisualizationType) => {
              return { value: visualization.id, text: visualization.name };
            })
          );
        }
      })
      .catch((err) => {
        console.error('Issue in fetching the operational panels', err);
      });
  };

  useEffect(() => {
    const previewTemplate = (
      <>
        {timeRange}
        {previewLoading ? (
          <EuiLoadingChart
            size="xl"
            mono
            style={{
              margin: 0,
              position: 'absolute',
              top: '50%',
              left: '50%',
              msTransform: 'translate(-50%, -50%)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ) : isPreviewError != '' ? (
          <div
            style={{
              overflow: 'scroll',
            }}
          >
            <EuiSpacer size="l" />
            <EuiIcon type="alert" color="danger" size="l" />
            <EuiSpacer size="l" />
            <EuiText>
              <h2>Error in rendering the visualizaiton</h2>
            </EuiText>
            <EuiSpacer size="l" />
            <EuiText>
              <p>{isPreviewError}</p>
            </EuiText>
          </div>
        ) : (
          <EuiFlexGroup>
            <EuiFlexItem style={{ minHeight: '200' }}>
              {displayVisualization(previewData, newVisualizationType)}
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
      </>
    );
    setPreviewArea(previewTemplate);
  }, [previewLoading]);

  useEffect(() => {
    // On change of selected visualization change options
    for (var i = 0; i < savedVisualizations.length; i++) {
      const visualization = savedVisualizations[i];
      if (visualization.id === selectValue) {
        setPPLQuery(visualization.query);
        // setPPLQuery(
        //   savedVisualizationsQueryBuilder(visualization.query, visualization.selected_fields)
        // );
        setNewVisualizationTitle(visualization.name);
        setNewVisualizationType(visualization.type);
        console.log('selected time', visualization.timeField);
        setNewVisualizationTimeField(visualization.timeField);
        break;
      }
    }
  }, [selectValue]);

  useEffect(() => {
    // load saved visualizations
    fetchSavedVisualizations();
  }, []);

  return (
    <FlyoutContainers
      closeFlyout={closeFlyout}
      flyoutHeader={flyoutHeader}
      flyoutBody={flyoutBody}
      flyoutFooter={flyoutFooter}
      ariaLabel="addVisualizationFlyout"
    />
  );
};
