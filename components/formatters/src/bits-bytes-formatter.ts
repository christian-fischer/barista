import { coerceNumberProperty } from '@angular/cdk/coercion';

import { DtFormattedValue, FormattedData, SourceData } from './formatted-value';
import { DtNumberFormatOptions, adjustNumber } from './number-formatter';
import { DtUnit } from './unit';

export interface DtUnitConversion {
  multiplier: number;
  unit: DtUnit;
}

/** Util function used to format a number to either Bits or Bytes */
export function formatToBitsBytes(
  input: DtFormattedValue | number,
  conversions: DtUnitConversion[],
  options: DtNumberFormatOptions,
): DtFormattedValue {
  const sourceData: SourceData =
    input instanceof DtFormattedValue
      ? input.sourceData
      : {
          input,
          unit: options.inputUnit,
        };

  let formattedData: FormattedData = {};
  const value = coerceNumberProperty(sourceData.input, NaN);
  if (!isNaN(value)) {
    const valueInUnit = convertToUnit(value, conversions, sourceData.unit);
    const conversion = options.outputUnit
      ? getFixedUnitConversion(conversions, options.outputUnit)
      : getAutoUnitConversion(conversions, valueInUnit);
    const convertedValue = conversion
      ? valueInUnit / conversion.multiplier
      : valueInUnit;
    const convertedUnit = conversion ? conversion.unit : options.inputUnit;

    formattedData = {
      transformedValue: convertedValue,
      displayValue: adjustNumber(convertedValue),
      displayUnit: convertedUnit,
      displayRateUnit:
        input instanceof DtFormattedValue
          ? input.displayData.displayRateUnit
          : undefined,
    };
  }

  return new DtFormattedValue(sourceData, formattedData);
}

/** Converts number to given unit by applying the corect conversionrate */
function convertToUnit(
  input: number,
  conversions: DtUnitConversion[],
  inputUnit: string,
): number {
  const conversion = conversions.find(m => m.unit === inputUnit);
  return conversion !== undefined ? input * conversion.multiplier : input;
}

function getAutoUnitConversion(
  conversions: DtUnitConversion[],
  valueInUnit: number,
): DtUnitConversion | undefined {
  return conversions.find(m => valueInUnit >= m.multiplier);
}

function getFixedUnitConversion(
  conversions: DtUnitConversion[],
  outputUnit: string,
): DtUnitConversion | undefined {
  return conversions.find(m => m.unit === outputUnit);
}