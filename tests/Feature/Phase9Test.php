<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class Phase9Test extends TestCase
{
    use RefreshDatabase;

    public function test_public_registration_cannot_assign_privileged_role(): void
    {
        $response = $this->post('/register', [
            'name' => 'Public User',
            'email' => 'public@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'admin',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'email' => 'public@example.com',
            'role' => 'admin',
        ]);
    }

    public function test_admin_dashboard_exposes_actual_command_center_data(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get('/admin/dashboard')->assertOk()->assertInertia(fn ($page) => $page
            ->component('admin/dashboard')
            ->has('todaySnapshot')
            ->has('storeHealth')
            ->has('needsAttention')
            ->has('recentActivity')
            ->has('quickActions')
            ->has('storeInsight')
        );
    }

    public function test_inactive_cashier_cannot_login(): void
    {
        User::factory()->create([
            'email' => 'inactive@example.com',
            'password' => 'Password123!',
            'role' => 'cashier',
            'is_active' => false,
        ]);

        $this->post('/login', [
            'email' => 'inactive@example.com',
            'password' => 'Password123!',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_admin_can_create_cashier_and_password_is_hashed(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post('/users/cashiers', [
            'name' => 'New Cashier',
            'email' => 'cashier@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertRedirect('/users/cashiers');
        $cashier = User::where('email', 'cashier@example.com')->firstOrFail();
        $this->assertSame('cashier', $cashier->role);
        $this->assertTrue(Hash::check('Password123!', $cashier->password));
        $this->assertNotSame('Password123!', $cashier->password);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'cashier.created',
            'auditable_id' => $cashier->id,
        ]);
        $this->assertStringNotContainsString('Password123!', json_encode(AuditLog::latest()->first()->toArray()));
    }

    public function test_cashier_cannot_create_cashier(): void
    {
        $cashier = User::factory()->create(['role' => 'cashier']);

        $this->actingAs($cashier)->post('/users/cashiers', [
            'name' => 'Blocked',
            'email' => 'blocked@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertForbidden();
    }

    public function test_admin_can_update_cashier_status_without_deleting_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $cashier = User::factory()->create(['role' => 'cashier', 'is_active' => true]);

        $this->actingAs($admin)->patch("/users/cashiers/{$cashier->id}", [
            'name' => 'Updated Cashier',
            'email' => $cashier->email,
            'is_active' => false,
        ])->assertRedirect('/users/cashiers');

        $this->assertDatabaseHas('users', [
            'id' => $cashier->id,
            'name' => 'Updated Cashier',
            'is_active' => false,
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'cashier.status_changed',
            'auditable_id' => $cashier->id,
        ]);
    }
}
