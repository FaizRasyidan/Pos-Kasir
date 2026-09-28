<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SettingController extends Controller
{
    public function index(): Response
    {
        $settings = Setting::allAsArray();

        return Inertia::render('settings/store', [
            'settings' => $settings,
        ], [
            'layout' => 'settings',
        ]);
    }

    public function update(Request $request, AuditLogService $auditLogService): RedirectResponse
    {
        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'store_tagline' => 'nullable|string|max:255',
            'store_address' => 'nullable|string|max:500',
            'store_phone' => 'nullable|string|max:50',
            'store_email' => 'nullable|email|max:255',
            'receipt_header' => 'nullable|string|max:500',
            'receipt_footer' => 'nullable|string|max:500',
        ]);

        $oldValues = [];
        $newValues = [];

        foreach ($validated as $key => $value) {
            $oldValue = Setting::getValue($key);
            if ($oldValue === $value) {
                continue;
            }

            Setting::setValue($key, $value);
            $oldValues[$key] = $oldValue;
            $newValues[$key] = $value;
        }

        if ($newValues !== []) {
            $auditLogService->record(
                action: 'settings_updated',
                oldValues: $oldValues,
                newValues: $newValues,
                description: 'Store settings updated',
            );
        }

        return redirect()->back()->with('success', 'Pengaturan toko berhasil disimpan.');
    }
}
