<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $query = Sale::with('cashier', 'items.product');

        // Jika bukan admin (kasir), hanya boleh melihat transaksinya sendiri
        if (auth()->user()->role !== 'admin') {
            $query->where('cashier_id', auth()->id());
        }

        if ($search) {
            $query->where('transaction_number', 'like', "%{$search}%");
        }

        $sales = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('sales/index', [
            'sales' => $sales,
            'filters' => $request->only(['search']),
        ]);
    }

    public function show(Sale $sale): Response
    {
        // Kasir hanya boleh melihat detail transaksinya sendiri
        if (auth()->user()->role !== 'admin' && $sale->cashier_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $sale->load('cashier', 'items.product');

        $storeSettings = Setting::receiptSettings();

        return Inertia::render('sales/show', [
            'sale' => $sale,
            'storeSettings' => $storeSettings,
        ]);
    }
}
