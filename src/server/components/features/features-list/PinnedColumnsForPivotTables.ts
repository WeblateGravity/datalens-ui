import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.PinnedColumnsForPivotTables,
    state: {
        development: false,
        production: false,
    },
});
