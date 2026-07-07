import { useState } from "react"
import { AuthBar } from "@/components/AuthBar"
import { Sidebar } from "@/components/Sidebar"
import { EndpointRunner } from "@/components/EndpointRunner"
import { allEndpoints, endpointKey, type EndpointDef } from "@/lib/endpoints"

export default function App() {
    // Default to the login endpoint — the usual first step when testing.
    const [selected, setSelected] = useState<EndpointDef>(
        () => allEndpoints.find((e) => e.captureToken) ?? allEndpoints[0]
    )

    return (
        <div className="app">
            <AuthBar />
            <div className="layout">
                <Sidebar
                    selectedKey={endpointKey(selected)}
                    onSelect={setSelected}
                />
                <main className="content">
                    <EndpointRunner
                        key={endpointKey(selected)}
                        endpoint={selected}
                    />
                </main>
            </div>
        </div>
    )
}
