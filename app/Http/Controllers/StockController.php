<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\StockMovement;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Exception;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $categoryId = $request->input('category_id');
        $status = $request->input('status');

        $query = Product::with('category');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        if ($status === 'available') {
            $query->where('stock', '>', 5);
        } elseif ($status === 'low') {
            $query->where('stock', '>', 0)->where('stock', '<=', 5);
        } elseif ($status === 'out') {
            $query->where('stock', '<=', 0);
        }

        $products = $query->orderBy('name', 'asc')->paginate(10)->withQueryString();
        $categories = Category::all();

        return Inertia::render('stocks/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'status']),
        ]);
    }

    public function stockIn(Request $request, AuditLogService $auditLogService): RedirectResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'buy_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255',
        ]);

        try {
            DB::transaction(function () use ($request, $auditLogService) {
                $product = Product::lockForUpdate()->findOrFail($request->product_id);

                $stockBefore = (int) $product->stock;
                $quantity = (int) $request->quantity;
                $stockAfter = $stockBefore + $quantity;

                // Update product master data: stock and latest prices
                $product->update([
                    'stock' => $stockAfter,
                    'buy_price' => $request->buy_price,
                    'sell_price' => $request->sell_price,
                ]);

                // Create stock movement record
                $movement = StockMovement::create([
                    'product_id' => $product->id,
                    'user_id' => auth()->id(),
                    'type' => 'purchase',
                    'quantity' => $quantity,
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'buy_price' => $request->buy_price,
                    'selling_price' => $request->sell_price,
                    'description' => $request->description ?: 'Tambah stok masuk (Stock In)',
                ]);

                $auditLogService->record(
                    action: 'stock_opening',
                    entity: $product,
                    oldValues: ['stock' => $stockBefore],
                    newValues: ['stock' => $stockAfter, 'quantity' => $quantity, 'stock_movement_id' => $movement->id],
                    description: "Stock added for product {$product->name}",
                );
            });

            return redirect()->back()->with('success', 'Stok berhasil ditambahkan.');
        } catch (Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function stockOut(Request $request, AuditLogService $auditLogService): RedirectResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:255',
        ]);

        try {
            DB::transaction(function () use ($request, $auditLogService) {
                $product = Product::lockForUpdate()->findOrFail($request->product_id);

                $stockBefore = (int) $product->stock;
                $quantity = (int) $request->quantity;

                if ($stockBefore < $quantity) {
                    throw new Exception("Jumlah pengurangan melebihi sisa stok yang tersedia (Sisa: {$stockBefore}).");
                }

                $stockAfter = $stockBefore - $quantity;

                $product->update([
                    'stock' => $stockAfter,
                ]);

                $movement = StockMovement::create([
                    'product_id' => $product->id,
                    'user_id' => auth()->id(),
                    'type' => 'adjustment',
                    'quantity' => -$quantity,
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'buy_price' => $product->buy_price,
                    'selling_price' => $product->sell_price,
                    'description' => $request->reason,
                ]);

                $auditLogService->record(
                    action: 'stock_adjustment',
                    entity: $product,
                    oldValues: ['stock' => $stockBefore],
                    newValues: ['stock' => $stockAfter, 'quantity' => -$quantity, 'stock_movement_id' => $movement->id],
                    description: "Stock adjusted for product {$product->name}",
                );
            });

            return redirect()->back()->with('success', 'Koreksi stok berhasil disimpan.');
        } catch (Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
