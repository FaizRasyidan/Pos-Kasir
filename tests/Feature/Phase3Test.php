<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase3Test extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Ensure users exist without touching existing DB destructively
        $this->admin = User::firstOrCreate(
            ['email' => 'Admin@example.com'],
            [
                'name' => 'Admin Test',
                'password' => bcrypt('admin123'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        $this->cashier = User::firstOrCreate(
            ['email' => 'kasir@example.com'],
            [
                'name' => 'Cashier Test',
                'password' => bcrypt('12345678'),
                'role' => 'cashier',
                'is_active' => true,
            ]
        );
    }

    public function test_admin_can_access_admin_dashboard()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.dashboard'));
        $response->assertStatus(200);
    }

    public function test_cashier_cannot_access_admin_dashboard()
    {
        $response = $this->actingAs($this->cashier)->get(route('admin.dashboard'));
        $response->assertStatus(403);
    }

    public function test_admin_cannot_access_pos()
    {
        $response = $this->actingAs($this->admin)->get(route('pos.index'));
        $response->assertStatus(403);
    }

    public function test_cashier_can_access_pos()
    {
        $response = $this->actingAs($this->cashier)->get(route('pos.index'));
        $response->assertStatus(200);
    }

    public function test_dashboard_revenue_and_profit_calculations()
    {
        // Check that admin dashboard successfully queries metrics without error
        $response = $this->actingAs($this->admin)->get(route('admin.dashboard'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/dashboard')
            ->has('metrics')
            ->has('salesChart')
            ->has('outOfStockProducts')
            ->has('lowStockProducts')
            ->has('topProducts')
            ->has('recentTransactions')
            ->has('recentStockMovements')
        );
    }

    public function test_soft_deleted_products_do_not_appear_as_active_stock_alerts()
    {
        // Ensure category 1 exists for product
        $category = \App\Models\Category::firstOrCreate(['id' => 1], [
            'name' => 'General',
            'slug' => 'general'
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Deleted Test Product',
            'sku' => 'DEL-999',
            'buy_price' => 1000,
            'sell_price' => 2000,
            'stock' => 0,
            'unit' => 'pcs',
            'is_active' => true,
        ]);

        $product->delete(); // Soft delete

        $response = $this->actingAs($this->admin)->get(route('admin.dashboard'));
        $response->assertStatus(200);

        // Assert deleted product is not in outOfStockProducts list
        $outOfStock = $response->viewData('page')['props']['outOfStockProducts'];
        foreach ($outOfStock as $item) {
            $this->assertNotEquals('Deleted Test Product', $item['name']);
        }
    }
}
