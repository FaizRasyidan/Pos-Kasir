<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('users/cashiers', [
            'cashiers' => User::query()
                ->where('role', 'cashier')
                ->select(['id', 'name', 'email', 'is_active', 'created_at'])
                ->latest()
                ->paginate(15),
        ]);
    }

    public function store(Request $request, AuditLogService $auditLogService): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => ['required', 'string', Password::default(), 'confirmed'],
        ]);

        $cashier = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $auditLogService->record(
            action: 'cashier.created',
            entity: $cashier,
            newValues: $cashier->only(['name', 'email', 'role', 'is_active']),
            description: "Cashier {$cashier->name} created",
        );

        return redirect()->route('users.cashiers.index')->with('success', 'Akun kasir berhasil dibuat.');
    }

    public function update(Request $request, User $user, AuditLogService $auditLogService): RedirectResponse
    {
        abort_unless($user->role === 'cashier', 404);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'is_active' => 'required|boolean',
            'password' => ['nullable', 'string', Password::default(), 'confirmed'],
        ]);

        $oldValues = $user->only(['name', 'email', 'role', 'is_active']);
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'is_active' => $validated['is_active'],
        ]);

        if (! empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        $newValues = $user->fresh()->only(['name', 'email', 'role', 'is_active']);
        $action = $oldValues['is_active'] != $newValues['is_active']
            ? 'cashier.status_changed'
            : 'cashier.updated';

        $auditLogService->record(
            action: $action,
            entity: $user,
            oldValues: $oldValues,
            newValues: $newValues,
            description: "Cashier {$user->name} updated",
        );

        if (! empty($validated['password'])) {
            $auditLogService->record(
                action: 'cashier.password_updated',
                entity: $user,
                description: "Password for cashier {$user->name} updated",
            );
        }

        return redirect()->route('users.cashiers.index')->with('success', 'Akun kasir berhasil diperbarui.');
    }
}
