<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Add buy_price snapshot to sale_items
        // Existing records default to 0 to prevent null errors, without inventing historical costs.
        Schema::table('sale_items', function (Blueprint $table) {
            if (!Schema::hasColumn('sale_items', 'buy_price')) {
                $table->decimal('buy_price', 12, 2)->default(0)->after('product_id');
            }
        });

        // 2. Add SoftDeletes to products
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // 3. Add stock_before and stock_after audit trail to stock_movements
        // Nullable to safely accommodate historical entries where prior stock was not tracked.
        Schema::table('stock_movements', function (Blueprint $table) {
            if (!Schema::hasColumn('stock_movements', 'stock_before')) {
                $table->integer('stock_before')->nullable()->after('quantity');
            }
            if (!Schema::hasColumn('stock_movements', 'stock_after')) {
                $table->integer('stock_after')->nullable()->after('stock_before');
            }
        });
    }

    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropColumn(['stock_before', 'stock_after']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropColumn(['buy_price']);
        });
    }
};
