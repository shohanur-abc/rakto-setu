const escapeCell = (value: string | number | boolean | null | undefined) => {
    const text = value == null ? '' : String(value);

    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export const toCsv = (
    headers: string[],
    rows: Array<Array<string | number | boolean | null | undefined>>,
) => [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
