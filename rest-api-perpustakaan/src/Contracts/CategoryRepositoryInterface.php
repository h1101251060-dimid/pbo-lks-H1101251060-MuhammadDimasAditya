<?php

namespace App\Contracts;

use App\Models\Category;

/**
 * CategoryRepositoryInterface — kontrak akses data kategori.
 */
interface CategoryRepositoryInterface
{
    /** @return Category[] */
    public function findAll(): array;

    public function findById(int $id): ?Category;

    /** @return int ID yang baru dibuat */
    public function save(Category $category): int;

    public function update(Category $category): bool;

    public function delete(int $id): bool;
}