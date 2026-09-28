<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReceiptSettingTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $cashier;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->cashier = User::factory()->create(['role' => 'cashier']);
        $category = Category::create(['name' => 'Makanan', 'slug' => 'makanan']);

        $this->product = Product::create([
            'category_id' => $category->id,
            'name' => 'Produk Receipt',
            'sku' => 'REC-001',
            'buy_price' => 8000,
            'sell_price' => 10000,
            'stock' => 10,
            'min_stock' => 1,
            'unit' => 'pcs',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_save_store_settings_used_by_receipts(): void
    {
        $response = $this->actingAs($this->admin)->post(route('settings.update'), $this->settingsPayload());

        $response->assertRedirect();
        $response->assertSessionHas('success');

        foreach ($this->settingsPayload() as $key => $value) {
            $this->assertDatabaseHas('settings', ['key' => $key, 'value' => $value]);
        }

        $this->assertSame($this->settingsPayload(), Setting::receiptSettings());
    }

    public function test_checkout_receipt_flashes_custom_store_settings_without_default_leakage(): void
    {
        $this->saveSettings();

        $response = $this->actingAs($this->cashier)->post(route('pos.checkout'), [
            'payment_method' => 'cash',
            'paid_amount' => 15000,
            'items' => [['product_id' => $this->product->id, 'quantity' => 1]],
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('storeSettings', $this->settingsPayload());
        $response->assertSessionHas('sale');

        $this->assertDatabaseHas('sales', [
            'cashier_id' => $this->cashier->id,
            'subtotal' => 10000,
            'grand_total' => 10000,
            'paid_amount' => 15000,
            'change_amount' => 5000,
        ]);
        $this->assertDatabaseHas('sale_items', ['product_id' => $this->product->id, 'quantity' => 1]);
        $this->assertDatabaseHas('stock_movements', ['product_id' => $this->product->id, 'type' => 'sale', 'quantity' => -1]);
        $this->assertSame(9, $this->product->fresh()->stock);
        $this->assertNotSame('TOKO POS-KASIR', session('storeSettings.store_name'));
    }

    public function test_history_and_reprint_receipt_use_current_store_settings(): void
    {
        $this->saveSettings();

        $this->actingAs($this->cashier)->post(route('pos.checkout'), [
            'payment_method' => 'cash',
            'paid_amount' => 10000,
            'items' => [['product_id' => $this->product->id, 'quantity' => 1]],
        ]);

        $sale = Sale::firstOrFail();
        $response = $this->actingAs($this->admin)->get(route('sales.show', $sale));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('sales/show')
            ->where('storeSettings', $this->settingsPayload())
        );
    }

    private function saveSettings(): void
    {
        foreach ($this->settingsPayload() as $key => $value) {
            Setting::setValue($key, $value);
        }
    }

    private function settingsPayload(): array
    {
        return [
            'store_name' => 'TOKO TEST RECEIPT',
            'store_tagline' => 'TAGLINE TEST RECEIPT',
            'store_address' => 'ALAMAT TEST RECEIPT',
            'store_phone' => '081234567890',
            'store_email' => 'receipt@example.test',
            'receipt_header' => 'HEADER TEST RECEIPT',
            'receipt_footer' => 'FOOTER TEST RECEIPT',
        ];
    }
}
