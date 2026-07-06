import { Navigate, Outlet, Route, Routes, useParams } from "react-router-dom"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { I18nProvider } from "@/lib/i18n/context"
import { defaultLocale, isLocale } from "@/lib/i18n/config"
import { HomePage } from "@/routes/home"
import { LoginPage } from "@/routes/login"
import { NotFoundPage } from "@/routes/not-found"

function LocaleLayout() {
    const { lang } = useParams<{ lang: string }>()

    if (!isLocale(lang ?? "")) {
        return <Navigate to={`/${defaultLocale}`} replace />
    }

    return (
        <I18nProvider>
            <div className="@container isolate">
                <Header />
                <main>
                    <Outlet />
                </main>
                <Footer />
            </div>
        </I18nProvider>
    )
}

export function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to={`/${defaultLocale}`} replace />} />
            <Route path="/:lang" element={<LocaleLayout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    )
}
