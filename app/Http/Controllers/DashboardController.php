<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        // Single entry point: admins get the command center,
        // cashiers get the fullscreen POS. No duplicated POS page.
        if (auth()->user()?->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        $search = $request->input('search');
        $categoryId = $request->input('category_id');

        $user = auth()->user();

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

        $products = $query->orderBy('name')->get();

        $categories = Category::withCount(['products' => function ($q) {
            $q->where('is_active', true);
        }])->get();

        $allProductsCount = Product::where('is_active', true)->count();

        // Reuses the fullscreen POS page (pos/index) instead of
        // maintaining a duplicated dashboard POS copy.
        return Inertia::render('pos/index', [
            'products' => $products,
            'categories' => $categories,
            'allProductsCount' => $allProductsCount,
            'storeSettings' => Setting::receiptSettings(),
            'filters' => $request->only(['search', 'category_id']),
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->role,
                ]
            ]
        ]);
    }
}
