<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use App\Services\CheckoutService;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

class PosController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $categoryId = $request->input('category_id');

        $query = Product::with('category')->where('is_active', true);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', $search);
            });
        }

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        $products = $query->orderBy('name', 'asc')->get();

        $categories = Category::withCount(['products' => function ($q) {
            $q->where('is_active', true);
        }])->get();

        $allProductsCount = Product::where('is_active', true)->count();

        return Inertia::render('pos/index', [
            'products' => $products,
            'categories' => $categories,
            'allProductsCount' => $allProductsCount,
            'storeSettings' => Setting::receiptSettings(),
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    public function checkout(Request $request, CheckoutService $checkoutService, AuditLogService $auditLogService)
    {
        $request->validate([
            'payment_method' => 'required|in:cash,qris',
            'paid_amount' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            $sale = $checkoutService->process([
                'cashier_id' => auth()->id(),
                'payment_method' => $request->payment_method,
                'paid_amount' => $request->paid_amount,
                'discount' => $request->discount ?? 0,
                'tax' => $request->tax ?? 0,
                'items' => $request->items,
            ]);

            $auditLogService->record(
                action: 'checkout',
                entity: $sale,
                newValues: [
                    'transaction_number' => $sale->transaction_number,
                    'payment_method' => $sale->payment_method,
                    'grand_total' => $sale->grand_total,
                ],
                description: "Checkout completed: {$sale->transaction_number}",
            );

            $storeSettings = Setting::receiptSettings();

            return redirect()->back()->with([
                'sale' => $sale->load('items.product', 'cashier'),
                'storeSettings' => $storeSettings,
            ]);
        } catch (Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
