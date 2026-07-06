import { Navigate, Outlet, Route, Routes, useParams } from "react-router-dom"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { I18nProvider } from "@/lib/i18n/context"
import { defaultLocale, isLocale } from "@/lib/i18n/config"
import { ProtectedRoute, RoleRoute } from "@/components/route-guards"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

// Public
import { HomePage } from "@/routes/home"
import { LoginPage } from "@/routes/login"
import { NotFoundPage } from "@/routes/not-found"
import { SearchPage } from "@/routes/search"
import { PublicRequestsPage } from "@/routes/requests-public"
import { PublicRequestDetailPage } from "@/routes/request-public-detail"
import { InfoPage } from "@/routes/info"
import { AnnouncementsPage } from "@/routes/announcements"

// Member (any authenticated role)
import { DashboardPage } from "@/routes/dashboard"
import { NotificationsPage } from "@/routes/notifications"
import { ProfilePage } from "@/routes/profile"
import { BecomeDonorPage } from "@/routes/become-donor"

// Recipient
import { RecipientRequestsPage } from "@/routes/recipient/requests"
import { RequestNewPage } from "@/routes/recipient/request-new"
import { RequestDetailPage } from "@/routes/recipient/request-detail"
import { RequestEditPage } from "@/routes/recipient/request-edit"

// Donor
import { DonorOverviewPage } from "@/routes/donor/overview"
import { DonorRequestsPage } from "@/routes/donor/requests"
import { DonorDonationsPage } from "@/routes/donor/donations"
import { DonorProfilePage } from "@/routes/donor/profile"

// Admin
import { AdminDashboardPage } from "@/routes/admin/dashboard"
import { AdminUsersPage } from "@/routes/admin/users"
import { AdminUserDetailPage } from "@/routes/admin/user-detail"
import { AdminDonorsPage } from "@/routes/admin/donors"
import { AdminRequestsPage } from "@/routes/admin/requests"
import { AdminAnnouncementsPage } from "@/routes/admin/announcements"
import { AdminReportsPage } from "@/routes/admin/reports"
import { AdminSettingsPage } from "@/routes/admin/settings"
import { AdminModerationPage } from "@/routes/admin/moderation"

function LocaleLayout() {
    const { lang } = useParams<{ lang: string }>()

    if (!isLocale(lang ?? "")) {
        return <Navigate to={`/${defaultLocale}`} replace />
    }

    return (
        <I18nProvider>
            <div className="@container isolate flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </I18nProvider>
    )
}

// Wraps the authenticated area: requires a session, then renders the
// role-aware dashboard shell (sidebar + content Outlet).
function AuthenticatedArea() {
    return (
        <ProtectedRoute>
            <DashboardLayout />
        </ProtectedRoute>
    )
}

export function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to={`/${defaultLocale}`} replace />}
            />
            <Route path="/:lang" element={<LocaleLayout />}>
                {/* Public */}
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="requests/public" element={<PublicRequestsPage />} />
                <Route
                    path="requests/public/:id"
                    element={<PublicRequestDetailPage />}
                />
                <Route path="info" element={<InfoPage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />

                {/* Authenticated area */}
                <Route element={<AuthenticatedArea />}>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route
                        path="notifications"
                        element={<NotificationsPage />}
                    />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route
                        path="donor/register"
                        element={<BecomeDonorPage />}
                    />

                    {/* Recipient */}
                    <Route
                        path="requests"
                        element={
                            <RoleRoute roles={["recipient"]}>
                                <RecipientRequestsPage />
                            </RoleRoute>
                        }
                    />
                    <Route
                        path="requests/new"
                        element={
                            <RoleRoute roles={["recipient"]}>
                                <RequestNewPage />
                            </RoleRoute>
                        }
                    />
                    <Route
                        path="requests/:id"
                        element={
                            <RoleRoute roles={["recipient"]}>
                                <RequestDetailPage />
                            </RoleRoute>
                        }
                    />
                    <Route
                        path="requests/:id/edit"
                        element={
                            <RoleRoute roles={["recipient"]}>
                                <RequestEditPage />
                            </RoleRoute>
                        }
                    />

                    {/* Donor */}
                    <Route
                        path="donor"
                        element={
                            <RoleRoute roles={["donor"]}>
                                <DonorOverviewPage />
                            </RoleRoute>
                        }
                    />
                    <Route
                        path="donor/requests"
                        element={
                            <RoleRoute roles={["donor"]}>
                                <DonorRequestsPage />
                            </RoleRoute>
                        }
                    />
                    <Route
                        path="donor/donations"
                        element={
                            <RoleRoute roles={["donor"]}>
                                <DonorDonationsPage />
                            </RoleRoute>
                        }
                    />
                    <Route
                        path="donor/profile"
                        element={
                            <RoleRoute roles={["donor"]}>
                                <DonorProfilePage />
                            </RoleRoute>
                        }
                    />

                    {/* Admin */}
                    <Route
                        path="admin"
                        element={
                            <RoleRoute roles={["admin"]}>
                                <AdminDashboardPage />
                            </RoleRoute>
                        }
                    />
                    <Route
                        path="admin/users"
                        element={
                            <RoleRoute roles={["admin"]}>
                                <AdminUsersPage />
                            </RoleRoute>
                        }
                    />
                    <Route
                        path="admin/users/:id"
                        element={
                            <RoleRoute roles={["admin"]}>
                                <AdminUserDetailPage />
                            </RoleRoute>
                        }
                    />
                    <Route
                        path="admin/donors"
                        element={
                            <RoleRoute roles={["admin"]}>
                                <AdminDonorsPage />
                            </RoleRoute>
                        }
                    />
                    <Route
                        path="admin/requests"
                        element={
                            <RoleRoute roles={["admin"]}>
                                <AdminRequestsPage />
                            </RoleRoute>
                        }
                    />
                    <Route
                        path="admin/announcements"
                        element={
                            <RoleRoute roles={["admin"]}>
                                <AdminAnnouncementsPage />
                            </RoleRoute>
                        }
                    />
                    <Route
                        path="admin/reports"
                        element={
                            <RoleRoute roles={["admin"]}>
                                <AdminReportsPage />
                            </RoleRoute>
                        }
                    />
                    <Route
                        path="admin/settings"
                        element={
                            <RoleRoute roles={["admin"]}>
                                <AdminSettingsPage />
                            </RoleRoute>
                        }
                    />
                    <Route
                        path="admin/moderation"
                        element={
                            <RoleRoute roles={["admin"]}>
                                <AdminModerationPage />
                            </RoleRoute>
                        }
                    />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    )
}
