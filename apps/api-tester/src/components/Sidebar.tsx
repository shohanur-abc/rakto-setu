import { useMemo, useState } from "react"
import {
    endpointGroups,
    endpointKey,
    type EndpointDef,
} from "@/lib/endpoints"

// Left-hand navigation: groups from the catalog, filterable by a search box.
export function Sidebar({
    selectedKey,
    onSelect,
}: {
    selectedKey: string
    onSelect: (endpoint: EndpointDef) => void
}) {
    const [filter, setFilter] = useState("")

    const groups = useMemo(() => {
        const q = filter.trim().toLowerCase()
        if (!q) return endpointGroups
        return endpointGroups
            .map((group) => ({
                ...group,
                endpoints: group.endpoints.filter(
                    (e) =>
                        e.title.toLowerCase().includes(q) ||
                        e.path.toLowerCase().includes(q) ||
                        e.method.toLowerCase().includes(q)
                ),
            }))
            .filter((group) => group.endpoints.length > 0)
    }, [filter])

    return (
        <nav className="sidebar">
            <input
                className="filter-input"
                aria-label="Filter endpoints"
                placeholder="Filter endpoints…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            />
            {groups.map((group) => (
                <div key={group.name} className="nav-group">
                    <h3 className="nav-group-title">{group.name}</h3>
                    <ul>
                        {group.endpoints.map((endpoint) => {
                            const key = endpointKey(endpoint)
                            return (
                                <li key={key}>
                                    <button
                                        type="button"
                                        className={`nav-item${key === selectedKey ? " active" : ""}`}
                                        onClick={() => onSelect(endpoint)}
                                    >
                                        <span
                                            className={`method method-${endpoint.method.toLowerCase()}`}
                                        >
                                            {endpoint.method}
                                        </span>
                                        <span className="nav-item-title">
                                            {endpoint.title}
                                        </span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            ))}
        </nav>
    )
}
