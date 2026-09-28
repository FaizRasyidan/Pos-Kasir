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

class Phase2Test extends TestCase
{
    use RefreshDatabase;

    public function test_buy_price_snapshot_preserves_historical_cost(): void
    {
        $cashier = User::factory()->create(['role' => 'cashier']);
        $category = Category::create(['name' => 'Elektronik', 'slug' => 'elektronik']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Mouse USB',
            'sku' => 'MOU-001',
            'buy_price' => 50000,
            'sell_price' => 75000,
            'stock' => 10,
            'min_stock' => 2,
            'unit' => 'pcs',
            'is_active' => true,
        ]);

        $service = new CheckoutService();

        // 1. Checkout with initial buy_price = 50000
        $sale1 = $service->process([
            'cashier_id' => $cashier->id,
            'payment_method' => 'cash',
            'paid_amount' => 100000,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ]);

        $saleItem1 = $sale1->items->first();
        $this->assertEquals(50000.00, (float) $saleItem1->buy_price);

        // 2. Update product buy_price to 60000
        $product->update(['buy_price' => 60000]);

        // 3. Verify old sale item buy_price remains 50000
        $this->assertEquals(50000.00, (float) $saleItem1->fresh()->buy_price);

        // 4. Checkout new transaction, should use new buy_price = 60000
        $sale2 = $service->process([
            'cashier_id' => $cashier->id,
            'payment_method' => 'cash',
            'paid_amount' => 100000,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ]);

        $saleItem2 = $sale2->items->first();
        $this->assertEquals(60000.00, (float) $saleItem2->buy_price);
    }

    public function test_product_soft_delete_preserves_transaction_history(): void
    {
        $cashier = User::factory()->create(['role' => 'cashier']);
        $category = Category::create(['name' => 'Makanan', 'slug' => 'makanan']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Kopi Susu',
            'sku' => 'KOP-001',
            'buy_price' => 10000,
            'sell_price' => 15000,
            'stock' => 5,
            'min_stock' => 1,
            'unit' => 'cup',
            'is_active' => true,
        ]);

        $service = new CheckoutService();
        $sale = $service->process([
            'cashier_id' => $cashier->id,
            'payment_method' => 'cash',
            'paid_amount' => 20000,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ]);

        // Soft delete product
        $product->delete();

        $this->assertSoftDeleted($product);
        $this->assertNull(Product::find($product->id));
        $this->assertNotNull(Product::withTrashed()->find($product->id));

        // Verify sale & sale item remain valid and accessible
        $fetchedSale = Sale::with('items.product')->find($sale->id);
        $this->assertNotNull($fetchedSale);
        $this->assertEquals('Kopi Susu', $fetchedSale->items->first()->product->name);
    }

    public function test_stock_movement_records_before_and_after_correctly(): void
    {
        $cashier = User::factory()->create(['role' => 'cashier']);
        $category = Category::create(['name' => 'Snack', 'slug' => 'snack']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Chips',
            'sku' => 'CHP-001',
            'buy_price' => 5000,
            'sell_price' => 8000,
            'stock' => 20,
            'min_stock' => 5,
            'unit' => 'bag',
            'is_active' => true,
        ]);

        $service = new CheckoutService();
        $service->process([
            'cashier_id' => $cashier->id,
            'payment_method' => 'cash',
            'paid_amount' => 50000,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 4],
            ],
        ]);

        $movement = StockMovement::where('product_id', $product->id)->latest()->first();

        $this->assertNotNull($movement);
        $this->assertEquals(20, $movement->stock_before);
        $this->assertEquals(-4, $movement->quantity);
        $this->assertEquals(16, $movement->stock_after);
        $this->assertEquals($movement->stock_before + $movement->quantity, $movement->stock_after);
        $this->assertEquals(16, $product->fresh()->stock);
    }
}
