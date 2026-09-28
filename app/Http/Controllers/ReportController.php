<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        $salesQuery = Sale::whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate);

        $totalRevenue = (clone $salesQuery)->sum('grand_total');
        $totalTransactions = (clone $salesQuery)->count();
        $averageTransaction = $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0;

        $saleIds = (clone $salesQuery)->pluck('id');
        
        $saleItemsQuery = SaleItem::whereIn('sale_id', $saleIds);
        $totalProfit = (clone $saleItemsQuery)
            ->selectRaw('SUM((price - buy_price) * quantity) as total_profit')
            ->value('total_profit') ?? 0;

        $totalItemsSold = (clone $saleItemsQuery)->sum('quantity');

        // Daily Reports
        $dailyReports = Sale::select(
                \DB::raw('DATE(created_at) as date'),
                \DB::raw('COUNT(id) as transactions_count'),
                \DB::raw('SUM(grand_total) as total_revenue')
            )
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->groupBy(\DB::raw('DATE(created_at)'))
            ->orderBy('date', 'desc')
            ->get();

        // Top Selling Products
        $topProducts = SaleItem::whereIn('sale_id', $saleIds)
            ->select('product_id', 
                \DB::raw('SUM(quantity) as total_qty'),
                \DB::raw('SUM(subtotal) as total_revenue'),
                \DB::raw('SUM((price - buy_price) * quantity) as total_profit')
            )
            ->with(['product' => fn($q) => $q->withTrashed()->with('category')])
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->limit(10)
            ->get();

        // Most Profitable Products
        $profitableProducts = SaleItem::whereIn('sale_id', $saleIds)
            ->select('product_id', 
                \DB::raw('SUM(quantity) as total_qty'),
                \DB::raw('SUM(subtotal) as total_revenue'),
                \DB::raw('SUM((price - buy_price) * quantity) as total_profit')
            )
            ->with(['product' => fn($q) => $q->withTrashed()->with('category')])
            ->groupBy('product_id')
            ->orderByDesc('total_profit')
            ->limit(10)
            ->get();

        // Cashier Performance
        $cashierPerformance = Sale::whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->select('cashier_id',
                \DB::raw('COUNT(id) as total_transactions'),
                \DB::raw('SUM(grand_total) as total_revenue'),
                \DB::raw('AVG(grand_total) as avg_transaction')
            )
            ->with('cashier')
            ->groupBy('cashier_id')
            ->orderByDesc('total_revenue')
            ->get();

        return Inertia::render('reports/index', [
            'summary' => [
                'revenue' => (float) $totalRevenue,
                'transactions_count' => $totalTransactions,
                'average_transaction' => (float) $averageTransaction,
                'profit' => (float) $totalProfit,
                'total_items_sold' => (int) $totalItemsSold,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'dailyReports' => $dailyReports,
            'topProducts' => $topProducts,
            'profitableProducts' => $profitableProducts,
            'cashierPerformance' => $cashierPerformance,
        ]);
    }
}
