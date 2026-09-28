import { Head, Link, router } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import React from 'react';

interface AuditLog {
    id: number;
    action: string;
    auditable_type?: string;
    auditable_id?: number;
    description?: string;
    created_at: string;
    user?: { id: number; name: string };
}

interface PageProps {
    logs: {
        data: AuditLog[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    users: Array<{ id: number; name: string }>;
    actions: string[];
    filters: {
        user_id?: string;
        action?: string;
        from?: string;
        to?: string;
        search?: string;
    };
}

export default function AuditLogsIndex({
    logs,
    users,
    actions,
    filters,
}: PageProps) {
    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        router.get('/audit-logs', Object.fromEntries(data.entries()), {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Audit Logs" />
            <div className="mx-auto max-w-7xl space-y-5 p-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Activity / Audit Logs
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Riwayat aktivitas operasional penting.
                    </p>
                </div>
                <form
                    onSubmit={submit}
                    className="bg-card grid gap-3 rounded-xl border p-4 md:grid-cols-5"
                >
                    <select
                        name="user_id"
                        defaultValue={filters.user_id || ''}
                        className="rounded-lg border p-2 text-sm"
                    >
                        <option value="">Semua User</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                    <select
                        name="action"
                        defaultValue={filters.action || ''}
                        className="rounded-lg border p-2 text-sm"
                    >
                        <option value="">Semua Action</option>
                        {actions.map((action) => (
                            <option key={action} value={action}>
                                {action}
                            </option>
                        ))}
                    </select>
                    <input
                        name="from"
                        type="date"
                        defaultValue={filters.from || ''}
                        className="rounded-lg border p-2 text-sm"
                    />
                    <input
                        name="to"
                        type="date"
                        defaultValue={filters.to || ''}
                        className="rounded-lg border p-2 text-sm"
                    />
                    <div className="flex gap-2">
                        <input
                            name="search"
                            defaultValue={filters.search || ''}
                            placeholder="Cari aktivitas..."
                            className="min-w-0 flex-1 rounded-lg border p-2 text-sm"
                        />
                        <button className="rounded-lg bg-[#FF9D50] px-3 text-white">
                            <Search className="h-4 w-4" />
                        </button>
                    </div>
                </form>
                <div className="bg-card overflow-hidden rounded-xl border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="p-3">Tanggal</th>
                                <th className="p-3">User</th>
                                <th className="p-3">Action</th>
                                <th className="p-3">Entity</th>
                                <th className="p-3">Description</th>
                                <th className="p-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.map((log) => (
                                <tr key={log.id} className="border-t">
                                    <td className="p-3">
                                        {new Date(
                                            log.created_at,
                                        ).toLocaleString('id-ID')}
                                    </td>
                                    <td className="p-3">
                                        {log.user?.name || 'System/Guest'}
                                    </td>
                                    <td className="p-3">
                                        <span className="rounded bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {log.auditable_type
                                            ?.split('\\')
                                            .pop() || '-'}
                                        {log.auditable_id
                                            ? ` #${log.auditable_id}`
                                            : ''}
                                    </td>
                                    <td className="p-3">
                                        {log.description || '-'}
                                    </td>
                                    <td className="p-3">
                                        <Link href={`/audit-logs/${log.id}`}>
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {logs.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-muted-foreground p-8 text-center"
                                    >
                                        Belum ada aktivitas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex flex-wrap gap-2">
                    {logs.links.map((link, index) =>
                        link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                className={`rounded border px-3 py-1 text-sm ${link.active ? 'bg-[#FF9D50] text-white' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={index}
                                className="text-muted-foreground rounded border px-3 py-1 text-sm"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ),
                    )}
                </div>
            </div>
        </>
    );
}

AuditLogsIndex.layout = {
    breadcrumbs: [{ title: 'Audit Logs', href: '/audit-logs' }],
};
