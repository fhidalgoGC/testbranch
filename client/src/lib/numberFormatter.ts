export interface NumberFormatterOptions {
  minDecimals: number;
  maxDecimals: number;
  value: number | string | null | undefined;
  formatPattern: "0.000,00" | "0,000.00";
  roundMode: "up" | "down" | "truncate";
}

export function formatNumber({
  minDecimals,
  maxDecimals,
  value,
  formatPattern,
  roundMode
}: NumberFormatterOptions): string {
  // Handle null, undefined, NaN or invalid values
  if (value === null || value === undefined || value === "" || 
      (typeof value === 'string' && isNaN(parseFloat(value))) ||
      (typeof value === 'number' && isNaN(value))) {
    // Return "0" formatted according to pattern
    const decimalSeparator = formatPattern === "0.000,00" ? "," : ".";
    const zeros = "0".repeat(minDecimals);
    return minDecimals > 0 ? `0${decimalSeparator}${zeros}` : "0";
  }

  // Convert to number
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const isNegative = numValue < 0;
  const absValue = Math.abs(numValue);

  // Determine separators from pattern
  const thousandsSeparator = formatPattern === "0.000,00" ? "." : ",";
  const decimalSeparator = formatPattern === "0.000,00" ? "," : ".";

  // Convert to string with maximum precision to avoid floating point issues
  let numStr = absValue.toFixed(20);
  
  // Find decimal point position
  const decimalIndex = numStr.indexOf('.');
  let integerPart = decimalIndex >= 0 ? numStr.substring(0, decimalIndex) : numStr;
  let decimalPart = decimalIndex >= 0 ? numStr.substring(decimalIndex + 1) : '';

  // Remove trailing zeros from decimal part
  decimalPart = decimalPart.replace(/0+$/, '');

  // Apply rounding/truncating based on maxDecimals
  if (decimalPart.length > maxDecimals) {
    if (roundMode === "truncate") {
      decimalPart = decimalPart.substring(0, maxDecimals);
    } else {
      // Get the digit at maxDecimals position for rounding decision
      const nextDigit = parseInt(decimalPart.charAt(maxDecimals));
      decimalPart = decimalPart.substring(0, maxDecimals);
      
      if (roundMode === "up" && nextDigit >= 5) {
        // Round up
        let carry = 1;
        let newDecimal = '';
        for (let i = decimalPart.length - 1; i >= 0; i--) {
          const digit = parseInt(decimalPart.charAt(i)) + carry;
          if (digit >= 10) {
            newDecimal = '0' + newDecimal;
            carry = 1;
          } else {
            newDecimal = digit.toString() + newDecimal;
            carry = 0;
            newDecimal = decimalPart.substring(0, i) + newDecimal;
            break;
          }
        }
        
        if (carry === 1) {
          // Need to carry to integer part
          const intVal = parseInt(integerPart) + 1;
          integerPart = intVal.toString();
          decimalPart = '0'.repeat(maxDecimals);
        } else {
          decimalPart = newDecimal;
        }
      } else if (roundMode === "down" && nextDigit >= 5) {
        // For "down", we don't round up even if nextDigit >= 5
        // Just truncate (already done above)
      }
    }
  }

  // Pad with zeros if needed for minDecimals
  while (decimalPart.length < minDecimals) {
    decimalPart += '0';
  }

  // Add thousands separators to integer part
  let formattedInteger = '';
  const intReversed = integerPart.split('').reverse();
  
  for (let i = 0; i < intReversed.length; i++) {
    if (i > 0 && i % 3 === 0) {
      formattedInteger = thousandsSeparator + formattedInteger;
    }
    formattedInteger = intReversed[i] + formattedInteger;
  }

  // Combine parts
  let result = formattedInteger;
  if (decimalPart.length > 0) {
    result += decimalSeparator + decimalPart;
  }

  // Add negative sign if needed
  if (isNegative) {
    result = '-' + result;
  }

  return result;
}

export function parseFormattedNumber(
  formattedValue: string | null | undefined,
  formatPattern: "0.000,00" | "0,000.00"
): number {
  if (!formattedValue || typeof formattedValue !== 'string') {
    return 0;
  }

  // Determine separators from pattern
  const thousandsSeparator = formatPattern === "0.000,00" ? "." : ",";
  const decimalSeparator = formatPattern === "0.000,00" ? "," : ".";

  // Remove thousands separators
  let cleanValue = formattedValue.replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '');
  
  // Replace decimal separator with standard dot
  if (decimalSeparator !== '.') {
    cleanValue = cleanValue.replace(decimalSeparator, '.');
  }

  // Parse as float
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}