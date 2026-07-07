// The donor endpoints return richer objects than the OpenAPI spec captures
// (it types them as `{ [key: string]: unknown }`). These interfaces mirror the
// server's actual response shapes so the donor pages are properly typed.

export interface DonorProfile {
    id: string
    userId: string
    fullName: string
    phone: string
    bloodGroup: string
    isAvailable: boolean
    verification: string
    lastDonationDate: string | null
    nextEligibleDate: string | null
    totalDonations: number
    notes: string | null
    createdAt: string
    updatedAt: string
}

export interface DonorEligibility {
    isEligible: boolean
    isAvailable: boolean
    verification: string
    nextEligibleDate: string | null
}

export interface DonationRecord {
    id: string
    donationDate: string
    units: number
    requestId: string | null
    patientName: string | null
    createdAt: string
}

export interface MatchingRequest {
    id: string
    patientName: string
    bloodGroup: string
    unitsNeeded: number
    hospitalName: string
    location?: { id: string; name: string } | null
    urgency: string
    neededBy: string
    status: string
}
