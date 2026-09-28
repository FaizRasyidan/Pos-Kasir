<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase5Test extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::firstOrCreate(
            ['email' => 'Admin5@example.com'],
            [
                'name' => 'Admin Phase5',
                'password' => bcrypt('admin123'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        $this->cashier = User::firstOrCreate(
            ['email' => 'cashier5@example.com'],
            [
                'name' => 'Cashier Phase5',
                'password' => bcrypt('12345678'),
                'role' => 'cashier',
                'is_active' => true,
            ]
        );
    }

    public function test_admin_can_access_reports()
    {
        $response = $this->actingAs($this->admin)->get(route('reports.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('reports/index')
            ->has('summary')
            ->has('dailyReports')
            ->has('topProducts')
            ->has('profitableProducts')
            ->has('cashierPerformance')
        );
    }

    public function test_cashier_cannot_access_reports()
    {
        $response = $this->actingAs($this->cashier)->get(route('reports.index'));
        $response->assertStatus(403);
    }

    public function test_historical_profit_calculation_uses_snapshot_buy_price()
    {
        $category = Category::firstOrCreate(['slug' => 'general'], [
            'name' => 'General',
        ]);

        $sku = 'ANALYTICS-' . \Illuminate\Support\Str::random(5);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Test Analytics Product',
            'sku' => $sku,
            'buy_price' => 50000,
            'sell_price' => 70000,
            'stock' => 50,
            'unit' => 'pcs',
        ]);

        $today = '2020-01-01'; // Use a fixed past date to avoid conflict with existing data
        $trxNum = 'POS-20200101-' . \Illuminate\Support\Str::random(4);
        $sale = new Sale();
        $sale->forceFill([
            'transaction_number' => $trxNum,
            'cashier_id' => $this->cashier->id,
            'payment_method' => 'cash',
            'subtotal' => 140000,
            'discount' => 0,
            'tax' => 0,
            'grand_total' => 140000,
            'paid_amount' => 140000,
            'change_amount' => 0,
            'created_at' => '2020-01-01 10:00:00',
            'updated_at' => '2020-01-01 10:00:00',
        ]);
        $sale->save();

        // Snapshot buy_price is 50000
        $saleItem = new SaleItem();
        $saleItem->forceFill([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'price' => 70000,
            'buy_price' => 50000,
            'subtotal' => 140000,
            'created_at' => '2020-01-01 10:00:00',
            'updated_at' => '2020-01-01 10:00:00',
        ]);
        $saleItem->save();

        // Verify profit calculation: (70000 - 50000) * 2 = 40000
        $response = $this->actingAs($this->admin)->get(route('reports.index', [
            'start_date' => $today,
            'end_date' => $today,
        ]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('reports/index')
            ->where('summary.profit', 40000)
        );

        // Now change master product buy_price to 60000
        $product->update(['buy_price' => 60000]);

        // Re-query the same period
        $response2 = $this->actingAs($this->admin)->get(route('reports.index', [
            'start_date' => $today,
            'end_date' => $today,
        ]));

        $response2->assertStatus(200);
        // Profit should still be 40000 because it uses snapshot buy_price, not the new 60000
        $response2->assertInertia(fn ($page) => $page
            ->component('reports/index')
            ->where('summary.profit', 40000)
        );
    }
}
