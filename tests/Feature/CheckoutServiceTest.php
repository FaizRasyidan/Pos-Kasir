<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Services\CheckoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Exception;

class CheckoutServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_successfully_processes_sale_and_decrements_stock(): void
    {
        $cashier = User::factory()->create(['role' => 'cashier']);
        $category = Category::create(['name' => 'Makanan', 'slug' => 'makanan']);
        
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Indomie Goreng',
            'sku' => 'IND-001',
            'buy_price' => 2500,
            'sell_price' => 3500,
            'stock' => 10,
            'min_stock' => 2,
            'unit' => 'pcs',
            'is_active' => true,
        ]);

        $service = new CheckoutService();

        $sale = $service->process([
            'cashier_id' => $cashier->id,
            'payment_method' => 'cash',
            'paid_amount' => 10000,
            'discount' => 0,
            'tax' => 0,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ]);

        $this->assertNotNull($sale);
        $this->assertEquals(7000, $sale->grand_total);
        $this->assertEquals(3000, $sale->change_amount);
        
        // Check stock is decremented
        $this->assertEquals(8, $product->fresh()->stock);
        
        // Check database records
        $this->assertDatabaseHas('sales', ['id' => $sale->id, 'grand_total' => 7000]);
        $this->assertDatabaseHas('sale_items', ['sale_id' => $sale->id, 'product_id' => $product->id, 'quantity' => 2]);
        $this->assertDatabaseHas('stock_movements', ['product_id' => $product->id, 'type' => 'sale', 'quantity' => -2]);
    }

    public function test_checkout_fails_when_stock_is_insufficient(): void
    {
        $cashier = User::factory()->create(['role' => 'cashier']);
        $category = Category::create(['name' => 'Minuman', 'slug' => 'minuman']);
        
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Teh Botol',
            'sku' => 'TEH-001',
            'buy_price' => 3000,
            'sell_price' => 4000,
            'stock' => 1,
            'min_stock' => 1,
            'unit' => 'btl',
            'is_active' => true,
        ]);

        $service = new CheckoutService();

        $this->expectException(Exception::class);
        $this->expectExceptionMessage("Stok produk Teh Botol tidak mencukupi");

        $service->process([
            'cashier_id' => $cashier->id,
            'payment_method' => 'cash',
            'paid_amount' => 10000,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 5],
            ],
        ]);

        // Stock should remain unchanged
        $this->assertEquals(1, $product->fresh()->stock);
        $this->assertDatabaseCount('sales', 0);
    }
}