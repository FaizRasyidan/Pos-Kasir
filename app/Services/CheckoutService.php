<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class CheckoutService
{
    /**
     * Process checkout transaction securely.
     * 
     * @param array $data ['cashier_id', 'payment_method', 'paid_amount', 'discount', 'tax', 'items' => [['product_id', 'quantity']]
     * @return Sale
     * @throws Exception
     */
    public function process(array $data): Sale
    {
        return DB::transaction(function () use ($data) {
            $itemsData = $data['items'] ?? [];
            if (empty($itemsData)) {
                throw new Exception('Keranjang belanja kosong.');
            }

            $subtotal = 0;
            $processedItems = [];

            // 1. Validate products and stock, compute subtotal on server
            foreach ($itemsData as $item) {
                $product = Product::lockForUpdate()->find($item['product_id']);
                
                if (!$product || !$product->is_active) {
                    throw new Exception("Produk tidak ditemukan atau nonaktif.");
                }

                $qty = (int) $item['quantity'];
                if ($qty <= 0) {
                    throw new Exception("Quantity produk {$product->name} tidak valid.");
                }

                if ($product->stock < $qty) {
                    throw new Exception("Stok produk {$product->name} tidak mencukupi. Sisa stok: {$product->stock}");
                }

                $itemSubtotal = $product->sell_price * $qty;
                $subtotal += $itemSubtotal;

                $processedItems[] = [
                    'product' => $product,
                    'quantity' => $qty,
                    'price' => $product->sell_price,
                    'subtotal' => $itemSubtotal,
                ];
            }

            // DISKON & TAX DIHAPUS - selalu 0
            $discount = 0;
            $tax = 0;
            $grandTotal = max(0, $subtotal - $discount + $tax);

            $paidAmount = $data['payment_method'] === 'qris' 
                ? $grandTotal 
                : (float) $data['paid_amount'];

            if ($paidAmount < $grandTotal) {
                throw new Exception("Jumlah pembayaran kurang dari total tagihan.");
            }

            $changeAmount = $paidAmount - $grandTotal;

            // Generate unique transaction number: POS-YYYYMMDD-XXXX
            $datePrefix = 'POS-' . date('Ymd') . '-';
            $lastSale = Sale::where('transaction_number', 'like', $datePrefix . '%')
                ->orderBy('id', 'desc')
                ->first();
            
            $nextSeq = 1;
            if ($lastSale) {
                $nextSeq = (int) Str::afterLast($lastSale->transaction_number, '-') + 1;
            }
            $transactionNumber = $datePrefix . str_pad($nextSeq, 4, '0', STR_PAD_LEFT);

            // 2. Save Sale
            $sale = Sale::create([
                'transaction_number' => $transactionNumber,
                'cashier_id' => $data['cashier_id'] ?? auth()->id(),
                'payment_method' => $data['payment_method'] ?? 'cash',
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'grand_total' => $grandTotal,
                'paid_amount' => $paidAmount,
                'change_amount' => $changeAmount,
            ]);

            // 3. Save Sale Items, reduce stock, record stock movement
            foreach ($processedItems as $proc) {
                /** @var Product $product */
                $product = $proc['product'];
                $qty = $proc['quantity'];

                $stockBefore = (int) $product->stock;
                $stockAfter = $stockBefore - $qty;

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'buy_price' => $product->buy_price,
                    'price' => $product->sell_price,
                    'quantity' => $qty,
                    'subtotal' => $proc['subtotal'],
                ]);

                // Reduce stock
                $product->update(['stock' => $stockAfter]);

                // Record stock movement with snapshot prices and user_id
                StockMovement::create([
                    'product_id' => $product->id,
                    'user_id' => auth()->id(),
                    'type' => 'sale',
                    'quantity' => -$qty,
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'buy_price' => $product->buy_price,
                    'selling_price' => $product->sell_price,
                    'reference_type' => Sale::class,
                    'reference_id' => $sale->id,
                    'description' => "Penjualan transaksi {$transactionNumber}",
                ]);
            }

            return $sale->load('items.product', 'cashier');
        });
    }
}
