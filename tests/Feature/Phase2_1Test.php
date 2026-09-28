<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use App\Models\User;
use App\Services\CheckoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase2_1Test extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cannot_access_pos_or_checkout(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Admin access to /pos must be denied (403)
        $response = $this->actingAs($admin)->get('/pos');
        $response->assertStatus(403);

        // Admin POST /pos/checkout must be denied (403)
        $response = $this->actingAs($admin)
            ->withSession(['_token' => 'test-token'])
            ->post('/pos/checkout', [
                '_token' => 'test-token',
                'payment_method' => 'cash',
                'paid_amount' => 10000,
                'items' => [['product_id' => 1, 'quantity' => 1]],
            ]);
        $response->assertStatus(403);
    }

    public function test_cashier_can_access_pos_but_cannot_access_admin_routes(): void
    {
        $cashier = User::factory()->create(['role' => 'cashier']);

        // Cashier access to /pos is allowed (200)
        $response = $this->actingAs($cashier)->get('/pos');
        $response->assertStatus(200);

        // Cashier access to admin routes must be denied (403)
        $this->actingAs($cashier)->get('/products')->assertStatus(403);
        $this->actingAs($cashier)->get('/categories')->assertStatus(403);
        $this->actingAs($cashier)->get('/reports')->assertStatus(403);
        $this->actingAs($cashier)->get('/stock-movements')->assertStatus(403);
    }

    public function test_admin_can_access_stock_movements(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get('/stock-movements');
        $response->assertStatus(200);
    }

    public function test_stock_in_records_user_and_price_snapshots(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::create(['name' => 'Minuman', 'slug' => 'minuman']);

        $response = $this->actingAs($admin)
            ->withSession(['_token' => 'test-token'])
            ->post('/products', [
                '_token' => 'test-token',
                'category_id' => $category->id,
                'name' => 'Kopi Robusta',
                'sku' => 'KOP-ROB-01',
                'barcode' => '123456789',
                'buy_price' => 8000,
                'sell_price' => 12000,
                'stock' => 10,
                'min_stock' => 2,
                'unit' => 'pcs',
            ]);
        
        $response->assertRedirect();

        $product = Product::where('sku', 'KOP-ROB-01')->first();
        $this->assertNotNull($product);

        $movement = StockMovement::where('product_id', $product->id)->where('type', 'opening')->first();
        $this->assertNotNull($movement);
        $this->assertEquals(0, $movement->stock_before);
        $this->assertEquals(10, $movement->stock_after);
        $this->assertEquals(10, $movement->quantity);
        $this->assertEquals(8000.00, (float) $movement->buy_price);
        $this->assertEquals(12000.00, (float) $movement->selling_price);
        $this->assertEquals($admin->id, $movement->user_id);

        // Update stock (stock addition)
        $this->actingAs($admin)
            ->withSession(['_token' => 'test-token'])
            ->put("/products/{$product->id}", [
                '_token' => 'test-token',
                'category_id' => $category->id,
                'name' => 'Kopi Robusta',
                'sku' => 'KOP-ROB-01',
                'buy_price' => 8500,
                'sell_price' => 13000,
                'stock' => 30, // +20 stock
                'min_stock' => 2,
                'unit' => 'pcs',
                'is_active' => true,
            ]);

        $updateMovement = StockMovement::where('product_id', $product->id)->where('type', 'purchase')->first();
        $this->assertNotNull($updateMovement);
        $this->assertEquals(10, $updateMovement->stock_before);
        $this->assertEquals(20, $updateMovement->quantity);
        $this->assertEquals(30, $updateMovement->stock_after);
        $this->assertEquals(8500.00, (float) $updateMovement->buy_price);
        $this->assertEquals(13000.00, (float) $updateMovement->selling_price);
        $this->assertEquals($admin->id, $updateMovement->user_id);
    }

    public function test_sale_records_stock_movement_with_user_and_price_snapshots(): void
    {
        $cashier = User::factory()->create(['role' => 'cashier']);
        $category = Category::create(['name' => 'Makanan', 'slug' => 'makanan']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Roti Bakar',
            'sku' => 'ROT-001',
            'buy_price' => 5000,
            'sell_price' => 10000,
            'stock' => 20,
            'min_stock' => 2,
            'unit' => 'pcs',
            'is_active' => true,
        ]);

        $this->actingAs($cashier)
            ->withSession(['_token' => 'test-token'])
            ->post('/pos/checkout', [
                '_token' => 'test-token',
                'payment_method' => 'cash',
                'paid_amount' => 20000,
                'items' => [
                    ['product_id' => $product->id, 'quantity' => 2],
                ],
            ]);

        $movement = StockMovement::where('product_id', $product->id)->where('type', 'sale')->first();
        $this->assertNotNull($movement);
        $this->assertEquals(20, $movement->stock_before);
        $this->assertEquals(-2, $movement->quantity);
        $this->assertEquals(18, $movement->stock_after);
        $this->assertEquals(5000.00, (float) $movement->buy_price);
        $this->assertEquals(10000.00, (float) $movement->selling_price);
        $this->assertEquals($cashier->id, $movement->user_id);
    }

    public function test_profit_calculation_uses_snapshot_buy_price(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $cashier = User::factory()->create(['role' => 'cashier']);
        $category = Category::create(['name' => 'Snack', 'slug' => 'snack']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Keripik Tempe',
            'sku' => 'KRP-001',
            'buy_price' => 8000,
            'sell_price' => 10000,
            'stock' => 50,
            'min_stock' => 5,
            'unit' => 'pcs',
            'is_active' => true,
        ]);

        $service = new CheckoutService();
        // Sale: 2 qty @ 10,000, buy_price: 8,000 -> Profit = (10,000 - 8,000) * 2 = 4,000
        $service->process([
            'cashier_id' => $cashier->id,
            'payment_method' => 'cash',
            'paid_amount' => 20000,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ]);

        // Now master product prices change
        $product->update([
            'buy_price' => 9500,
            'sell_price' => 12000,
        ]);

        // Check report
        $response = $this->actingAs($admin)->get('/reports');
        $response->assertStatus(200);

        // Profit must remain 4,000, NOT (10,000 - 9,500) * 2 = 1,000
        $response->assertInertia(fn ($page) => 
            $page->component('reports/index')
                ->where('summary.profit', 4000)
                ->where('summary.revenue', 20000)
        );
    }
}
