<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase7Test extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_audit_logs(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get('/audit-logs')->assertOk();
    }

    public function test_cashier_cannot_access_audit_logs_or_detail(): void
    {
        $cashier = User::factory()->create(['role' => 'cashier']);
        $log = AuditLog::create(['action' => 'login']);

        $this->actingAs($cashier)->get('/audit-logs')->assertForbidden();
        $this->actingAs($cashier)->get("/audit-logs/{$log->id}")->assertForbidden();
    }

    public function test_audit_log_has_no_update_or_delete_endpoint(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $log = AuditLog::create(['action' => 'login']);

        $this->actingAs($admin)->put("/audit-logs/{$log->id}")->assertMethodNotAllowed();
        $this->actingAs($admin)->delete("/audit-logs/{$log->id}")->assertMethodNotAllowed();
        $this->assertDatabaseHas('audit_logs', ['id' => $log->id]);
    }

    public function test_audit_service_records_actor_entity_before_after_and_request_context(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::create(['name' => 'Test', 'slug' => 'test']);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Test Product',
            'sku' => 'TEST-001',
            'buy_price' => 5000,
            'sell_price' => 8000,
            'stock' => 10,
            'min_stock' => 1,
            'unit' => 'pcs',
            'is_active' => true,
        ]);

        $this->actingAs($admin)->get('/audit-logs');
        $log = app(AuditLogService::class)->record(
            action: 'update',
            entity: $product,
            oldValues: ['sell_price' => 8000, 'password' => 'must-not-save'],
            newValues: ['sell_price' => 10000, 'token' => 'must-not-save'],
            description: 'Product updated',
        );

        $this->assertNotNull($log);
        $this->assertSame($admin->id, $log->user_id);
        $this->assertSame(Product::class, $log->auditable_type);
        $this->assertSame($product->id, $log->auditable_id);
        $this->assertSame(['sell_price' => 8000], $log->old_values);
        $this->assertSame(['sell_price' => 10000], $log->new_values);
        $this->assertNotNull($log->created_at);
        $this->assertNotNull($log->ip_address);
        $this->assertNotNull($log->user_agent);
    }

    public function test_audit_log_list_filters_in_database_and_detail_renders(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        AuditLog::create(['action' => 'checkout', 'description' => 'Sale completed']);
        $other = AuditLog::create(['action' => 'update', 'description' => 'Product updated']);

        $response = $this->actingAs($admin)->get('/audit-logs?action=checkout');
        $response->assertOk()->assertSee('Sale completed')->assertDontSee('Product updated');
        $this->actingAs($admin)->get("/audit-logs/{$other->id}")->assertOk()->assertSee('Product updated');
    }

    public function test_audit_log_service_never_stores_sensitive_fields(): void
    {
        $log = app(AuditLogService::class)->record(
            action: 'login_failed',
            oldValues: ['password' => 'secret', 'api_key' => 'key', 'safe' => 'value'],
            newValues: ['password_hash' => 'hash', 'secret' => 'secret', 'safe' => 'new'],
        );

        $this->assertSame(['safe' => 'value'], $log?->old_values);
        $this->assertSame(['safe' => 'new'], $log?->new_values);
    }
}
