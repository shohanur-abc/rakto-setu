import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "@workspace/ui/globals.css"
import { App } from "@/app"
import { Providers } from "@/components/providers"

const rootElement = document.getElementById("root")

if (!rootElement) {
    throw new Error("Root element #root was not found")
}

createRoot(rootElement).render(
    <StrictMode>
        <BrowserRouter>
            <Providers>
                <App />
            </Providers>
        </BrowserRouter>
    </StrictMode>
)
