import Link from "next/link";

export default function AdminOverviewPage() {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="text-xl font-semibold">Admin</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        This is the trust boundary for the whole product -- see CLAUDE.md: &quot;Unverified is
        displayed as unverified. Never as a fact.&quot; Every write from here that lands in a
        public collection stamps <code>sourceUrl</code> and <code>verifiedOn</code>{" "}
        automatically; nothing here backdates or omits either.
      </p>
      <ul className="flex flex-col gap-2 text-sm">
        <li>
          <Link href="/admin/queue" className="text-blue-600 hover:underline dark:text-blue-400">
            Verification queue
          </Link>{" "}
          -- proposed changes waiting on human approve/edit/reject.
        </li>
        <li>
          <Link href="/admin/sources" className="text-blue-600 hover:underline dark:text-blue-400">
            Source register
          </Link>{" "}
          -- every URL the ingestion pipeline is allowed to read from.
        </li>
        <li>
          <Link href="/admin/runs" className="text-blue-600 hover:underline dark:text-blue-400">
            Ingestion runs
          </Link>{" "}
          -- history, token spend, errors.
        </li>
        <li>
          <Link href="/admin/editor" className="text-blue-600 hover:underline dark:text-blue-400">
            Content editor
          </Link>{" "}
          -- manual override for any fact, source URL required.
        </li>
        <li>
          <Link href="/admin/dead-links" className="text-blue-600 hover:underline dark:text-blue-400">
            Dead link report
          </Link>{" "}
          -- which apply/status/website URLs are currently unreachable.
        </li>
      </ul>
    </div>
  );
}
