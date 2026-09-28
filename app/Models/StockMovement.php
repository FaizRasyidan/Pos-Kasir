<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    protected $fillable = [
        'product_id',
        'user_id',
        'type',
        'quantity',
        'buy_price',
        'selling_price',
        'stock_before',
        'stock_after',
        'reference_type',
        'reference_id',
        'description',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'buy_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'stock_before' => 'integer',
        'stock_after' => 'integer',
        'reference_id' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
