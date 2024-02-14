import {
    DATASET_FIELD_TYPES,
    ExtendedSeriesLineOptions,
    MINIMUM_FRACTION_DIGITS,
    PlaceholderId,
    getDistinctValue,
    getFakeTitleOrTitle,
    isMeasureName,
    isMeasureValue,
    isNumberField,
    isPseudoField,
} from '../../../../../../../shared';
import {ChartColorsConfig} from '../../js/helpers/colors';
import {ColorValue, getColorsByMeasureField, getThresholdValues} from '../../utils/color-helpers';
import {getColor, getMountedColor} from '../../utils/constants';
import {findIndexInOrder} from '../../utils/misc-helpers';
import {addActionParamValue} from '../helpers/action-params';
import {PiePoint, PrepareFunctionArgs} from '../types';

import {getFormattedValue, isColoringByMeasure} from './utils';

export type PieConfig = {
    name: string;
    dataLabels: any;
    tooltip: any;
    data?: (PiePoint & ExtendedSeriesLineOptions)[];
    showInLegend?: boolean;
};

function mapAndColorizePieByGradient(
    points: (PiePoint & ExtendedSeriesLineOptions)[],
    colorsConfig: ChartColorsConfig,
) {
    const colorValues = points.map((point) => Number(point.colorValue) as ColorValue);

    const gradientThresholdValues = getThresholdValues(colorsConfig, colorValues);
    const gradientColors = getColorsByMeasureField({
        values: colorValues,
        colorsConfig,
        gradientThresholdValues,
    });

    points.forEach((point) => {
        const pointColorValue = Number(point.colorValue);

        if (gradientColors[pointColorValue]) {
            point.color = gradientColors[pointColorValue];
        }
    });

    return points;
}

function getPieSegmentColor({
    item,
    colorsConfig,
    usedColors = [],
}: {
    item: PiePoint;
    colorsConfig: ChartColorsConfig;
    usedColors?: (string | undefined)[];
}) {
    if (
        colorsConfig &&
        colorsConfig.mountedColors &&
        (item.colorGuid === colorsConfig.fieldGuid || colorsConfig.coloredByMeasure) &&
        item.colorValue &&
        colorsConfig.mountedColors[item.colorValue]
    ) {
        return getMountedColor(colorsConfig, item.colorValue);
    }

    const value = String(item.colorValue);
    let colorIndex = usedColors.indexOf(value);
    if (colorIndex === -1) {
        usedColors.push(value);
        colorIndex = usedColors.length - 1;
    }

    return getColor(colorIndex, colorsConfig.colors);
}

// eslint-disable-next-line complexity
export function preparePieData(args: PrepareFunctionArgs) {
    const {
        placeholders,
        resultData,
        sort,
        labels,
        colorsConfig,
        idToTitle,
        idToDataType,
        ChartEditor,
        disableDefaultSorting = false,
    } = args;
    const {data, order, totals} = resultData;
    const widgetConfig = ChartEditor.getWidgetConfig();

    const measure = placeholders.find((p) => p.id === PlaceholderId.Measures)?.items[0];
    const colorField = placeholders.find((p) => p.id === PlaceholderId.Colors)?.items[0];
    const dimensionField = placeholders.find((p) => p.id === PlaceholderId.Dimensions)?.items[0];

    if (!measure) {
        return {graphs: []};
    }

    const colorIndex = colorField
        ? findIndexInOrder(order, colorField, idToTitle[colorField.guid])
        : -1;
    const shouldUseGradient = isColoringByMeasure(args);
    const dimensionIndex = dimensionField
        ? findIndexInOrder(order, dimensionField, idToTitle[dimensionField.guid])
        : -1;

    const labelItem = labels?.[0];
    const labelField = labelItem
        ? {...labelItem, data_type: idToDataType[labelItem.guid]}
        : labelItem;
    const labelIndex = labelField
        ? findIndexInOrder(order, labelField, idToTitle[labelField.guid])
        : -1;

    const measureIndex = findIndexInOrder(order, measure, idToTitle[measure.guid]);
    const measureDataType = idToDataType[measure.guid] || measure.data_type;

    if (measureIndex === -1) {
        return {graphs: []};
    }

    const title = idToTitle[measure.guid];
    const name =
        title.includes(measure.guid) && measure.originalTitle ? measure.originalTitle : title;
    const measureFormatting = measure?.formatting;
    const labelFormatting = isMeasureValue(labelField) ? measureFormatting : labelField?.formatting;
    const labelFinalDataType = isPseudoField(labelField) ? measureDataType : labelField?.data_type;

    const pie: PieConfig = {
        name,
        tooltip:
            measureFormatting && Object.keys(measureFormatting).length
                ? {
                      chartKitFormatting: true,
                      chartKitPrecision: measureFormatting.precision,
                      chartKitPrefix: measureFormatting.prefix,
                      chartKitPostfix: measureFormatting.postfix,
                      chartKitUnit: measureFormatting.unit,
                      chartKitFormat: measureFormatting.format,
                      chartKitLabelMode: measureFormatting.labelMode,
                      chartKitShowRankDelimiter: measureFormatting.showRankDelimiter,
                  }
                : {
                      chartKitFormatting: true,
                      chartKitPrecision: measureDataType === 'float' ? MINIMUM_FRACTION_DIGITS : 0,
                  },
        dataLabels:
            labelFormatting && Object.keys(labelFormatting).length
                ? {
                      // need to reset dataLabels.format to use dataLabels.formatter
                      format: null,
                      chartKitFormatting: true,
                      chartKitPrecision: labelFormatting.precision,
                      chartKitPrefix: labelFormatting.prefix,
                      chartKitPostfix: labelFormatting.postfix,
                      chartKitUnit: labelFormatting.unit,
                      chartKitLabelMode: labelFormatting.labelMode,
                      chartKitFormat: labelFormatting.format,
                      chartKitShowRankDelimiter: labelFormatting.showRankDelimiter,
                  }
                : {
                      chartKitFormatting: true,
                      chartKitPrecision:
                          labelFinalDataType === DATASET_FIELD_TYPES.FLOAT
                              ? MINIMUM_FRACTION_DIGITS
                              : 0,
                  },
    };

    const usedColors: string[] = [];
    pie.data = data
        .map((values) => {
            const dimensionValue = values[dimensionIndex];
            const measureValue = values[measureIndex];
            const colorFieldValue = values[colorIndex];
            const labelValue = values[labelIndex];

            let colorValue: string | number = name;
            const legendParts: string[] = [];
            const formattedNameParts: string[] = [];

            if (dimensionField) {
                legendParts.push(String(dimensionValue));
                formattedNameParts.push(
                    getFormattedValue(dimensionValue, {
                        ...dimensionField,
                        data_type: idToDataType[dimensionField.guid],
                    }),
                );
            }

            if (colorField && typeof colorFieldValue !== 'undefined') {
                if (shouldUseGradient) {
                    colorValue = Number(colorFieldValue);
                } else {
                    colorValue = getDistinctValue(colorFieldValue);
                    legendParts.push(String(colorFieldValue));
                    formattedNameParts.push(
                        getFormattedValue(colorFieldValue, {
                            ...colorField,
                            data_type: idToDataType[colorField.guid],
                        }),
                    );
                }
            }

            const pointName = legendParts.join(': ') || getFakeTitleOrTitle(measure);
            const formattedName = formattedNameParts.join(': ');

            const point: PiePoint = {
                name: pointName,
                formattedName,
                drillDownFilterValue: pointName,
                y: Number(measureValue),
                colorGuid: colorField?.guid,
                colorValue,
            };
            point.color = getPieSegmentColor({item: point, colorsConfig, usedColors});

            if (labelField) {
                if (isMeasureName(labelField)) {
                    point.label = formattedName;
                } else if (isMeasureValue(labelField)) {
                    point.label = Number(measureValue);
                } else if (isNumberField(labelField)) {
                    // The value will be formatted using dataLabels.chartKitFormatting
                    point.label = Number(labelValue);
                } else {
                    point.label = getFormattedValue(labelValue, {
                        ...labelField,
                        data_type: idToDataType[labelField.guid],
                    });
                }
            }

            if (widgetConfig?.actionParams?.enable) {
                const actionParams: Record<string, any> = {};
                addActionParamValue(actionParams, dimensionField, dimensionValue);
                addActionParamValue(actionParams, colorField, colorValue);

                point.custom = {
                    actionParams,
                };
            }

            return point;
        })
        // We remove negative values, since pie does not know how to display them
        .filter((point) => point.y > 0) as (PiePoint & ExtendedSeriesLineOptions)[];

    if (!disableDefaultSorting && (!sort || !sort.length)) {
        pie.data.sort((a, b) => {
            return a.y > b.y ? -1 : a.y < b.y ? 1 : 0;
        });
    }

    if (shouldUseGradient) {
        pie.data = mapAndColorizePieByGradient(pie.data, colorsConfig);
    }

    return {graphs: [pie], totals: totals.find((value) => value), label: labelField, measure};
}

export default preparePieData;
