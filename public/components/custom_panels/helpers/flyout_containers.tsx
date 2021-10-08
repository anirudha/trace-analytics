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
  EuiFlyout,
} from '@elastic/eui';
import React from 'react';

type Props = {
  closeFlyout: () => void;
  flyoutHeader: JSX.Element;
  flyoutBody: JSX.Element;
  flyoutFooter: JSX.Element;
  ariaLabel: string;
};

export const FlyoutContainers = ({
  closeFlyout,
  flyoutHeader,
  flyoutBody,
  flyoutFooter,
  ariaLabel,
}: Props) => {
  return (
    <div>
      <EuiFlyout ownFocus={false} onClose={() => closeFlyout()} aria-labelledby={ariaLabel}>
        {flyoutHeader}
        {flyoutBody}
        {flyoutFooter}
      </EuiFlyout>
    </div>
  );
};
