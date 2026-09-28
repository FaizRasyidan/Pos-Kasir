<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\StockMovement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase2_2Test extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_stocks_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $response = $this->actingAs($admin)->get('/stocks');
        $response->assertStatus(200);
    }

    public function test_cashier_cannot_access_stocks_page(): void
    {
        $cashier = User::factory()->create(['role' => 'cashier']);
        $response = $this->actingAs($cashier)->get('/stocks');
        $response->assertStatus(403);
    }

    public function test_stock_in_increases_stock_and_records_movement(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::create(['name' => 'Minuman', 'slug' => 'minuman']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Es Teh',
            'sku' => 'ESTEH-01',
            'buy_price' => 3000,
            'sell_price' => 5000,
            'stock' => 10,
            'min_stock' => 2,
            'unit' => 'cup',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->withSession(['_token' => 'test-token'])
            ->post('/stocks/in', [
                '_token' => 'test-token',
                'product_id' => $product->id,
                'quantity' => 20,
                'buy_price' => 3500,
                'sell_price' => 6000,
                'description' => 'Restock tambahan',
            ]);

        $response->assertRedirect();
        
        $product->refresh();
        $this->assertEquals(30, $product->stock);
        $this->assertEquals(3500.00, (float) $product->buy_price);
        $this->assertEquals(6000.00, (float) $product->sell_price);

        $movement = StockMovement::where('product_id', $product->id)->where('type', 'purchase')->first();
        $this->assertNotNull($movement);
        $this->assertEquals(10, $movement->stock_before);
        $this->assertEquals(20, $movement->quantity);
        $this->assertEquals(30, $movement->stock_after);
        $this->assertEquals(3500.00, (float) $movement->buy_price);
        $this->assertEquals(6000.00, (float) $movement->selling_price);
        $this->assertEquals($admin->id, $movement->user_id);
    }

    public function test_adjustment_out_decreases_stock_and_prevents_negative(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::create(['name' => 'Makanan', 'slug' => 'makanan']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Burger',
            'sku' => 'BRG-01',
            'buy_price' => 10000,
            'sell_price' => 15000,
            'stock' => 5,
            'min_stock' => 1,
            'unit' => 'pcs',
            'is_active' => true,
        ]);

        // Attempt negative stock (reduce 10 when stock is 5) -> should fail validation or exception
        $response = $this->actingAs($admin)
            ->withSession(['_token' => 'test-token'])
            ->post('/stocks/out', [
                '_token' => 'test-token',
                'product_id' => $product->id,
                'quantity' => 10,
                'reason' => 'Rusak',
            ]);

        // Should redirect back with error or session error
        $product->refresh();
        $this->assertEquals(5, $product->stock); // unchanged

        // Valid reduction: reduce 2
        $response2 = $this->actingAs($admin)
            ->withSession(['_token' => 'test-token'])
            ->post('/stocks/out', [
                '_token' => 'test-token',
                'product_id' => $product->id,
                'quantity' => 2,
                'reason' => 'Barang rusak',
            ]);

        $response2->assertRedirect();
        $product->refresh();
        $this->assertEquals(3, $product->stock);

        $movement = StockMovement::where('product_id', $product->id)->where('type', 'adjustment')->first();
        $this->assertNotNull($movement);
        $this->assertEquals(5, $movement->stock_before);
        $this->assertEquals(-2, $movement->quantity);
        $this->assertEquals(3, $movement->stock_after);
        $this->assertEquals($admin->id, $movement->user_id);
    }
}
