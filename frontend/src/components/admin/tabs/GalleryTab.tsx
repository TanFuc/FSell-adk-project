import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Eye, EyeOff, RefreshCw, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/services/api";
import { ConfirmDialog } from "../ConfirmDialog";
import { ImageUploadField } from "../ImageUploadField";
import type { Photo, PhotoCategory } from "@/types";

export function GalleryTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Photo | null>(null);
  const [deleteItem, setDeleteItem] = useState<Photo | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    categoryId: "",
    sortOrder: 0,
    isVisible: true,
  });

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["adminPhotos"],
    queryFn: () => adminApi.getAllPhotos(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["adminPhotoCategories"],
    queryFn: () => adminApi.getAllPhotoCategories(),
  });

  const filteredPhotos = filterCategory === "all"
    ? photos
    : photos.filter((photo) => photo.categoryId === filterCategory);

  const createMutation = useMutation({
    mutationFn: (data: Partial<Photo>) => adminApi.createPhoto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPhotos"] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      queryClient.invalidateQueries({ queryKey: ["adminPhotoCategories"] });
      toast({ title: "Thành công", description: "Đã thêm hình ảnh mới", variant: "success" });
      closeModal();
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Không thể thêm hình ảnh", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Photo> }) =>
      adminApi.updatePhoto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPhotos"] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      toast({ title: "Thành công", description: "Đã cập nhật hình ảnh", variant: "success" });
      closeModal();
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Không thể cập nhật hình ảnh", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deletePhoto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPhotos"] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      queryClient.invalidateQueries({ queryKey: ["adminPhotoCategories"] });
      toast({ title: "Thành công", description: "Đã xóa hình ảnh", variant: "success" });
      setDeleteItem(null);
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Không thể xóa hình ảnh", variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminApi.togglePhoto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPhotos"] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      toast({ title: "Thành công", description: "Đã cập nhật trạng thái", variant: "success" });
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Không thể cập nhật trạng thái", variant: "destructive" });
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      categoryId: categories[0]?.id || "",
      sortOrder: photos.length,
      isVisible: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Photo) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl,
      categoryId: item.categoryId,
      sortOrder: item.sortOrder,
      isVisible: item.isVisible,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.imageUrl || !formData.categoryId) {
      toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin bắt buộc", variant: "destructive" });
      return;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Quản lý Thư viện Ảnh</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((cat: PhotoCategory) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["adminPhotos"] })}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={openCreateModal} disabled={categories.length === 0}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm mới
          </Button>
        </div>
      </div>

      {categories.length === 0 && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <p className="text-yellow-800 text-sm">
            Vui lòng tạo ít nhất một danh mục trước khi thêm hình ảnh.
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Hình ảnh</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tiêu đề</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Danh mục</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Thứ tự</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Trạng thái</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : filteredPhotos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Chưa có hình ảnh nào
                </td>
              </tr>
            ) : (
              filteredPhotos.map((photo) => (
                <tr key={photo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="w-20 h-14 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.placeholder-text')) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'placeholder-text text-gray-400 text-xs';
                            placeholder.textContent = 'Ảnh lỗi';
                            parent.appendChild(placeholder);
                          }
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{photo.title}</p>
                      {photo.description && (
                        <p className="text-sm text-gray-500 truncate max-w-[200px]">
                          {photo.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {photo.category?.name || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{photo.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={photo.isVisible}
                        onCheckedChange={() => toggleMutation.mutate(photo.id)}
                      />
                      {photo.isVisible ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(photo)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteItem(photo)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Chỉnh sửa Hình ảnh" : "Thêm Hình ảnh mới"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="VD: Cửa hàng ADK Quận 1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn về hình ảnh..."
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <ImageUploadField
                id="imageUrl"
                label="URL Hình ảnh"
                required
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoryId">Danh mục *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: PhotoCategory) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="isVisible"
                  checked={formData.isVisible}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
                />
                <Label htmlFor="isVisible">Hiển thị</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Xác nhận xóa"
        description="Bạn có chắc chắn muốn xóa hình ảnh này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
