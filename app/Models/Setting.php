<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    /**
     * Get setting value by key with optional default fallback.
     */
    public static function getValue(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set setting value by key.
     */
    public static function setValue(string $key, $value): void
    {
        self::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    /**
     * Get all settings as associative array.
     */
    public static function allAsArray(): array
    {
        return self::get()->pluck('value', 'key')->toArray();
    }

    /**
     * Get receipt-facing store settings from one settings query.
     */
    public static function receiptSettings(): array
    {
        $settings = self::allAsArray();

        return [
            'store_name' => $settings['store_name'] ?? 'TOKO POS-KASIR',
            'store_tagline' => $settings['store_tagline'] ?? '',
            'store_address' => $settings['store_address'] ?? '',
            'store_phone' => $settings['store_phone'] ?? '',
            'store_email' => $settings['store_email'] ?? '',
            'receipt_header' => $settings['receipt_header'] ?? '',
            'receipt_footer' => $settings['receipt_footer'] ?? 'Terima Kasih Telah Berbelanja!',
        ];
    }
}
