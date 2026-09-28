<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Sale;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_cashier_cannot_access_admin_product_management(): void
    {
        $cashier = User::factory()->create(['role' => 'cashier']);

        $response = $this->actingAs($cashier)->get('/products');
        $response->assertStatus(403);

        $response = $this->actingAs($cashier)->get('/categories');
        $response->assertStatus(403);

        $response = $this->actingAs($cashier)->get('/reports');
        $response->assertStatus(403);
    }

    public function test_admin_can_access_admin_pages(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get('/products');
        $response->assertStatus(200);

        $response = $this->actingAs($admin)->get('/categories');
        $response->assertStatus(200);

        $response = $this->actingAs($admin)->get('/reports');
        $response->assertStatus(200);
    }

    public function test_cashier_cannot_view_other_cashiers_sale(): void
    {
        $cashier1 = User::factory()->create(['role' => 'cashier']);
        $cashier2 = User::factory()->create(['role' => 'cashier']);

        $sale = Sale::create([
            'transaction_number' => 'POS-20260913-0001',
            'cashier_id' => $cashier1->id,
            'payment_method' => 'cash',
            'subtotal' => 10000,
            'grand_total' => 10000,
            'paid_amount' => 10000,
            'change_amount' => 0,
        ]);

        // Kasir 2 mencoba akses transaksi Kasir 1 -> Ditolak (403)
        $response = $this->actingAs($cashier2)->get("/sales/{$sale->id}");
        $response->assertStatus(403);

        // Kasir 1 mengakses transaksinya sendiri -> Boleh (200)
        $response = $this->actingAs($cashier1)->get("/sales/{$sale->id}");
        $response->assertStatus(200);
    }

    public function test_admin_can_view_any_sale(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $cashier = User::factory()->create(['role' => 'cashier']);

        $sale = Sale::create([
            'transaction_number' => 'POS-20260913-0002',
            'cashier_id' => $cashier->id,
            'payment_method' => 'cash',
            'subtotal' => 10000,
            'grand_total' => 10000,
            'paid_amount' => 10000,
            'change_amount' => 0,
        ]);

        $response = $this->actingAs($admin)->get("/sales/{$sale->id}");
        $response->assertStatus(200);
    }
}
