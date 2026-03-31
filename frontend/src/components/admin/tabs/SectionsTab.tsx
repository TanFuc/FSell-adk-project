import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Eye, EyeOff, RefreshCw, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/services/api";
import { getErrorMessage } from "@/lib/error-handler";
import { ConfirmDialog } from "../ConfirmDialog";
import type { Section, LayoutType } from "@/types";

const LAYOUT_TYPES: { value: LayoutType; label: string }[] = [
  { value: "HERO_VIDEO", label: "Hero Video" },
  { value: "HERO_IMAGE", label: "Hero Image" },
  { value: "SPLIT_IMAGE_TEXT", label: "Split Image/Text" },
  { value: "BENTO_GRID", label: "Bento Grid" },
  { value: "CAROUSEL", label: "Carousel" },
  { value: "MASONRY_GRID", label: "Masonry Grid" },
  { value: "TEXT_ONLY", label: "Text Only" },
  { value: "CTA_BANNER", label: "CTA Banner" },
];

export function SectionsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Section | null>(null);
  const [deleteItem, setDeleteItem] = useState<Section | null>(null);
  const [formData, setFormData] = useState({
    key: "",
    layoutType: "HERO_IMAGE" as LayoutType,
    content: "{}",
    images: "",
    ctaLink: "",
    sortOrder: 0,
    isVisible: true,
  });

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["adminSections"],
    queryFn: () => adminApi.getAllSections(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Section>) => adminApi.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSections"] });
      toast({ title: "Thành công", description: "Đã tạo phần mục mới", variant: "success" });
      closeModal();
    },
    onError: (error: any) => {
      toast({ 
        title: "Lỗi", 
        description: getErrorMessage(error, "Không thể tạo phần mục"), 
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Section> }) =>
      adminApi.updateSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSections"] });
      toast({ title: "Thành công", description: "Đã cập nhật phần mục", variant: "success" });
      closeModal();
    },
    onError: (error: any) => {
      toast({ 
        title: "Lỗi", 
        description: getErrorMessage(error, "Không thể cập nhật phần mục"), 
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSections"] });
      toast({ title: "Thành công", description: "Đã xóa phần mục", variant: "success" });
      setDeleteItem(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Lỗi", 
        description: getErrorMessage(error, "Không thể xóa phần mục"), 
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      key: "",
      layoutType: "HERO_IMAGE",
      content: '{"title": "", "subtitle": ""}',
      images: "",
      ctaLink: "",
      sortOrder: sections.length,
      isVisible: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Section) => {
    setEditingItem(item);
    setFormData({
      key: item.key,
      layoutType: item.layoutType,
      content: JSON.stringify(item.content, null, 2),
      images: item.images.join("\n"),
      ctaLink: item.ctaLink || "",
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
    if (!formData.key || !formData.layoutType) {
      toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin bắt buộc", variant: "destructive" });
      return;
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(formData.content);
    } catch {
      toast({ title: "Lỗi", description: "Nội dung phải là JSON hợp lệ", variant: "destructive" });
      return;
    }

    const imagesArray = formData.images
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const data = {
      key: formData.key,
      layoutType: formData.layoutType,
      content: parsedContent,
      images: imagesArray,
      ctaLink: formData.ctaLink || undefined,
      sortOrder: formData.sortOrder,
      isVisible: formData.isVisible,
    };

    if (editingItem) {
      const { key, ...updateData } = data;
      updateMutation.mutate({ id: editingItem.id, data: updateData });
    } else {
      createMutation.mutate(data);
    }
  };

  const getLayoutLabel = (type: LayoutType) => {
    return LAYOUT_TYPES.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Quản lý Phần mục Trang</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["adminSections"] })}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm mới
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-12">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Key</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Loại bố cục</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tiêu đề</th>
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
            ) : sections.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Chưa có phần mục nào
                </td>
              </tr>
            ) : (
              sections.map((section, index) => (
                <tr key={section.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-400">
                      <GripVertical className="w-4 h-4" />
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{section.key}</code>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{getLayoutLabel(section.layoutType)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      {(section.content as Record<string, unknown>)?.title?.toString() || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {section.isVisible ? (
                        <>
                          <Eye className="w-4 h-4 text-green-600" />
                          <Badge variant="success">Hiển thị</Badge>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4 text-gray-400" />
                          <Badge variant="secondary">Ẩn</Badge>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(section)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteItem(section)}>
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Chỉnh sửa Phần mục" : "Thêm Phần mục mới"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="key">Key (định danh) *</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="VD: hero_main, concept_intro"
                  disabled={!!editingItem}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="layoutType">Loại bố cục *</Label>
                <Select
                  value={formData.layoutType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, layoutType: value as LayoutType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại bố cục" />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYOUT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Nội dung (JSON) *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder='{"title": "Tiêu đề", "subtitle": "Mô tả"}'
                rows={5}
                className="font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="images">URL Hình ảnh (mỗi URL một dòng)</Label>
              <Textarea
                id="images"
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ctaLink">CTA Link (tùy chọn)</Label>
                <Input
                  id="ctaLink"
                  value={formData.ctaLink}
                  onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sortOrder">Thứ tự</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isVisible"
                checked={formData.isVisible}
                onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
              />
              <Label htmlFor="isVisible">Hiển thị</Label>
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
        description={`Bạn có chắc chắn muốn xóa phần mục "${deleteItem?.key}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
