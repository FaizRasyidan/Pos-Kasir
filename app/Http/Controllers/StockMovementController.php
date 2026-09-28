<?php

namespace App\Http\Controllers;

use App\Models\StockMovement;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockMovementController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $productId = $request->input('product_id');
        $type = $request->input('type');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = StockMovement::with(['product.category', 'user']);

        if ($search) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($productId) {
            $query->where('product_id', $productId);
        }

        if ($type) {
            $query->where('type', $type);
        }

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $stockMovements = $query->latest()->paginate(15)->withQueryString();
        $products = Product::orderBy('name')->get();

        return Inertia::render('stock-movements/index', [
            'stockMovements' => $stockMovements,
            'products' => $products,
            'filters' => $request->only(['search', 'product_id', 'type', 'start_date', 'end_date']),
        ]);
    }
}
