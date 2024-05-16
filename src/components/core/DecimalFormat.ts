export const DecimalFormat = (value: string | number): string | number => {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  if (Number.isFinite(numericValue)) {
    const formattedValue =
      numericValue % 1 === 0
        ? numericValue.toFixed(0)
        : numericValue.toFixed(2);
    return formattedValue.toString().replace(/\.00$/, "");
  }

  return +numericValue;
};