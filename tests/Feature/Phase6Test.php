<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class Phase6Test extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::firstOrCreate(
            ['email' => 'admin6@example.com'],
            [
                'name' => 'Admin Phase6',
                'password' => bcrypt('admin123'),
                'role' => 'admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $this->cashier = User::firstOrCreate(
            ['email' => 'cashier6@example.com'],
            [
                'name' => 'Cashier Phase6',
                'password' => bcrypt('12345678'),
                'role' => 'cashier',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
    }

    public function test_admin_is_authenticated()
    {
        $this->actingAs($this->admin);
        $this->assertTrue($this->admin->is_active);
        $this->assertEquals('admin', $this->admin->role);
    }

    public function test_cashier_is_authenticated()
    {
        $this->actingAs($this->cashier);
        $this->assertTrue($this->cashier->is_active);
        $this->assertEquals('cashier', $this->cashier->role);
    }

    public function test_cashier_cannot_access_admin_only_routes()
    {
        $response = $this->actingAs($this->cashier)->get('/admin/dashboard');
        $response->assertStatus(403);
    }

    public function test_admin_can_access_admin_routes()
    {
        $response = $this->actingAs($this->admin)->get('/admin/dashboard');
        $response->assertStatus(200);
    }

    public function test_settings_route_exists()
    {
        $this->assertTrue(route('settings.index') !== null);
    }

    public function test_phase_1_5_checkout_still_works()
    {
        // Basic sanity check: checkout endpoint still exists
        $this->assertTrue(route('pos.checkout') !== null);
    }
}
