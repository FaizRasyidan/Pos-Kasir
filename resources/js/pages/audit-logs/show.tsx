import { Head, Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AppLayout from '@/layouts/app-layout';

interface AuditLog {
    id: number;
    action: string;
    auditable_type?: string;
    auditable_id?: number;
    old_values?: Record<string, unknown>;
    new_values?: Record<string, unknown>;
    description?: string;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    user?: { name: string };
}

export default function AuditLogShow({ log }: { log: AuditLog }) {
    const fields = Array.from(
        new Set([
            ...Object.keys(log.old_values || {}),
            ...Object.keys(log.new_values || {}),
        ]),
    );
    return (
        <>
            <Head title={`Audit Log #${log.id}`} />
            <div className="mx-auto max-w-4xl space-y-5 p-6">
                <Link
                    href="/audit-logs"
                    className="text-muted-foreground text-sm"
                >
                    ← Kembali
                </Link>
                <div className="bg-card rounded-xl border p-6">
                    <h1 className="text-2xl font-bold">Audit Log Detail</h1>
                    <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
                        <div>
                            <dt className="font-semibold">Actor</dt>
                            <dd>{log.user?.name || 'System/Guest'}</dd>
                        </div>
                        <div>
                            <dt className="font-semibold">Action</dt>
                            <dd>{log.action}</dd>
                        </div>
                        <div>
                            <dt className="font-semibold">Entity</dt>
                            <dd>
                                {log.auditable_type?.split('\\').pop() || '-'}
                                {log.auditable_id
                                    ? ` #${log.auditable_id}`
                                    : ''}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-semibold">Time</dt>
                            <dd>
                                {new Date(log.created_at).toLocaleString(
                                    'id-ID',
                                )}
                            </dd>
                        </div>
                        <div className="md:col-span-2">
                            <dt className="font-semibold">Description</dt>
                            <dd>{log.description || '-'}</dd>
                        </div>
                        <div>
                            <dt className="font-semibold">IP Address</dt>
                            <dd>{log.ip_address || '-'}</dd>
                        </div>
                    </dl>
                </div>
                {fields.length > 0 && (
                    <div className="bg-card overflow-hidden rounded-xl border">
                        <div className="border-b p-4 font-semibold">
                            Changed Values
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-3">Field</th>
                                    <th className="p-3">Before</th>
                                    <th className="p-3">After</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((field) => (
                                    <tr key={field} className="border-t">
                                        <td className="p-3 font-medium">
                                            {field}
                                        </td>
                                        <td className="p-3">
                                            {String(
                                                log.old_values?.[field] ?? '-',
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {String(
                                                log.new_values?.[field] ?? '-',
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

function AuditLogShowLayout({ children }: { children: ReactNode }) {
    const { log } = usePage().props as unknown as { log: { id: number } };
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Audit Logs', href: '/audit-logs' },
                { title: `#${log.id}`, href: '#' },
            ]}
        >
            {children}
        </AppLayout>
    );
}

AuditLogShow.layout = (page: ReactNode) => <AuditLogShowLayout>{page}</AuditLogShowLayout>;
