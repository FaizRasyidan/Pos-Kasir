<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::withCount('products')->latest()->get();
        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request, AuditLogService $auditLogService): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
        ]);

        $auditLogService->record(
            action: 'create',
            entity: $category,
            newValues: $category->only(['name', 'slug']),
            description: "Category {$category->name} created",
        );

        return redirect()->route('categories.index')->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(Request $request, Category $category, AuditLogService $auditLogService): RedirectResponse
    {
        $oldValues = $category->only(['name', 'slug']);

        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
        ]);

        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
        ]);

        $category->refresh();
        $newValues = $category->only(['name', 'slug']);
        $changedFields = array_keys(array_filter(
            $newValues,
            fn ($value, $field) => ($oldValues[$field] ?? null) != $value,
            ARRAY_FILTER_USE_BOTH,
        ));
        if ($changedFields !== []) {
            $auditLogService->record(
                action: 'update',
                entity: $category,
                oldValues: array_intersect_key($oldValues, array_flip($changedFields)),
                newValues: array_intersect_key($newValues, array_flip($changedFields)),
                description: "Category {$category->name} updated",
            );
        }

        return redirect()->route('categories.index')->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(Category $category, AuditLogService $auditLogService): RedirectResponse
    {
        if ($category->products()->count() > 0) {
            return back()->withErrors(['error' => 'Kategori tidak dapat dihapus karena masih memiliki produk.']);
        }

        $oldValues = $category->only(['name', 'slug']);
        $category->delete();

        $auditLogService->record(
            action: 'delete',
            entity: $category,
            oldValues: $oldValues,
            description: "Category {$category->name} deleted",
        );

        return redirect()->route('categories.index')->with('success', 'Kategori berhasil dihapus.');
    }
}