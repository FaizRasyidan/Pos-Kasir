<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard - accessible to both admin and cashier
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Sales history (Admin can see all, Cashier can see list, view handled in controller)
    Route::resource('sales', SaleController::class)->only(['index', 'show']);

    // Admin Only Routes
    Route::middleware([\App\Http\Middleware\EnsureUserIsAdmin::class])->group(function () {
        Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
        Route::resource('categories', CategoryController::class);
        Route::resource('products', ProductController::class);
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/stock-movements', [StockMovementController::class, 'index'])->name('stock-movements.index');

        // Stock Management
        Route::get('/stocks', [StockController::class, 'index'])->name('stocks.index');
        Route::post('/stocks/in', [StockController::class, 'stockIn'])->name('stocks.in');
        Route::post('/stocks/out', [StockController::class, 'stockOut'])->name('stocks.out');

        // Store Settings
        Route::get('/settings/store', [SettingController::class, 'index'])->name('settings.index');
        Route::post('/settings/store', [SettingController::class, 'update'])->name('settings.update');
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
        Route::get('/audit-logs/{auditLog}', [AuditLogController::class, 'show'])->name('audit-logs.show');
        Route::get('/users/cashiers', [UserManagementController::class, 'index'])->name('users.cashiers.index');
        Route::post('/users/cashiers', [UserManagementController::class, 'store'])->name('users.cashiers.store');
        Route::patch('/users/cashiers/{user}', [UserManagementController::class, 'update'])->name('users.cashiers.update');
    });

    // Cashier Only Routes - POS and checkout
    Route::middleware([\App\Http\Middleware\EnsureUserIsCashier::class])->group(function () {
        Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
        Route::post('/pos/checkout', [PosController::class, 'checkout'])->name('pos.checkout');
    });
});

require __DIR__.'/settings.php';