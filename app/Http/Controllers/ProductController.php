<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $query = Product::with('category');

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
        }

        $products = $query->orderBy('name', 'asc')->paginate(10)->withQueryString();
        $categories = Category::all();

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request, AuditLogService $auditLogService): RedirectResponse
    {
        // Auto generate SKU if empty or missing
        $sku = $request->input('sku');
        if (empty($sku)) {
            $sku = 'SKU-' . date('ymd') . '-' . rand(1000, 9999);
            while (Product::where('sku', $sku)->exists()) {
                $sku = 'SKU-' . date('ymd') . '-' . rand(1000, 9999);
            }
            $request->merge(['sku' => $sku]);
        }

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:100|unique:products,sku',
            'barcode' => 'nullable|string|max:100|unique:products,barcode',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'buy_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($validated);

        if ($product->stock > 0) {
            StockMovement::create([
                'product_id' => $product->id,
                'user_id' => auth()->id(),
                'type' => 'opening',
                'quantity' => $product->stock,
                'stock_before' => 0,
                'stock_after' => $product->stock,
                'buy_price' => $product->buy_price,
                'selling_price' => $product->sell_price,
                'description' => 'Stok awal produk baru',
            ]);
        }

        $auditLogService->record(
            action: 'create',
            entity: $product,
            newValues: $product->only(['category_id', 'name', 'sku', 'barcode', 'image', 'buy_price', 'sell_price', 'stock', 'min_stock', 'unit', 'is_active']),
            description: "Product {$product->name} created",
        );

        return redirect()->route('products.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(Request $request, Product $product, AuditLogService $auditLogService): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:100|unique:products,sku,' . $product->id,
            'barcode' => 'nullable|string|max:100|unique:products,barcode,' . $product->id,
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'buy_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        } else {
            unset($validated['image']);
        }

        DB::transaction(function () use ($validated, $request, $product, $auditLogService) {
            $product = Product::lockForUpdate()->findOrFail($product->id);
            $oldValues = $product->only(['category_id', 'name', 'sku', 'barcode', 'image', 'buy_price', 'sell_price', 'stock', 'min_stock', 'unit', 'is_active']);
            $oldStock = (int) $product->stock;
            $newStock = (int) $request->input('stock');
            $stockDiff = $newStock - $oldStock;

            $product->update(collect($validated)->except('stock')->toArray() + ['stock' => $newStock]);

            if ($stockDiff !== 0) {
                StockMovement::create([
                    'product_id' => $product->id,
                    'user_id' => auth()->id(),
                    'type' => $stockDiff > 0 ? 'purchase' : 'adjustment',
                    'quantity' => $stockDiff,
                    'stock_before' => $oldStock,
                    'stock_after' => $newStock,
                    'buy_price' => $product->buy_price,
                    'selling_price' => $product->sell_price,
                    'description' => 'Penyesuaian stok manual via edit produk',
                ]);
            }

            $product->refresh();
            $newValues = $product->only(array_keys($oldValues));
            $changedFields = array_keys(array_filter(
                $newValues,
                fn ($value, $field) => ($oldValues[$field] ?? null) != $value,
                ARRAY_FILTER_USE_BOTH,
            ));
            if ($changedFields !== []) {
                $auditLogService->record(
                    action: 'update',
                    entity: $product,
                    oldValues: array_intersect_key($oldValues, array_flip($changedFields)),
                    newValues: array_intersect_key($newValues, array_flip($changedFields)),
                    description: "Product {$product->name} updated",
                );
            }
        });

        return redirect()->route('products.index')->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product, AuditLogService $auditLogService): RedirectResponse
    {
        $oldValues = $product->only(['category_id', 'name', 'sku', 'barcode', 'image', 'buy_price', 'sell_price', 'stock', 'min_stock', 'unit', 'is_active']);
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }
        $product->delete();

        $auditLogService->record(
            action: 'delete',
            entity: $product,
            oldValues: $oldValues,
            description: "Product {$product->name} deleted",
        );

        return redirect()->route('products.index')->with('success', 'Produk berhasil dihapus.');
    }
}