export const CONTENT_LAST_UPDATED = "May 30, 2026";
export const CONTENT_DATE_MODIFIED = "2026-05-30";

type OfficialSource = {
  title: string;
  href: string;
  note: string;
};

export const officialSources = {
  googleAdsFileImport: {
    title: "Google Ads Help: Import conversions from ad clicks using files",
    href: "https://support.google.com/google-ads/answer/7014069",
    note: "Used for file-level timezone parameters, supported conversion time formats, file import boundaries, and scheduled upload hashing notes.",
  },
  googleAdsDataManager: {
    title: "Google Ads Help: About enhanced conversions for leads",
    href: "https://support.google.com/google-ads/answer/15713840",
    note: "Used for the Data Manager and enhanced conversions for leads boundary.",
  },
  googleAdsApiOffline: {
    title: "Google Ads API: Manage offline conversions",
    href: "https://developers.google.com/google-ads/api/docs/conversions/upload-offline",
    note: "Used for API-style offline conversion and hashed user-provided data context.",
  },
  googleAdsApiClickSample: {
    title: "Google Ads API sample: Upload offline conversion",
    href: "https://developers.google.com/google-ads/api/samples/upload-offline-conversion",
    note: "Used for the exactly-one click identifier boundary in API-style click conversion rows.",
  },
  googleAdsEnhancedWeb: {
    title: "Google Ads Help: About enhanced conversions for web in the Google Ads API",
    href: "https://support.google.com/google-ads/answer/13261987",
    note: "Used for SHA-256 hashing and user-provided data normalization context.",
  },
} satisfies Record<string, OfficialSource>;

export function LastUpdated({ date = CONTENT_LAST_UPDATED }: { date?: string }) {
  return <p className="mt-4 text-sm text-slate-500">Last updated: {date}. Re-check the official Google Ads documentation before changing production import workflows.</p>;
}

export function OfficialSources({ sources }: { sources: OfficialSource[] }) {
  return (
    <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="official-sources">
      <h2 id="official-sources" className="text-2xl font-bold text-slate-950">Official sources used</h2>
      <p className="mt-3 leading-7 text-slate-700">
        These links support the page boundary and the local checks described here. They are not copied into the checker as a complete Google Ads validator.
      </p>
      <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-700">
        {sources.map((source) => (
          <li key={source.href} className="rounded-2xl bg-slate-50 p-4">
            <a href={source.href} className="font-semibold text-blue-700 hover:text-blue-900" rel="noopener noreferrer">
              {source.title}
            </a>
            <p className="mt-1 text-slate-600">{source.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LocalValidationBoundary() {
  return (
    <section className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm" aria-labelledby="local-validation-boundary">
      <h2 id="local-validation-boundary" className="text-2xl font-bold text-slate-950">What this local checker cannot verify</h2>
      <p className="mt-3 leading-7 text-amber-950">
        The checker reads a CSV in your browser and reports file-level risks. It does not connect to Google Ads, Data Manager, Google Ads API, your CRM, or your account. It cannot confirm conversion action ownership, click ownership, account permissions, customer data terms, Data Manager schema rules, import preview status, or final attribution. Always preview and validate the corrected file in the official Google Ads workflow.
      </p>
    </section>
  );
}
