import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Layers,
  Palette,
  Ruler,
  AlertCircle,
  Check,
  RefreshCw,
  Image as ImageIcon,
  DollarSign,
  Package,
} from 'lucide-react';
import { ProductColorOption, ProductSizeOption, ProductVariant } from '../types';
import { AdminProductImagesManager } from './AdminProductImagesManager';

interface AdminProductOptionsEditorProps {
  productId?: string;
  colorOptions: ProductColorOption[];
  setColorOptions: React.Dispatch<React.SetStateAction<ProductColorOption[]>>;
  sizeOptions: ProductSizeOption[];
  setSizeOptions: React.Dispatch<React.SetStateAction<ProductSizeOption[]>>;
  variants: ProductVariant[];
  setVariants: React.Dispatch<React.SetStateAction<ProductVariant[]>>;
  baseSku: string;
  baseSellingPrice: number;
  baseMrp: number;
  baseImages: string[];
}

const LUXURY_COLOR_PALETTES = [
  { name: 'Vintage Gold', hexCode: '#C9A227' },
  { name: 'Ruby Scarlet', hexCode: '#D32F2F' },
  { name: 'Teal Sapphire', hexCode: '#00897B' },
  { name: 'Midnight Black', hexCode: '#111111' },
  { name: 'Royal Wine', hexCode: '#722F37' },
  { name: 'Emerald Green', hexCode: '#046307' },
  { name: 'Ivory Cream', hexCode: '#FDFBF7' },
  { name: 'Midnight Navy', hexCode: '#191970' },
  { name: 'Blush Rose', hexCode: '#DE5D83' },
  { name: 'Plum Purple', hexCode: '#582233' },
  { name: 'Mustard Zari', hexCode: '#E1AD01' },
  { name: 'Powder Blue', hexCode: '#B0E0E6' },
];

export const AdminProductOptionsEditor: React.FC<AdminProductOptionsEditorProps> = ({
  productId,
  colorOptions,
  setColorOptions,
  sizeOptions,
  setSizeOptions,
  variants,
  setVariants,
  baseSku,
  baseSellingPrice,
  baseMrp,
  baseImages,
}) => {
  const [showColorPaletteDropdown, setShowColorPaletteDropdown] = useState(false);
  const [bulkStockValue, setBulkStockValue] = useState<number>(10);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);
  const [expandedColorImages, setExpandedColorImages] = useState<Record<string, boolean>>({});

  const toggleColorImagesExpanded = (colorId: string) => {
    setExpandedColorImages((prev) => ({ ...prev, [colorId]: !prev[colorId] }));
  };

  // Helper to slugify a string for SKU generation
  const slugify = (text: string) =>
    text
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6) || 'OPT';

  // -------------------------------------------------------------
  // COLORS MANAGEMENT
  // -------------------------------------------------------------
  const handleAddColor = (presetName?: string, presetHex?: string) => {
    const newId = `col-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nextIndex = colorOptions.length + 1;
    const newColor: ProductColorOption = {
      id: newId,
      name: presetName || `Color ${nextIndex}`,
      hexCode: presetHex || '#B76E79',
      images: [],
      isEnabled: true,
    };
    setColorOptions((prev) => [...prev, newColor]);
  };

  const handleUpdateColor = (id: string, updates: Partial<ProductColorOption>) => {
    setColorOptions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleDeleteColor = (id: string) => {
    setColorOptions((prev) => prev.filter((c) => c.id !== id));
  };

  const handleMoveColor = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === colorOptions.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...colorOptions];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setColorOptions(updated);
  };

  // Check duplicate color names
  const getColorDuplicateWarning = (name: string, currentId: string) => {
    if (!name.trim()) return null;
    const isDup = colorOptions.some(
      (c) => c.id !== currentId && c.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    return isDup ? 'Duplicate color name' : null;
  };

  // -------------------------------------------------------------
  // SIZES MANAGEMENT
  // -------------------------------------------------------------
  const handleAddSize = (name?: string) => {
    const newId = `size-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nextIndex = sizeOptions.length + 1;
    const newSize: ProductSizeOption = {
      id: newId,
      name: name || `Size ${nextIndex}`,
      isEnabled: true,
    };
    setSizeOptions((prev) => [...prev, newSize]);
  };

  const handleAddStandardSizeSet = () => {
    const standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
    const existingNames = new Set(sizeOptions.map((s) => s.name.trim().toUpperCase()));
    const toAdd = standardSizes.filter((s) => !existingNames.has(s));
    if (toAdd.length === 0) return;

    const newSizes: ProductSizeOption[] = toAdd.map((s, idx) => ({
      id: `size-${Date.now()}-${idx}`,
      name: s,
      isEnabled: true,
    }));
    setSizeOptions((prev) => [...prev, ...newSizes]);
  };

  const handleAddNumericSizeSet = () => {
    const numericSizes = ['28', '30', '32', '34', '36', '38', '40', '42', '44'];
    const existingNames = new Set(sizeOptions.map((s) => s.name.trim()));
    const toAdd = numericSizes.filter((s) => !existingNames.has(s));
    if (toAdd.length === 0) return;

    const newSizes: ProductSizeOption[] = toAdd.map((s, idx) => ({
      id: `size-${Date.now()}-${idx}`,
      name: s,
      isEnabled: true,
    }));
    setSizeOptions((prev) => [...prev, ...newSizes]);
  };

  const handleUpdateSize = (id: string, updates: Partial<ProductSizeOption>) => {
    setSizeOptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleDeleteSize = (id: string) => {
    setSizeOptions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleMoveSize = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sizeOptions.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...sizeOptions];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setSizeOptions(updated);
  };

  // Check duplicate size names
  const getSizeDuplicateWarning = (name: string, currentId: string) => {
    if (!name.trim()) return null;
    const isDup = sizeOptions.some(
      (s) => s.id !== currentId && s.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    return isDup ? 'Duplicate size name' : null;
  };

  // -------------------------------------------------------------
  // VARIANTS COMBINATIONS GENERATOR
  // -------------------------------------------------------------
  const handleGenerateVariants = () => {
    const enabledColors = colorOptions.filter((c) => c.isEnabled && c.name.trim());
    const enabledSizes = sizeOptions.filter((s) => s.isEnabled && s.name.trim());

    if (enabledColors.length === 0 && enabledSizes.length === 0) {
      alert('Please configure and enable at least one Color or Size to generate variants.');
      return;
    }

    const cleanBaseSku = (baseSku || 'FSH').toUpperCase().trim();
    const existingVariantsMap = new Map<string, ProductVariant>();

    // Map existing variants by color + size composite key to preserve custom pricing and stock
    variants.forEach((v) => {
      const key = `${v.color.trim().toLowerCase()}__${v.size.trim().toLowerCase()}`;
      existingVariantsMap.set(key, v);
    });

    const generated: ProductVariant[] = [];

    if (enabledColors.length > 0 && enabledSizes.length > 0) {
      // Cartesian product: Colors x Sizes
      enabledColors.forEach((col) => {
        enabledSizes.forEach((sz) => {
          const key = `${col.name.trim().toLowerCase()}__${sz.name.trim().toLowerCase()}`;
          const existing = existingVariantsMap.get(key);

          if (existing) {
            generated.push({
              ...existing,
              colorId: col.id,
              color: col.name.trim(),
              sizeId: sz.id,
              size: sz.name.trim(),
            });
          } else {
            const variantSku = `${cleanBaseSku}-${slugify(col.name)}-${slugify(sz.name)}`;
            const colorImg = col.images?.[0] || baseImages[0] || '';
            generated.push({
              id: `var-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
              colorId: col.id,
              color: col.name.trim(),
              sizeId: sz.id,
              size: sz.name.trim(),
              sku: variantSku,
              stock: 10,
              sellingPrice: baseSellingPrice || 0,
              mrp: baseMrp || baseSellingPrice || 0,
              image: colorImg,
              isEnabled: true,
            });
          }
        });
      });
    } else if (enabledColors.length > 0) {
      // Color-only variants
      enabledColors.forEach((col) => {
        const key = `${col.name.trim().toLowerCase()}__standard`;
        const existing = existingVariantsMap.get(key);
        if (existing) {
          generated.push({ ...existing, colorId: col.id, color: col.name.trim() });
        } else {
          generated.push({
            id: `var-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            colorId: col.id,
            color: col.name.trim(),
            size: 'Standard',
            sku: `${cleanBaseSku}-${slugify(col.name)}`,
            stock: 10,
            sellingPrice: baseSellingPrice || 0,
            mrp: baseMrp || baseSellingPrice || 0,
            image: col.images?.[0] || baseImages[0] || '',
            isEnabled: true,
          });
        }
      });
    } else if (enabledSizes.length > 0) {
      // Size-only variants
      enabledSizes.forEach((sz) => {
        const key = `standard__${sz.name.trim().toLowerCase()}`;
        const existing = existingVariantsMap.get(key);
        if (existing) {
          generated.push({ ...existing, sizeId: sz.id, size: sz.name.trim() });
        } else {
          generated.push({
            id: `var-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            color: 'Original',
            sizeId: sz.id,
            size: sz.name.trim(),
            sku: `${cleanBaseSku}-${slugify(sz.name)}`,
            stock: 10,
            sellingPrice: baseSellingPrice || 0,
            mrp: baseMrp || baseSellingPrice || 0,
            image: baseImages[0] || '',
            isEnabled: true,
          });
        }
      });
    }

    setVariants(generated);
    setBulkMessage(`Generated ${generated.length} variant combinations!`);
    setTimeout(() => setBulkMessage(null), 4000);
  };

  const handleUpdateVariant = (id: string, updates: Partial<ProductVariant>) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const handleDeleteVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleAddCustomVariant = () => {
    const firstCol = colorOptions.find((c) => c.isEnabled)?.name || 'Custom Color';
    const firstSz = sizeOptions.find((s) => s.isEnabled)?.name || 'Custom Size';
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      color: firstCol,
      size: firstSz,
      sku: `${baseSku || 'FSH'}-CUSTOM-${Date.now().toString().slice(-4)}`,
      stock: 10,
      sellingPrice: baseSellingPrice || 0,
      mrp: baseMrp || baseSellingPrice || 0,
      isEnabled: true,
    };
    setVariants((prev) => [...prev, newVariant]);
  };

  const handleBulkApplyStock = () => {
    if (bulkStockValue < 0) return;
    setVariants((prev) => prev.map((v) => ({ ...v, stock: bulkStockValue })));
    setBulkMessage(`Updated all ${variants.length} variants to ${bulkStockValue} stock units.`);
    setTimeout(() => setBulkMessage(null), 3000);
  };

  const handleBulkSyncPrices = () => {
    if (!baseSellingPrice) return;
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        sellingPrice: baseSellingPrice,
        mrp: baseMrp || baseSellingPrice,
      }))
    );
    setBulkMessage(`Synced price (₹${baseSellingPrice}) and MRP across all variants.`);
    setTimeout(() => setBulkMessage(null), 3000);
  };

  const handleClearAllVariants = () => {
    if (window.confirm('Are you sure you want to clear all variants?')) {
      setVariants([]);
    }
  };

  const activeColorsCount = colorOptions.filter((c) => c.isEnabled).length;
  const activeSizesCount = sizeOptions.filter((s) => s.isEnabled).length;
  const potentialCombinations = activeColorsCount * activeSizesCount;

  return (
    <div className="space-y-6 pt-4 border-t border-stone-200">
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: COLORS (DYNAMIC & UNLIMITED) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-stone-50/70 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-900" />
              <h4 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900">
                Colors
              </h4>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold font-mono">
                {colorOptions.length} total ({activeColorsCount} active)
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Add any number of colors for this garment with custom HEX shades and color-specific images. No fixed limit.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Luxury Presets Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPaletteDropdown(!showColorPaletteDropdown)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-[11px] text-stone-700 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Preset Swatches</span>
              </button>

              {showColorPaletteDropdown && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-stone-200 p-2.5 z-30 grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto">
                  {LUXURY_COLOR_PALETTES.map((palette) => (
                    <button
                      key={palette.name}
                      type="button"
                      onClick={() => {
                        handleAddColor(palette.name, palette.hexCode);
                        setShowColorPaletteDropdown(false);
                      }}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-stone-50 text-left text-[11px] text-stone-800 transition-colors"
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-stone-300 shrink-0"
                        style={{ backgroundColor: palette.hexCode }}
                      />
                      <span className="truncate">{palette.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Primary Add Color Button */}
            <button
              id="btn-admin-add-color"
              type="button"
              onClick={() => handleAddColor()}
              className="bg-stone-900 hover:bg-stone-800 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Color</span>
            </button>
          </div>
        </div>

        {/* Color Items List */}
        <div className="space-y-3">
          {colorOptions.map((color, index) => {
            const dupWarning = getColorDuplicateWarning(color.name, color.id);

            return (
              <div
                key={color.id}
                className={`bg-white rounded-xl p-3.5 border transition-all ${
                  color.isEnabled
                    ? 'border-stone-200 shadow-xs'
                    : 'border-dashed border-stone-300 bg-stone-100/50 opacity-75'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left: Index badge + Name input + Color Picker */}
                  <div className="flex flex-wrap items-center gap-2.5 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-1 rounded font-mono shrink-0">
                      Color {index + 1}
                    </span>

                    {/* Color Swatch Preview & Native Picker */}
                    <div className="flex items-center gap-1.5 shrink-0 bg-stone-50 border border-stone-200 rounded-lg p-1">
                      <input
                        type="color"
                        value={color.hexCode || '#C9A227'}
                        onChange={(e) => handleUpdateColor(color.id, { hexCode: e.target.value.toUpperCase() })}
                        className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                        title="Click to select color from palette"
                      />
                      <input
                        type="text"
                        value={color.hexCode || ''}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val && !val.startsWith('#')) val = `#${val}`;
                          handleUpdateColor(color.id, { hexCode: val.toUpperCase() });
                        }}
                        placeholder="#HEX"
                        maxLength={7}
                        className="w-20 text-[11px] font-mono uppercase bg-transparent focus:outline-hidden"
                      />
                    </div>

                    {/* Color Name Input */}
                    <div className="flex-1 min-w-[140px]">
                      <input
                        type="text"
                        required
                        value={color.name}
                        onChange={(e) => handleUpdateColor(color.id, { name: e.target.value })}
                        placeholder="Color Name (e.g. Vintage Gold)"
                        maxLength={40}
                        className={`w-full bg-stone-50 px-2.5 py-1.5 rounded-lg border text-xs text-stone-900 focus:bg-white focus:outline-hidden ${
                          dupWarning
                            ? 'border-rose-300 focus:border-rose-500'
                            : 'border-stone-200 focus:border-stone-900'
                        }`}
                      />
                      {dupWarning && (
                        <span className="text-[10px] text-rose-600 flex items-center gap-1 mt-0.5 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{dupWarning}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Controls (Enable/Disable, Reorder, Delete) */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100 shrink-0">
                    {/* Active toggle */}
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-stone-700 select-none">
                      <input
                        type="checkbox"
                        checked={color.isEnabled ?? true}
                        onChange={(e) => handleUpdateColor(color.id, { isEnabled: e.target.checked })}
                        className="rounded text-stone-900 focus:ring-0"
                      />
                      <span>{color.isEnabled ? 'Enabled' : 'Disabled'}</span>
                    </label>

                    {/* Reorder Buttons */}
                    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveColor(index, 'up')}
                        className="p-1 hover:bg-stone-200 text-stone-600 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === colorOptions.length - 1}
                        onClick={() => handleMoveColor(index, 'down')}
                        className="p-1 hover:bg-stone-200 text-stone-600 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Delete Color */}
                    <button
                      type="button"
                      onClick={() => handleDeleteColor(color.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Color"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Color Specific Images Manager */}
                <div className="mt-2.5 pt-2 border-t border-stone-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-stone-700 font-semibold">
                      <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
                      <span>Color Photos ({color.images?.length || 0})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleColorImagesExpanded(color.id)}
                      className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>
                        {expandedColorImages[color.id]
                          ? 'Hide Photos'
                          : color.images?.length
                          ? `Manage Photos (${color.images.length})`
                          : '+ Upload Photos for this Color'}
                      </span>
                      {expandedColorImages[color.id] ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Thumbnail Previews when collapsed */}
                  {!expandedColorImages[color.id] && color.images && color.images.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {color.images.filter((img) => typeof img === 'string' && img.trim() !== '').map((img, i) => (
                        <div key={i} className="relative group shrink-0">
                          <img
                            src={img.trim()}
                            alt={`${color.name} ${i + 1}`}
                            className="w-10 h-12 object-cover rounded-lg border border-stone-200 bg-stone-100"
                          />
                          {i === 0 && (
                            <span className="absolute bottom-0 inset-x-0 bg-stone-900/80 text-[8px] text-amber-300 text-center font-bold uppercase rounded-b-lg">
                              Main
                            </span>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => toggleColorImagesExpanded(color.id)}
                        className="text-[10px] text-stone-500 hover:text-stone-900 border border-dashed border-stone-300 rounded-lg h-12 px-2 flex items-center justify-center cursor-pointer"
                      >
                        + Add / Edit
                      </button>
                    </div>
                  )}

                  {/* Full Uploader when expanded */}
                  {expandedColorImages[color.id] && (
                    <div className="mt-2 pt-2 border-t border-stone-200">
                      <AdminProductImagesManager
                        productId={productId || 'temp_product'}
                        images={color.images || []}
                        galleryImages={color.galleryImages || []}
                        folder="colors"
                        colorId={color.id}
                        colorName={color.name}
                        label={`Photos for ${color.name}`}
                        helperText={`Photos uploaded here will automatically show up when a customer selects ${color.name}.`}
                        onChange={(newImages, newGallery) => {
                          handleUpdateColor(color.id, {
                            images: newImages,
                            galleryImages: newGallery,
                          });
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {colorOptions.length === 0 && (
            <div className="bg-white rounded-xl p-6 text-center border border-dashed border-stone-300 text-xs text-stone-500 space-y-2">
              <Palette className="w-6 h-6 text-stone-300 mx-auto" />
              <p className="font-semibold text-stone-700">No product colors added yet</p>
              <p className="text-[11px] text-stone-400">
                Click &quot;+ Add Color&quot; or choose from &quot;Preset Swatches&quot; to configure colors for this garment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: SIZES (DYNAMIC & UNLIMITED) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-stone-50/70 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-amber-900" />
              <h4 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900">
                Sizes
              </h4>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold font-mono">
                {sizeOptions.length} total ({activeSizesCount} active)
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Add any number of standard or custom sizes (e.g., Free Size, 28, 30, 32, XS, S, M, Custom Fit). No fixed limit.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Sizing Presets */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleAddStandardSizeSet}
                className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-[11px] text-stone-700 font-medium transition-colors cursor-pointer"
                title="Add XS, S, M, L, XL, XXL, 3XL"
              >
                + XS–3XL
              </button>
              <button
                type="button"
                onClick={handleAddNumericSizeSet}
                className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-[11px] text-stone-700 font-medium transition-colors cursor-pointer"
                title="Add 28, 30, 32, 34, 36, 38, 40, 42, 44"
              >
                + 28–44
              </button>
              <button
                type="button"
                onClick={() => handleAddSize('Free Size')}
                className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-[11px] text-stone-700 font-medium transition-colors cursor-pointer"
                title="Add Free Size"
              >
                + Free Size
              </button>
            </div>

            {/* Primary Add Size Button */}
            <button
              id="btn-admin-add-size"
              type="button"
              onClick={() => handleAddSize()}
              className="bg-stone-900 hover:bg-stone-800 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Size</span>
            </button>
          </div>
        </div>

        {/* Size Items List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {sizeOptions.map((size, index) => {
            const dupWarning = getSizeDuplicateWarning(size.name, size.id);

            return (
              <div
                key={size.id}
                className={`bg-white rounded-xl p-3 border transition-all ${
                  size.isEnabled
                    ? 'border-stone-200 shadow-xs'
                    : 'border-dashed border-stone-300 bg-stone-100/50 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono">
                    Size {index + 1}
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Reorder Buttons */}
                    <div className="flex items-center border border-stone-200 rounded overflow-hidden bg-stone-50">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveSize(index, 'up')}
                        className="p-0.5 hover:bg-stone-200 text-stone-600 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={index === sizeOptions.length - 1}
                        onClick={() => handleMoveSize(index, 'down')}
                        className="p-0.5 hover:bg-stone-200 text-stone-600 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Delete Size */}
                    <button
                      type="button"
                      onClick={() => handleDeleteSize(size.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                      title="Delete Size"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Size Name Input */}
                <input
                  type="text"
                  required
                  value={size.name}
                  onChange={(e) => handleUpdateSize(size.id, { name: e.target.value })}
                  placeholder="e.g. S, XL, 32, Free Size"
                  maxLength={30}
                  className={`w-full bg-stone-50 px-2.5 py-1.5 rounded-lg border text-xs font-semibold text-stone-900 focus:bg-white focus:outline-hidden ${
                    dupWarning
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-stone-200 focus:border-stone-900'
                  }`}
                />
                {dupWarning && (
                  <span className="text-[10px] text-rose-600 flex items-center gap-1 mt-0.5 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{dupWarning}</span>
                  </span>
                )}

                {/* Enable / Disable */}
                <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-medium text-stone-600 select-none">
                    <input
                      type="checkbox"
                      checked={size.isEnabled ?? true}
                      onChange={(e) => handleUpdateSize(size.id, { isEnabled: e.target.checked })}
                      className="rounded text-stone-900 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>{size.isEnabled ? 'Active' : 'Disabled'}</span>
                  </label>
                </div>
              </div>
            );
          })}

          {sizeOptions.length === 0 && (
            <div className="col-span-full bg-white rounded-xl p-6 text-center border border-dashed border-stone-300 text-xs text-stone-500 space-y-2">
              <Ruler className="w-6 h-6 text-stone-300 mx-auto" />
              <p className="font-semibold text-stone-700">No garment sizes added yet</p>
              <p className="text-[11px] text-stone-400">
                Click &quot;+ Add Size&quot; or use &quot;+ XS–3XL&quot; / &quot;+ Free Size&quot; presets to configure sizes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: VARIANTS MATRIX */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-stone-50/70 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-900" />
              <h4 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900">
                Product Variants Matrix
              </h4>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-900 text-amber-300 font-semibold font-mono">
                {variants.length} Variants
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Generate combinations from configured colors &amp; sizes ({activeColorsCount} colors × {activeSizesCount} sizes = {potentialCombinations} potential). Edit SKU, stock, and individual prices below.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-admin-generate-variants"
              type="button"
              onClick={handleGenerateVariants}
              className="bg-amber-900 hover:bg-amber-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate Variants</span>
            </button>
            <button
              type="button"
              onClick={handleAddCustomVariant}
              className="bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Variant</span>
            </button>
          </div>
        </div>

        {bulkMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{bulkMessage}</span>
          </div>
        )}

        {/* Bulk Action Controls */}
        {variants.length > 0 && (
          <div className="bg-white rounded-xl p-3 border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Bulk Update:
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  value={bulkStockValue}
                  onChange={(e) => setBulkStockValue(Number(e.target.value))}
                  className="w-16 bg-stone-50 px-2 py-1 rounded border border-stone-200 text-xs text-center"
                />
                <button
                  type="button"
                  onClick={handleBulkApplyStock}
                  className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-[11px]"
                >
                  Set All Stock
                </button>
              </div>

              <button
                type="button"
                onClick={handleBulkSyncPrices}
                className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-[11px]"
              >
                Sync Base Prices
              </button>
            </div>

            <button
              type="button"
              onClick={handleClearAllVariants}
              className="text-[11px] text-rose-600 hover:text-rose-800 font-medium"
            >
              Clear All Variants
            </button>
          </div>
        )}

        {/* Variants List / Table */}
        {variants.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {variants.map((variant, index) => {
              const matchingColor = colorOptions.find(
                (c) => c.name.trim().toLowerCase() === variant.color.trim().toLowerCase()
              );

              return (
                <div
                  key={variant.id}
                  className={`bg-white p-3 rounded-xl border transition-all ${
                    variant.isEnabled
                      ? 'border-stone-200 shadow-xs'
                      : 'border-dashed border-stone-300 opacity-60 bg-stone-50'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Combination Badges: Color + Size */}
                    <div className="sm:col-span-3 flex items-center gap-2">
                      <span className="text-[10px] font-mono text-stone-400">#{index + 1}</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Color Chip */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 text-[11px] font-semibold">
                          <span
                            className="w-3 h-3 rounded-full border border-stone-300 shrink-0"
                            style={{ backgroundColor: matchingColor?.hexCode || '#C9A227' }}
                          />
                          <span>{variant.color}</span>
                        </span>
                        {/* Size Badge */}
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-bold font-mono">
                          {variant.size}
                        </span>
                      </div>
                    </div>

                    {/* Variant SKU */}
                    <div className="sm:col-span-3">
                      <label className="block text-[9px] uppercase font-bold text-stone-400 mb-0.5 sm:hidden">
                        Variant SKU
                      </label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => handleUpdateVariant(variant.id, { sku: e.target.value })}
                        placeholder="Variant SKU"
                        className="w-full text-xs font-mono bg-stone-50 px-2 py-1 rounded border border-stone-200 focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    {/* Stock Units */}
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] uppercase font-bold text-stone-400 mb-0.5 sm:hidden">
                        Stock
                      </label>
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3 text-stone-400 shrink-0" />
                        <input
                          type="number"
                          min="0"
                          value={variant.stock}
                          onChange={(e) =>
                            handleUpdateVariant(variant.id, { stock: Math.max(0, Number(e.target.value)) })
                          }
                          className="w-full text-xs font-semibold bg-stone-50 px-2 py-1 rounded border border-stone-200 focus:bg-white focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Selling Price */}
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] uppercase font-bold text-stone-400 mb-0.5 sm:hidden">
                        Selling Price (₹)
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold text-stone-500">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={variant.sellingPrice}
                          onChange={(e) =>
                            handleUpdateVariant(variant.id, {
                              sellingPrice: Math.max(0, Number(e.target.value)),
                            })
                          }
                          className="w-full text-xs font-bold text-stone-900 bg-stone-50 px-2 py-1 rounded border border-stone-200 focus:bg-white focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Actions: Image preview + Delete */}
                    <div className="sm:col-span-2 flex items-center justify-end gap-2">
                      {variant.image && variant.image.trim() !== '' ? (
                        <img
                          src={variant.image.trim()}
                          alt={variant.sku}
                          className="w-7 h-7 object-cover rounded border border-stone-200 shrink-0 bg-stone-100"
                          title="Variant Image"
                        />
                      ) : (
                        <div
                          className="w-7 h-7 rounded border border-dashed border-stone-300 flex items-center justify-center text-stone-300"
                          title="No variant image set"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteVariant(variant.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Optional Image URL Input */}
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center gap-2">
                    <span className="text-[10px] text-stone-400 font-medium shrink-0">Variant Photo:</span>
                    <input
                      type="url"
                      value={variant.image || ''}
                      onChange={(e) => handleUpdateVariant(variant.id, { image: e.target.value.trim() })}
                      placeholder="Optional variant image URL (https://...)"
                      className="flex-1 text-[10px] bg-stone-50 px-2 py-0.5 rounded border border-stone-200 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 text-center border border-dashed border-stone-300 text-xs text-stone-500 space-y-2">
            <Layers className="w-6 h-6 text-stone-300 mx-auto" />
            <p className="font-semibold text-stone-700">No variants generated yet</p>
            <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
              Click &quot;Generate Variants&quot; above to create combinations based on your configured colors and sizes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
