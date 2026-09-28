<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $logs = AuditLog::with('user:id,name')
            ->when($request->filled('user_id'), fn ($query) => $query->where('user_id', $request->integer('user_id')))
            ->when($request->filled('action'), fn ($query) => $query->where('action', $request->string('action')))
            ->when($request->filled('from'), fn ($query) => $query->whereDate('created_at', '>=', $request->date('from')))
            ->when($request->filled('to'), fn ($query) => $query->whereDate('created_at', '<=', $request->date('to')))
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');
                $query->where(function ($nested) use ($search) {
                    $nested->where('description', 'like', "%{$search}%")
                        ->orWhere('action', 'like', "%{$search}%")
                        ->orWhere('auditable_type', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('audit-logs/index', [
            'logs' => $logs,
            'users' => \App\Models\User::query()->select('id', 'name')->orderBy('name')->get(),
            'actions' => AuditLog::query()->distinct()->orderBy('action')->pluck('action'),
            'filters' => $request->only(['user_id', 'action', 'from', 'to', 'search']),
        ]);
    }

    public function show(AuditLog $auditLog): Response
    {
        $auditLog->load('user:id,name');

        return Inertia::render('audit-logs/show', [
            'log' => $auditLog,
        ]);
    }
}
