import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Star, StarOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/services/api";
import { ConfirmDialog } from "../ConfirmDialog";
import { ImageUploadField } from "../ImageUploadField";
import type { Event } from "@/types";

export function EventsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Event | null>(null);
  const [deleteItem, setDeleteItem] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    coverImage: "",
    gallery: [] as string[],
    redirectUrl: "",
    isFeatured: false,
    isVisible: true,
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["adminEvents"],
    queryFn: () => adminApi.getAllEvents(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Event>) => adminApi.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminEvents"] });
      queryClient.invalidateQueries({ queryKey: ["events"] }); // Invalidate public cache
      toast({ title: "Thành công", description: "Đã tạo sự kiện mới", variant: "success" });
      closeModal();
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Không thể tạo sự kiện", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) =>
      adminApi.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminEvents"] });
      queryClient.invalidateQueries({ queryKey: ["events"] }); // Invalidate public cache
      toast({ title: "Thành công", description: "Đã cập nhật sự kiện", variant: "success" });
      closeModal();
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Không thể cập nhật sự kiện", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminEvents"] });
      queryClient.invalidateQueries({ queryKey: ["events"] }); // Invalidate public cache
      toast({ title: "Thành công", description: "Đã xóa sự kiện", variant: "success" });
      setDeleteItem(null);
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Không thể xóa sự kiện", variant: "destructive" });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleEventFeatured(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminEvents"] });
      queryClient.invalidateQueries({ queryKey: ["events"] }); // Invalidate public cache
      toast({ title: "Thành công", description: "Đã cập nhật trạng thái nổi bật", variant: "success" });
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
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      coverImage: "",
      gallery: [],
      redirectUrl: "",
      isFeatured: false,
      isVisible: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Event) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      startDate: new Date(item.startDate).toISOString().split("T")[0],
      endDate: item.endDate ? new Date(item.endDate).toISOString().split("T")[0] : "",
      coverImage: item.coverImage,
      gallery: item.gallery,
      redirectUrl: item.redirectUrl || "",
      isFeatured: item.isFeatured,
      isVisible: item.isVisible,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.startDate || !formData.coverImage) {
      toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin bắt buộc", variant: "destructive" });
      return;
    }

    const data = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Quản lý Sự kiện</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["adminEvents"] })}
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
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ảnh bìa</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tiêu đề</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Thời gian</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Trạng thái</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Chưa có sự kiện nào
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-20 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{event.title}</div>
                    {event.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {event.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div>{formatDate(event.startDate)}</div>
                    {event.endDate && (
                      <div className="text-gray-500">→ {formatDate(event.endDate)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFeaturedMutation.mutate(event.id)}
                          className="hover:opacity-70"
                        >
                          {event.isFeatured ? (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <StarOff className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        {event.isFeatured && <Badge variant="warning">Nổi bật</Badge>}
                      </div>
                      <div className="flex items-center gap-1">
                        {event.isVisible ? (
                          <Badge variant="success">Hiển thị</Badge>
                        ) : (
                          <Badge variant="secondary">Ẩn</Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(event)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteItem(event)}>
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Chỉnh sửa Sự kiện" : "Thêm Sự kiện mới"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Tên sự kiện"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả sự kiện"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <ImageUploadField
                id="coverImage"
                label="URL Ảnh bìa"
                required
                value={formData.coverImage}
                onChange={(url) => setFormData({ ...formData, coverImage: url })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="redirectUrl">URL Redirect (khi nhấn Xem chi tiết)</Label>
              <Input
                id="redirectUrl"
                value={formData.redirectUrl}
                onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                placeholder="https://bizmall.vn hoặc URL sự kiện"
              />
              <p className="text-xs text-gray-500">Nếu để trống, sẽ chuyển đến trang chi tiết sự kiện</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                />
                <Label htmlFor="isFeatured">Nổi bật</Label>
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
        description={`Bạn có chắc chắn muốn xóa sự kiện "${deleteItem?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
