import {DashUrls} from '../../constants/test-entities/dash';
import {DashParametrizationConfig} from '../../types/config/dash';

export const dash: DashParametrizationConfig = {
    urls: {
        DashboardWithLongContentBeforeChart: DashUrls.DashboardWithLongContentBeforeChart,
        DashboardLoadPriorityCharts: DashUrls.DashboardLoadPriorityCharts,
        DashboardLoadPrioritySelectors: DashUrls.DashboardLoadPrioritySelectors,
        DashboardWithTabsAndSelectors: DashUrls.DashboardWithTabsAndSelectors,
        DashboardMoreThan100Revisions: DashUrls.DashboardMoreThan100Revisions,
        DashboardWithErrorChart: DashUrls.DashboardWithErrorChart,
        DashboardWithAPIErrorChart: DashUrls.DashboardWithAPIErrorChart,
    },
};
