import "server-only"

import { notFound } from "next/navigation"
import { isLocale, type Locale } from "@/lib/i18n/config"

export function getDictionary(locale: string) {
    if (!isLocale(locale)) {
        notFound()
    }

    return dictionaries[locale]
}

export type Dictionary = (typeof dictionaries)[Locale]

const sharedBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

const dictionaries = {
    en: {
        localeName: "English",
        nav: {
            findBlood: "Find Blood",
            activeRequests: "Active Requests",
            learn: "Learn",
            login: "Log in",
            register: "Register",
            dashboard: "Dashboard",
            profile: "Profile",
            logout: "Log out",
            menu: "Navigation",
            language: "বাংলা",
        },
        common: {
            appName: "RaktoSetu",
            safety:
                "RaktoSetu is a coordination platform only. It does not screen, certify, or vouch for blood safety. All clinical screening happens at the treating hospital.",
            bloodGroup: "Blood group",
            location: "Area",
            urgency: "Urgency",
            allLocations: "All areas",
            allUrgencies: "All urgencies",
            search: "Search",
            clear: "Clear",
            page: "Page",
            of: "of",
            previous: "Previous page",
            next: "Next page",
            viewDetails: "View details",
            noResults: "No matching records found.",
            select: "Select",
        },
        home: {
            hero: {
                eyebrow: "Community Blood Bank · Pabna",
                headline: "Every second counts.",
                accent: "Find blood now.",
                description:
                    "RaktoSetu connects patients with verified blood donors across your thana: fast, private, and locally coordinated.",
                donorCta: "Become a donor",
                findDonors: "Find donors",
                stats: [
                    { label: "Verified donors", value: "200+" },
                    { label: "Requests fulfilled", value: "150+" },
                    { label: "Response time", value: "< 2h" },
                ],
            },
            availability: {
                eyebrow: "Live availability",
                title: "Donor availability by blood group",
                description:
                    "Availability refreshes frequently. Contact access is still protected until a donor accepts a request.",
                available: "available",
            },
            how: {
                eyebrow: "Simple and fast",
                title: "How RaktoSetu works",
                description:
                    "The flow is built for urgent local coordination while keeping contact details private.",
                steps: [
                    {
                        step: "01",
                        title: "Register an account",
                        description:
                            "Sign up with a phone number and manage your recipient or donor profile.",
                    },
                    {
                        step: "02",
                        title: "Search or post a request",
                        description:
                            "Find available donors or create a request that an admin reviews before publication.",
                    },
                    {
                        step: "03",
                        title: "Get matched",
                        description:
                            "Contact details are shared only after a donor accepts a specific request.",
                    },
                    {
                        step: "04",
                        title: "Confirm completion",
                        description:
                            "Both sides confirm the donation so history and eligibility stay accurate.",
                    },
                ],
            },
            compatibility: {
                eyebrow: "Blood compatibility",
                title: "Who can give to whom?",
                description:
                    "Standard ABO/Rh compatibility reference used when matching donors to requests.",
                donor: "Donor",
                canDonateTo: "Can donate to",
            },
        },
        searchPage: {
            title: "Find available donors",
            description:
                "Search verified, currently available donors. Contact details remain hidden until an accepted request exists.",
            emptyPrompt: "Choose a blood group to start searching.",
            resultCount: "matching donors",
            totalDonations: "donations total",
            nextEligible: "Next eligible",
        },
        requestsPage: {
            title: "Active blood requests",
            description:
                "Browse published requests that are still open. Personal contact details are intentionally hidden.",
            units: "units",
            neededBy: "Needed by",
            patient: "Patient",
            hospital: "Hospital",
            notes: "Notes",
            publishedOnly:
                "Only admin-published requests are visible on this public board.",
        },
        info: {
            title: "Donation information",
            description:
                "Learn the basics before arranging a donation. Hospital screening is always required.",
            faqs: "FAQs",
            compatibility: "Compatibility",
            eligibility: "Eligibility",
            minimumAge: "Minimum age",
            cooldown: "General cooldown",
            days: "days",
        },
        auth: {
            loginTitle: "Log in",
            loginDescription:
                "Use a verified demo or registered phone number to access protected tools.",
            registerTitle: "Create an account",
            registerDescription:
                "Public registration creates a recipient account. You can register as a donor after logging in.",
            fullName: "Full name",
            phone: "Phone number",
            email: "Email",
            password: "Password",
            submitLogin: "Log in",
            submitRegister: "Register",
            successRegister:
                "Registration complete. Verify the phone before login.",
        },
        footer: {
            tagline:
                "Connecting blood donors with those in need, one thana at a time.",
            platform: "Platform",
            information: "Information",
            account: "Account",
            rights: "All rights reserved.",
        },
        bloodGroups: sharedBloodGroups,
    },
    bn: {
        localeName: "বাংলা",
        nav: {
            findBlood: "রক্ত খুঁজুন",
            activeRequests: "সক্রিয় অনুরোধ",
            learn: "জানুন",
            login: "লগ ইন",
            register: "নিবন্ধন",
            dashboard: "ড্যাশবোর্ড",
            profile: "প্রোফাইল",
            logout: "লগ আউট",
            menu: "নেভিগেশন",
            language: "English",
        },
        common: {
            appName: "রক্তসেতু",
            safety:
                "রক্তসেতু শুধু সমন্বয়ের প্ল্যাটফর্ম। এটি রক্ত পরীক্ষা, সার্টিফাই বা নিরাপত্তার নিশ্চয়তা দেয় না। সব ক্লিনিক্যাল স্ক্রিনিং হাসপাতালে হয়।",
            bloodGroup: "রক্তের গ্রুপ",
            location: "এলাকা",
            urgency: "জরুরিতা",
            allLocations: "সব এলাকা",
            allUrgencies: "সব জরুরিতা",
            search: "খুঁজুন",
            clear: "রিসেট",
            page: "পৃষ্ঠা",
            of: "এর",
            previous: "আগের পৃষ্ঠা",
            next: "পরের পৃষ্ঠা",
            viewDetails: "বিস্তারিত দেখুন",
            noResults: "মিল পাওয়া যায়নি।",
            select: "নির্বাচন করুন",
        },
        home: {
            hero: {
                eyebrow: "কমিউনিটি ব্লাড ব্যাংক · পাবনা",
                headline: "প্রতি সেকেন্ড গুরুত্বপূর্ণ।",
                accent: "এখনই রক্ত খুঁজুন।",
                description:
                    "রক্তসেতু আপনার থানার যাচাইকৃত রক্তদাতাদের সঙ্গে রোগীর দ্রুত, নিরাপদ ও স্থানীয় সমন্বয় তৈরি করে।",
                donorCta: "রক্তদাতা হন",
                findDonors: "দাতা খুঁজুন",
                stats: [
                    { label: "যাচাইকৃত দাতা", value: "২০০+" },
                    { label: "সম্পন্ন অনুরোধ", value: "১৫০+" },
                    { label: "সাড়া দেওয়ার সময়", value: "< ২ঘ" },
                ],
            },
            availability: {
                eyebrow: "লাইভ প্রাপ্যতা",
                title: "রক্তের গ্রুপ অনুযায়ী দাতা",
                description:
                    "প্রাপ্যতা নিয়মিত হালনাগাদ হয়। দাতা অনুরোধ গ্রহণ না করা পর্যন্ত যোগাযোগ গোপন থাকে।",
                available: "প্রাপ্য",
            },
            how: {
                eyebrow: "সহজ ও দ্রুত",
                title: "রক্তসেতু কীভাবে কাজ করে",
                description:
                    "জরুরি স্থানীয় সমন্বয়ের জন্য তৈরি, কিন্তু ব্যক্তিগত যোগাযোগ সুরক্ষিত থাকে।",
                steps: [
                    {
                        step: "০১",
                        title: "অ্যাকাউন্ট খুলুন",
                        description:
                            "ফোন নম্বর দিয়ে নিবন্ধন করে প্রাপক বা দাতা প্রোফাইল পরিচালনা করুন।",
                    },
                    {
                        step: "০২",
                        title: "খুঁজুন বা অনুরোধ দিন",
                        description:
                            "দাতা খুঁজুন অথবা অ্যাডমিন যাচাইয়ের জন্য রক্তের অনুরোধ তৈরি করুন।",
                    },
                    {
                        step: "০৩",
                        title: "ম্যাচ পান",
                        description:
                            "দাতা নির্দিষ্ট অনুরোধ গ্রহণ করলে তবেই যোগাযোগ তথ্য দেখা যায়।",
                    },
                    {
                        step: "০৪",
                        title: "সম্পন্ন নিশ্চিত করুন",
                        description:
                            "দুই পক্ষ নিশ্চিত করলে ইতিহাস ও যোগ্যতা সঠিকভাবে আপডেট হয়।",
                    },
                ],
            },
            compatibility: {
                eyebrow: "রক্তের সামঞ্জস্য",
                title: "কে কাকে রক্ত দিতে পারে?",
                description:
                    "দাতা-অনুরোধ মিলানোর সময় ব্যবহৃত সাধারণ ABO/Rh সামঞ্জস্য তালিকা।",
                donor: "দাতা",
                canDonateTo: "রক্ত দিতে পারে",
            },
        },
        searchPage: {
            title: "প্রাপ্য দাতা খুঁজুন",
            description:
                "যাচাইকৃত ও বর্তমানে প্রাপ্য দাতা খুঁজুন। গ্রহণ করা অনুরোধ না থাকলে যোগাযোগ তথ্য লুকানো থাকে।",
            emptyPrompt: "খোঁজা শুরু করতে রক্তের গ্রুপ নির্বাচন করুন।",
            resultCount: "মিল পাওয়া দাতা",
            totalDonations: "মোট দান",
            nextEligible: "পরবর্তী যোগ্যতা",
        },
        requestsPage: {
            title: "সক্রিয় রক্তের অনুরোধ",
            description:
                "প্রকাশিত ও খোলা অনুরোধ দেখুন। ব্যক্তিগত যোগাযোগ ইচ্ছাকৃতভাবে লুকানো থাকে।",
            units: "ব্যাগ",
            neededBy: "প্রয়োজন",
            patient: "রোগী",
            hospital: "হাসপাতাল",
            notes: "নোট",
            publishedOnly:
                "শুধু অ্যাডমিন প্রকাশিত অনুরোধ পাবলিক বোর্ডে দেখা যায়।",
        },
        info: {
            title: "রক্তদান তথ্য",
            description:
                "রক্তদানের আগে মূল বিষয়গুলো জানুন। হাসপাতালের স্ক্রিনিং সবসময় প্রয়োজন।",
            faqs: "প্রশ্নোত্তর",
            compatibility: "সামঞ্জস্য",
            eligibility: "যোগ্যতা",
            minimumAge: "সর্বনিম্ন বয়স",
            cooldown: "সাধারণ বিরতি",
            days: "দিন",
        },
        auth: {
            loginTitle: "লগ ইন",
            loginDescription:
                "সুরক্ষিত টুল ব্যবহার করতে যাচাইকৃত ডেমো বা নিবন্ধিত ফোন নম্বর ব্যবহার করুন।",
            registerTitle: "অ্যাকাউন্ট খুলুন",
            registerDescription:
                "পাবলিক নিবন্ধন প্রাপক অ্যাকাউন্ট তৈরি করে। লগইনের পর দাতা হিসেবে নিবন্ধন করা যাবে।",
            fullName: "পূর্ণ নাম",
            phone: "ফোন নম্বর",
            email: "ইমেইল",
            password: "পাসওয়ার্ড",
            submitLogin: "লগ ইন",
            submitRegister: "নিবন্ধন",
            successRegister:
                "নিবন্ধন সম্পন্ন হয়েছে। লগইনের আগে ফোন যাচাই করুন।",
        },
        footer: {
            tagline:
                "একটি থানায় প্রয়োজনমতো রক্তদাতা ও রোগীর সংযোগ তৈরি করা।",
            platform: "প্ল্যাটফর্ম",
            information: "তথ্য",
            account: "অ্যাকাউন্ট",
            rights: "সর্বস্বত্ব সংরক্ষিত।",
        },
        bloodGroups: sharedBloodGroups,
    },
} as const
