import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Card,
  CardMedia,
  IconButton,
  Chip,
  Stack,
  FormControlLabel,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  FormHelperText,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  Link as LinkIcon,
  CheckCircleOutline as CheckIcon,
  Save as SaveIcon,
  ArrowBackRounded as BackListIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../../services/product.service';
import { categoryService } from '../../../services/category.service';
import type { Product, Category, AttributeDefinition } from '../../../types/product.types';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { MotionPage } from '../../../components/common/MotionPage';

interface ManagedImage {
  id?: number;
  file_path: string;
  is_primary: boolean;
  file?: File;
  source: 'upload' | 'url';
}

const ensurePrimary = (items: ManagedImage[]): ManagedImage[] => {
  if (items.length === 0) return [];
  const primaryIndex = items.findIndex((item) => item.is_primary);
  if (primaryIndex === -1) {
    return items.map((item, index) => ({ ...item, is_primary: index === 0 }));
  }
  return items.map((item, index) => ({ ...item, is_primary: index === primaryIndex }));
};

export const ProductForm: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showError, showSuccess } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Core product state
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    low_stock_threshold: 10,
    is_active: true,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>(isEdit ? 'url' : 'upload');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Dynamic category attributes
  const [attributeDefs, setAttributeDefs] = useState<AttributeDefinition[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, any>>({});
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  // Specifications
  const [specifications, setSpecifications] = useState<Array<{ key: string; value: string }>>([]);

  // Field validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const imagesRef = useRef<ManagedImage[]>([]);

  const updateImages = (updater: (prev: ManagedImage[]) => ManagedImage[]) => {
    setImages((prev) => {
      const next = updater(prev);
      prev
        .filter((img) => img.source === 'upload')
        .forEach((img) => {
          if (!next.some((candidate) => candidate.file_path === img.file_path)) {
            URL.revokeObjectURL(img.file_path);
          }
        });
      return ensurePrimary(next);
    });
  };

  const fetchAttributeDefinitions = useCallback(
    async (categoryId: number, initialValues?: Record<string, any>) => {
      if (!categoryId) {
        setAttributeDefs([]);
        setAttributeValues({});
        return;
      }

      setLoadingAttributes(true);
      try {
        const defs = await categoryService.getCategoryFilters(categoryId);
        const activeDefs = defs
          .filter((def) => def.is_active !== false)
          .sort((a, b) => {
            const orderA = a.sort_order ?? 9999;
            const orderB = b.sort_order ?? 9999;
            if (orderA === orderB) {
              return a.display_name.localeCompare(b.display_name);
            }
            return orderA - orderB;
          });
        setAttributeDefs(activeDefs);

        const baseValues = initialValues ?? {};
        const normalized: Record<string, any> = {};

        activeDefs.forEach((def) => {
          const rawValue = baseValues[def.code];
          if (rawValue === undefined || rawValue === null) {
            if (def.input_type === 'multi_select') {
              normalized[def.code] = [];
            } else if (def.input_type === 'checkbox') {
              normalized[def.code] = false;
            } else {
              normalized[def.code] = '';
            }
            return;
          }

          if (def.input_type === 'multi_select') {
            normalized[def.code] = Array.isArray(rawValue) ? rawValue : [rawValue];
          } else if (def.input_type === 'checkbox') {
            normalized[def.code] = Boolean(rawValue);
          } else {
            normalized[def.code] = rawValue;
          }
        });

        setAttributeValues(normalized);
      } catch (error: any) {
        console.error('ProductForm fetchAttributeDefinitions error', error);
        setAttributeDefs([]);
        setAttributeValues({});
      } finally {
        setLoadingAttributes(false);
      }
    },
    []
  );

  const handleAttributeValueChange = (code: string, value: any) => {
    setAttributeValues((prev) => ({ ...prev, [code]: value }));
  };

  const buildAttributesPayload = (): Record<string, any> => {
    const payload: Record<string, any> = {};
    attributeDefs.forEach((def) => {
      const value = attributeValues[def.code];
      if (value === undefined || value === null) return;
      if (Array.isArray(value) && value.length === 0) return;
      if (typeof value === 'string' && value.trim() === '') return;
      payload[def.code] = value;
    });
    return payload;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const cats = await categoryService.getActiveCategories();
        setCategories(cats);
      } catch (e) {
        console.warn('Could not load categories:', e);
      }

      if (isEdit && id) {
        setLoading(true);
        try {
          const p = await productService.getProductById(Number(id));
          setProduct({
            ...p,
            quantity: p.quantity ?? 0,
            price: p.price ?? 0,
            low_stock_threshold: p.low_stock_threshold ?? 10,
          } as Partial<Product>);

          if (p.images && p.images.length > 0) {
            const nextImages: ManagedImage[] = p.images.map((img, index) => ({
              id: img.id,
              file_path: img.file_path,
              is_primary: img.is_primary ?? index === 0,
              source: 'url',
            }));
            setImages(ensurePrimary(nextImages));
            setImageMode('url');
          } else {
            setImages([]);
            setImageMode('upload');
          }

          if (p.specifications) {
            const specs = Object.entries(p.specifications).map(([key, value]) => ({
              key,
              value: String(value),
            }));
            setSpecifications(specs);
          }

          if (p.category?.id) {
            await fetchAttributeDefinitions(p.category.id, (p.attributes as Record<string, any>) || undefined);
          }
        } catch (err: any) {
          showError('Không tải được thông tin sản phẩm: ' + (err.message || err));
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [fetchAttributeDefinitions, id, isEdit, showError]);

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    const categoryId = value ? Number(value) : NaN;
    setProduct((prev) => ({
      ...prev,
      category: Number.isNaN(categoryId) ? undefined : ({ id: categoryId } as any),
    }));

    if (errors.category) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.category;
        return next;
      });
    }

    if (Number.isNaN(categoryId)) {
      setAttributeDefs([]);
      setAttributeValues({});
      return;
    }

    setAttributeDefs([]);
    setAttributeValues({});
    fetchAttributeDefinitions(categoryId, {});
  };

  // Image handling
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (imageMode !== 'upload') setImageMode('upload');
    const files = event.target.files;
    if (!files) return;

    const newImages: ManagedImage[] = Array.from(files).map((file) => ({
      file_path: URL.createObjectURL(file),
      is_primary: false,
      file,
      source: 'upload',
    }));

    updateImages((prev) => [...prev.filter((img) => img.source === 'upload'), ...newImages]);
    if (errors.images) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.images;
        return next;
      });
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (imageMode !== 'url') setImageMode('url');
    if (!/^https?:\/\//i.test(trimmed)) {
      showError('URL hình ảnh phải bắt đầu bằng http:// hoặc https://');
      return;
    }

    updateImages((prev) => [
      ...prev.filter((img) => img.source === 'url'),
      {
        file_path: trimmed,
        is_primary: false,
        source: 'url',
      },
    ]);
    setImageUrlInput('');
    if (errors.images) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.images;
        return next;
      });
    }
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    updateImages((prev) => {
      const next = [...prev];
      const item = next.splice(fromIndex, 1)[0];
      next.splice(toIndex, 0, item);
      return next;
    });
  };

  const handleRemoveImage = (index: number) => {
    updateImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    updateImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
  };

  // Drag and Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    handleMoveImage(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  // Specifications
  const handleAddSpecification = () => {
    setSpecifications((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleUpdateSpecification = (index: number, field: 'key' | 'value', val: string) => {
    setSpecifications((prev) =>
      prev.map((spec, i) => (i === index ? { ...spec, [field]: val } : spec))
    );
  };

  const handleRemoveSpecification = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!product.name || !product.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên sản phẩm';
    } else if (product.name.trim().length < 3) {
      newErrors.name = 'Tên sản phẩm phải có ít nhất 3 ký tự';
    }

    const categoryId = (product.category as Category | undefined)?.id;
    if (!categoryId) {
      newErrors.category = 'Vui lòng chọn danh mục cho sản phẩm';
    }

    if (product.price === undefined || product.price === null || Number(product.price) <= 0) {
      newErrors.price = 'Giá bán phải lớn hơn 0 VNĐ';
    }

    if (product.quantity === undefined || product.quantity === null || Number(product.quantity) < 0) {
      newErrors.quantity = 'Số lượng tồn kho không được âm';
    }

    if (images.length === 0) {
      newErrors.images = 'Vui lòng tải lên hoặc thêm ít nhất một hình ảnh đại diện cho sản phẩm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showError('Vui lòng kiểm tra lại các trường thông tin có viền đỏ.');
      return;
    }

    setSaving(true);
    try {
      const specsObject = specifications.reduce((acc, spec) => {
        if (spec.key.trim() && spec.value.trim()) {
          acc[spec.key.trim()] = spec.value.trim();
        }
        return acc;
      }, {} as Record<string, string>);

      const attributesPayload = buildAttributesPayload();
      const qty = Number(product.quantity ?? 0);
      const categoryId = (product.category as Category).id;

      const payload: any = {
        name: product.name?.trim() || '',
        description: product.description?.trim() || '',
        price: Number(product.price || 0),
        quantity: qty,
        stock_quantity: qty,
        low_stock_threshold: Number(product.low_stock_threshold ?? 10),
        category_id: categoryId,
        specifications: specsObject,
        attributes: attributesPayload,
        is_active: product.is_active !== undefined ? product.is_active : true,
      };

      if (isEdit && id) {
        await productService.updateProduct(Number(id), payload);
        showSuccess('Cập nhật sản phẩm thành công!');
      } else {
        if (imageMode === 'upload') {
          const uploadImages = images.filter((img) => img.source === 'upload');
          const files = uploadImages.map((img) => img.file).filter((f): f is File => Boolean(f));
          const primaryIndex = uploadImages.findIndex((img) => img.is_primary);

          await productService.createProduct(payload, {
            images: files,
            primaryImageIndex: primaryIndex >= 0 ? primaryIndex : 0,
          });
        } else {
          const sortedUrlImages = images
            .filter((img) => img.source === 'url')
            .sort((a, b) => (a.is_primary === b.is_primary ? 0 : a.is_primary ? -1 : 1));
          const urlImages = sortedUrlImages.map((img) => img.file_path.trim()).filter(Boolean);

          await productService.createProductWithImageUrls(payload, urlImages);
        }
        showSuccess('Tạo mới sản phẩm thành công!');
      }

      navigate('/admin/products');
    } catch (err: any) {
      showError('Lưu sản phẩm thất bại: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const extractOptions = (options: any): string[] => {
    if (!options) return [];
    if (Array.isArray(options)) {
      return options
        .map((item) => (typeof item === 'string' ? item : item?.label || item?.value || String(item)))
        .filter(Boolean);
    }
    return [];
  };

  const renderAttributeField = (def: AttributeDefinition) => {
    const options = extractOptions(def.options);
    const currentValue = attributeValues[def.code];

    switch (def.input_type) {
      case 'multi_select': {
        const selectedValues: string[] = Array.isArray(currentValue)
          ? currentValue.map(String)
          : currentValue ? [String(currentValue)] : [];
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{def.display_name}</InputLabel>
            <Select<string[]>
              multiple
              label={def.display_name}
              value={selectedValues}
              onChange={(e) => {
                const val = e.target.value;
                handleAttributeValueChange(def.code, Array.isArray(val) ? val : [val]);
              }}
              renderValue={(selected) => selected.join(', ')}
            >
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
            {def.unit && <FormHelperText>Đơn vị: {def.unit}</FormHelperText>}
          </FormControl>
        );
      }
      case 'select': {
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{def.display_name}</InputLabel>
            <Select
              label={def.display_name}
              value={currentValue !== undefined && currentValue !== null ? String(currentValue) : ''}
              onChange={(e) => handleAttributeValueChange(def.code, e.target.value)}
            >
              <MenuItem value="">-- Chọn {def.display_name} --</MenuItem>
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
            {def.unit && <FormHelperText>Đơn vị: {def.unit}</FormHelperText>}
          </FormControl>
        );
      }
      case 'checkbox': {
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(currentValue)}
                onChange={(e) => handleAttributeValueChange(def.code, e.target.checked)}
              />
            }
            label={def.display_name}
          />
        );
      }
      case 'range': {
        const min = Number(def.options?.min ?? 0);
        const max = Number(def.options?.max ?? 100);
        const step = Number(def.options?.step ?? 1);
        const sliderValue = typeof currentValue === 'number' ? currentValue : min;

        return (
          <Box sx={{ px: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {def.display_name}: <strong>{sliderValue} {def.unit || ''}</strong>
            </Typography>
            <Slider
              value={sliderValue}
              min={min}
              max={max}
              step={step}
              valueLabelDisplay="auto"
              onChange={(_e, val) => handleAttributeValueChange(def.code, Array.isArray(val) ? val[0] : val)}
              sx={{ mt: 1 }}
            />
          </Box>
        );
      }
      case 'number': {
        return (
          <TextField
            fullWidth
            size="small"
            type="number"
            label={def.display_name}
            value={currentValue ?? ''}
            onChange={(e) => handleAttributeValueChange(def.code, e.target.value === '' ? '' : Number(e.target.value))}
            helperText={def.unit ? `Đơn vị: ${def.unit}` : undefined}
            placeholder={`Nhập ${def.display_name}`}
          />
        );
      }
      case 'text':
      default: {
        return (
          <TextField
            fullWidth
            size="small"
            label={def.display_name}
            value={currentValue ?? ''}
            onChange={(e) => handleAttributeValueChange(def.code, e.target.value)}
            helperText={def.unit ? `Đơn vị: ${def.unit}` : undefined}
            placeholder={`Nhập ${def.display_name}`}
          />
        );
      }
    }
  };

  const selectedCatId = (product.category as Category | undefined)?.id?.toString() || '';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MotionPage>
      <Box sx={{ pb: 6 }}>
        {/* Header toolbar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<BackListIcon />}
              onClick={() => navigate('/admin/products')}
              sx={{ borderRadius: 2 }}
            >
              Danh sách
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {isEdit ? 'Chỉnh sửa sản phẩm' : 'Tạo mới sản phẩm'}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            onClick={handleSubmit}
            disabled={saving}
            sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
          >
            {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}
          </Button>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Left Column: Core Info & Dynamic Attributes */}
            <Grid item xs={12} lg={8}>
              <Stack spacing={3}>
                {/* 1. Thông tin cơ bản */}
                <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    1. Thông tin cơ bản
                  </Typography>

                  <Stack spacing={2.5}>
                    <TextField
                      fullWidth
                      label="Tên sản phẩm"
                      required
                      value={product.name || ''}
                      onChange={(e) => {
                        setProduct((p) => ({ ...p, name: e.target.value }));
                        if (errors.name) setErrors((err) => ({ ...err, name: '' }));
                      }}
                      error={Boolean(errors.name)}
                      helperText={errors.name}
                      placeholder="Ví dụ: CPU Intel Core i9-14900K (3.2GHz Turbo 6.0GHz)"
                    />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required error={Boolean(errors.category)}>
                          <InputLabel>Danh mục sản phẩm</InputLabel>
                          <Select
                            value={selectedCatId}
                            onChange={handleCategoryChange}
                            label="Danh mục sản phẩm"
                          >
                            <MenuItem value="">-- Chọn danh mục --</MenuItem>
                            {categories.map((c) => (
                              <MenuItem key={c.id} value={String(c.id)}>
                                {c.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={product.is_active !== false}
                              onChange={(e) => setProduct((p) => ({ ...p, is_active: e.target.checked }))}
                              color="primary"
                            />
                          }
                          label="Kích hoạt mở bán ngay"
                          sx={{ mt: 1 }}
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Mô tả chi tiết sản phẩm"
                      value={product.description || ''}
                      onChange={(e) => setProduct((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Mô tả về tính năng nổi bật, xuất xứ, ứng dụng thực tế..."
                    />
                  </Stack>
                </Paper>

                {/* 2. Giá & Quản lý tồn kho */}
                <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    2. Giá bán & Quản lý tồn kho
                  </Typography>

                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Giá bán (VNĐ)"
                        required
                        value={product.price || ''}
                        onChange={(e) => {
                          setProduct((p) => ({ ...p, price: Number(e.target.value) }));
                          if (errors.price) setErrors((err) => ({ ...err, price: '' }));
                        }}
                        error={Boolean(errors.price)}
                        helperText={errors.price}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Số lượng tồn kho"
                        required
                        value={product.quantity ?? ''}
                        onChange={(e) => {
                          setProduct((p) => ({ ...p, quantity: Number(e.target.value) }));
                          if (errors.quantity) setErrors((err) => ({ ...err, quantity: '' }));
                        }}
                        error={Boolean(errors.quantity)}
                        helperText={errors.quantity}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Ngưỡng cảnh báo tồn ít"
                        value={product.low_stock_threshold ?? 10}
                        onChange={(e) => setProduct((p) => ({ ...p, low_stock_threshold: Number(e.target.value) }))}
                        helperText="Hệ thống sẽ báo động khi tồn kho dưới mức này"
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* 3. Thuộc tính động theo Danh mục */}
                <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      3. Thuộc tính kỹ thuật theo danh mục
                    </Typography>
                    {loadingAttributes && <CircularProgress size={20} />}
                  </Box>

                  {attributeDefs.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      {selectedCatId
                        ? 'Danh mục này chưa được cấu hình thuộc tính kỹ thuật động.'
                        : 'Vui lòng chọn danh mục ở Bước 1 để hiển thị các thuộc tính tương ứng (Socket, VRAM, TDP, Số nhân...).'}
                    </Typography>
                  ) : (
                    <Grid container spacing={2.5}>
                      {attributeDefs.map((def) => (
                        <Grid item xs={12} sm={6} key={def.code}>
                          {renderAttributeField(def)}
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>

                {/* 4. Thông số kỹ thuật bổ sung (Key-Value Specs) */}
                <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      4. Thông số kỹ thuật chi tiết (Tùy biến)
                    </Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={handleAddSpecification} sx={{ fontWeight: 600 }}>
                      Thêm dòng
                    </Button>
                  </Box>

                  {specifications.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Chưa có thông số tùy biến nào. Nhấn "+ Thêm dòng" để bổ sung các cặp Tên thông số - Giá trị.
                    </Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {specifications.map((spec, idx) => (
                        <Box key={idx} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                          <TextField
                            size="small"
                            label="Tên thông số"
                            value={spec.key}
                            onChange={(e) => handleUpdateSpecification(idx, 'key', e.target.value)}
                            sx={{ flex: 1 }}
                            placeholder="Ví dụ: Bảo hành, Kích thước"
                          />
                          <TextField
                            size="small"
                            label="Giá trị"
                            value={spec.value}
                            onChange={(e) => handleUpdateSpecification(idx, 'value', e.target.value)}
                            sx={{ flex: 1.5 }}
                            placeholder="Ví dụ: 36 tháng chính hãng"
                          />
                          <IconButton size="small" color="error" onClick={() => handleRemoveSpecification(idx)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Paper>
              </Stack>
            </Grid>

            {/* Right Column: Image Management & Ordering */}
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, position: 'sticky', top: 88 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Hình ảnh sản phẩm
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Kéo-thả hoặc dùng nút mũi tên để đổi thứ tự ảnh. Ảnh đầu tiên có gắn sao là ảnh đại diện.
                </Typography>

                {/* Mode switcher */}
                <ToggleButtonGroup
                  value={imageMode}
                  exclusive
                  onChange={(_e, val) => val && setImageMode(val)}
                  size="small"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="upload" startIcon={<UploadIcon />}>
                    Tải từ máy
                  </ToggleButton>
                  <ToggleButton value="url" startIcon={<LinkIcon />}>
                    Nhập URL
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Upload or URL input */}
                {imageMode === 'upload' ? (
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadIcon />}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      mb: 2,
                    }}
                  >
                    Chọn file ảnh (nhiều ảnh)
                    <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="https://example.com/image.jpg"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImageUrl())}
                    />
                    <Button variant="contained" size="small" onClick={handleAddImageUrl} sx={{ px: 2 }}>
                      Thêm
                    </Button>
                  </Box>
                )}

                {errors.images && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1.5, fontWeight: 600 }}>
                    {errors.images}
                  </Typography>
                )}

                {/* Images list with reordering */}
                <Stack spacing={1.5} sx={{ maxHeight: 480, overflowY: 'auto', pr: 0.5 }}>
                  {images.map((img, index) => (
                    <Card
                      key={img.file_path}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 2,
                        border: `1px solid ${img.is_primary ? theme.palette.primary.main : theme.palette.divider}`,
                        bgcolor: img.is_primary ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                        cursor: 'grab',
                        transition: 'all 150ms ease',
                        '&:hover': {
                          boxShadow: theme.shadows[2],
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={img.file_path}
                        alt={`Ảnh ${index + 1}`}
                        sx={{ width: 64, height: 64, borderRadius: 1.5, objectFit: 'contain', bgcolor: 'grey.100', flexShrink: 0 }}
                      />

                      <Box sx={{ flexGrow: 1, ml: 1.5, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {img.is_primary ? (
                            <Chip
                              size="small"
                              label="Ảnh đại diện"
                              color="primary"
                              icon={<CheckIcon />}
                              sx={{ height: 20, fontSize: '0.675rem', fontWeight: 700 }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Thứ tự: #{index + 1}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title={img.is_primary ? 'Ảnh đại diện' : 'Đặt làm ảnh đại diện'}>
                          <IconButton
                            size="small"
                            onClick={() => handleSetPrimaryImage(index)}
                            color={img.is_primary ? 'warning' : 'default'}
                          >
                            {img.is_primary ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Đưa lên trên">
                          <span>
                            <IconButton
                              size="small"
                              disabled={index === 0}
                              onClick={() => handleMoveImage(index, index - 1)}
                            >
                              <ArrowBackIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Đưa xuống dưới">
                          <span>
                            <IconButton
                              size="small"
                              disabled={index === images.length - 1}
                              onClick={() => handleMoveImage(index, index + 1)}
                            >
                              <ArrowForwardIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Xóa ảnh này">
                          <IconButton size="small" color="error" onClick={() => handleRemoveImage(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Card>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </form>
      </Box>
    </MotionPage>
  );
};

export default ProductForm;
