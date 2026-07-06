// Renders any value as pretty-printed, syntax-highlighted JSON (or raw text
// for non-JSON payloads like CSV exports). Kept dependency-free: a tiny
// tokenizer wraps JSON pieces in spans that the stylesheet colours.

function highlight(json: string): string {
    // Escape HTML first so response content can never inject markup.
    const escaped = json
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")

    return escaped.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
        (match) => {
            let cls = "tok-num"
            if (/^"/.test(match)) {
                cls = /:$/.test(match) ? "tok-key" : "tok-str"
            } else if (/true|false/.test(match)) {
                cls = "tok-bool"
            } else if (/null/.test(match)) {
                cls = "tok-null"
            }
            return `<span class="${cls}">${match}</span>`
        }
    )
}

export function JsonViewer({
    value,
    isJson,
}: {
    value: unknown
    isJson: boolean
}) {
    const text = isJson
        ? JSON.stringify(value, null, 2)
        : typeof value === "string"
          ? value
          : String(value)

    return (
        <pre className="json-viewer">
            {isJson ? (
                <code dangerouslySetInnerHTML={{ __html: highlight(text) }} />
            ) : (
                <code>{text}</code>
            )}
        </pre>
    )
}
