<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        $todaySales = Sale::query()->whereDate('created_at', $today);
        $yesterdaySales = Sale::query()->whereDate('created_at', $yesterday);

        $todayRevenue = (float) (clone $todaySales)->sum('grand_total');
        $yesterdayRevenue = (float) (clone $yesterdaySales)->sum('grand_total');
        $todayTransactions = (int) (clone $todaySales)->count();
        $yesterdayTransactions = (int) (clone $yesterdaySales)->count();

        $todaySaleIds = (clone $todaySales)->pluck('id');
        $todayProfit = (float) (SaleItem::query()
            ->whereIn('sale_id', $todaySaleIds)
            ->selectRaw('COALESCE(SUM((price - buy_price) * quantity), 0) as total_profit')
            ->value('total_profit') ?? 0);

        $lowStockProducts = Product::query()
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->where('stock', '<=', 5)
            ->orderBy('stock')
            ->get(['id', 'name', 'sku', 'stock']);

        $outOfStockProducts = Product::query()
            ->where('is_active', true)
            ->where('stock', '<=', 0)
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'stock']);

        $inactiveCashiers = User::query()
            ->where('role', 'cashier')
            ->where('is_active', false)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $recentActivity = AuditLog::query()
            ->with('user:id,name')
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (AuditLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'description' => $log->description ?: $log->action,
                'user_name' => $log->user?->name ?? 'System',
                'created_at' => $log->created_at->format('d M Y, H:i'),
            ]);

        $activeProducts = Product::query()->where('is_active', true)->count();
        $activeCashiers = User::query()->where('role', 'cashier')->where('is_active', true)->count();
        $totalStockUnits = Product::query()->where('is_active', true)->sum('stock');
        $totalAttention = $lowStockProducts->count() + $outOfStockProducts->count() + $inactiveCashiers->count();

        // Compatibility props for Phase 1-8 consumers. New dashboard UI does not render these.
        $sevenDaysAgo = Carbon::today()->subDays(6);
        $dailySalesRaw = Sale::query()
            ->selectRaw('DATE(created_at) as date, SUM(grand_total) as revenue, COUNT(id) as transactions')
            ->whereDate('created_at', '>=', $sevenDaysAgo)
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get()
            ->keyBy('date');
        $salesChart = collect(range(6, 0))->map(function (int $days) use ($dailySalesRaw) {
            $date = Carbon::today()->subDays($days)->toDateString();
            $record = $dailySalesRaw->get($date);
            return [
                'date' => Carbon::parse($date)->format('d M'),
                'raw_date' => $date,
                'revenue' => (float) ($record->revenue ?? 0),
                'transactions' => (int) ($record->transactions ?? 0),
            ];
        })->values();
        $recentTransactions = Sale::query()->with('cashier')->latest()->limit(5)->get()->map(fn (Sale $sale) => [
            'id' => $sale->id,
            'transaction_number' => $sale->transaction_number,
            'cashier_name' => $sale->cashier?->name ?? 'Kasir',
            'payment_method' => strtoupper($sale->payment_method),
            'grand_total' => (float) $sale->grand_total,
            'created_at' => $sale->created_at->format('d M Y, H:i'),
        ]);
        $recentStockMovements = \App\Models\StockMovement::query()->with(['product', 'user'])->latest()->limit(5)->get()->map(fn ($movement) => [
            'id' => $movement->id,
            'date' => $movement->created_at->format('d M Y, H:i'),
            'product_name' => $movement->product?->name ?? 'Produk',
            'type' => $movement->type,
            'quantity' => $movement->quantity,
            'user_name' => $movement->user?->name ?? 'System',
        ]);
        $topProducts = SaleItem::query()->with('product')->whereHas('sale', fn ($query) => $query->whereDate('created_at', '>=', $sevenDaysAgo))
            ->select('product_id')->selectRaw('SUM(quantity) as total_sold')->groupBy('product_id')->orderByDesc('total_sold')->limit(5)->get()
            ->map(fn ($item) => ['name' => $item->product?->name ?? 'Produk Dihapus', 'sku' => $item->product?->sku ?? '-', 'total_sold' => (int) $item->total_sold]);

        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'today_revenue' => $todayRevenue,
                'revenue_change' => $this->percentageChange($todayRevenue, $yesterdayRevenue),
                'today_profit' => $todayProfit,
                'profit_change' => 0,
                'today_transactions' => $todayTransactions,
                'transaction_change' => $this->percentageChange($todayTransactions, $yesterdayTransactions),
                'average_transaction' => $todayTransactions > 0 ? $todayRevenue / $todayTransactions : 0,
                'average_change' => 0,
            ],
            'salesChart' => $salesChart,
            'outOfStockProducts' => $outOfStockProducts,
            'lowStockProducts' => $lowStockProducts,
            'topProducts' => $topProducts,
            'recentTransactions' => $recentTransactions,
            'recentStockMovements' => $recentStockMovements,
            'todaySnapshot' => [
                'revenue' => $todayRevenue,
                'transactions' => $todayTransactions,
                'profit' => $todayProfit,
                'average_transaction' => $todayTransactions > 0 ? $todayRevenue / $todayTransactions : 0,
                'revenue_change' => $this->percentageChange($todayRevenue, $yesterdayRevenue),
                'transaction_change' => $this->percentageChange($todayTransactions, $yesterdayTransactions),
            ],
            'storeHealth' => [
                'active_products' => $activeProducts,
                'active_cashiers' => $activeCashiers,
                'total_stock_units' => (int) $totalStockUnits,
                'attention_count' => $totalAttention,
            ],
            'needsAttention' => [
                'low_stock' => $lowStockProducts,
                'out_of_stock' => $outOfStockProducts,
                'inactive_cashiers' => $inactiveCashiers,
            ],
            'recentActivity' => $recentActivity,
            'quickActions' => [
                ['label' => 'Kelola Stok', 'href' => route('stocks.index')],
                ['label' => 'Tambah Produk', 'href' => route('products.create')],
                ['label' => 'Kelola Kasir', 'href' => route('users.cashiers.index')],
                ['label' => 'Lihat Audit Log', 'href' => route('audit-logs.index')],
            ],
            'storeInsight' => [
                'active_products' => $activeProducts,
                'low_stock_count' => $lowStockProducts->count(),
                'out_of_stock_count' => $outOfStockProducts->count(),
                'inactive_cashier_count' => $inactiveCashiers->count(),
                'today_transactions' => $todayTransactions,
            ],
        ]);
    }

    private function percentageChange(float|int $current, float|int $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
