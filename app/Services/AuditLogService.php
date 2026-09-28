<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Throwable;

class AuditLogService
{
    public function record(
        string $action,
        ?Model $entity = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $description = null,
        ?Request $request = null,
        ?int $userId = null,
    ): ?AuditLog {
        try {
            $request ??= request();

            return AuditLog::create([
                'user_id' => $userId ?? $request->user()?->id,
                'action' => $action,
                'auditable_type' => $entity ? $entity::class : null,
                'auditable_id' => $entity?->getKey(),
                'old_values' => $this->sanitize($oldValues),
                'new_values' => $this->sanitize($newValues),
                'description' => $description,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return null;
        }
    }

    private function sanitize(?array $values): ?array
    {
        if ($values === null) {
            return null;
        }

        foreach (['password', 'password_hash', 'password_confirmation', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token', 'token', 'api_key', 'secret'] as $field) {
            unset($values[$field]);
        }

        return $values;
    }
}
