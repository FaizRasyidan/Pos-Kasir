<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductImageTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    private function payload(array $overrides = []): array
    {
        $category = Category::create(['name' => 'Minuman', 'slug' => 'minuman-'.uniqid()]);

        return array_merge([
            'category_id' => $category->id,
            'name' => 'Kopi Gayo 250gr',
            'sku' => 'KOP-001',
            'buy_price' => 20000,
            'sell_price' => 30000,
            'stock' => 10,
            'min_stock' => 2,
            'unit' => 'pcs',
        ], $overrides);
    }

    private function imageFile(string $name = 'kopi.png'): UploadedFile
    {
        // Real 1x1 PNG bytes — passes the `image` rule without GD.
        $bytes = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        );
        $path = tempnam(sys_get_temp_dir(), 'img').'.png';
        file_put_contents($path, $bytes);

        return new UploadedFile($path, $name, 'image/png', null, true);
    }

    public function test_admin_can_create_product_with_image(): void
    {
        Storage::fake('public');

        $response = $this->actingAs($this->admin())->post('/products', $this->payload([
            'image' => $this->imageFile(),
        ]));

        $response->assertRedirect(route('products.index'));

        $product = Product::where('sku', 'KOP-001')->firstOrFail();
        $this->assertNotNull($product->image);
        Storage::disk('public')->assertExists($product->image);
        $this->assertStringStartsWith('/storage/', $product->image_url);
    }

    public function test_update_replaces_old_image(): void
    {
        Storage::fake('public');

        $this->actingAs($this->admin())->post('/products', $this->payload([
            'image' => $this->imageFile('lama.png'),
        ]));
        $product = Product::where('sku', 'KOP-001')->firstOrFail();
        $old = $product->image;

        $this->actingAs($this->admin())->post("/products/{$product->id}", array_merge(
            $this->payload(['sku' => 'KOP-002']),
            ['_method' => 'put', 'image' => $this->imageFile('baru.png')],
        ))->assertRedirect(route('products.index'));

        $product->refresh();
        $this->assertNotEquals($old, $product->image);
        Storage::disk('public')->assertMissing($old);
        Storage::disk('public')->assertExists($product->image);
    }

    public function test_delete_removes_image_file(): void
    {
        Storage::fake('public');

        $this->actingAs($this->admin())->post('/products', $this->payload([
            'image' => $this->imageFile(),
        ]));
        $product = Product::where('sku', 'KOP-001')->firstOrFail();

        $this->actingAs($this->admin())->delete("/products/{$product->id}")
            ->assertRedirect(route('products.index'));

        Storage::disk('public')->assertMissing($product->image);
    }

    public function test_non_image_upload_is_rejected(): void
    {
        Storage::fake('public');

        $this->actingAs($this->admin())->post('/products', $this->payload([
            'image' => UploadedFile::fake()->create('dokumen.pdf', 100, 'application/pdf'),
        ]))->assertSessionHasErrors('image');
    }
}
