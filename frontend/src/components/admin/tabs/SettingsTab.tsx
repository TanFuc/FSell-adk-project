import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, RefreshCw, Save, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/services/api";
import { ConfirmDialog } from "../ConfirmDialog";
import type { Configuration } from "@/types";

export function SettingsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Configuration | null>(null);
  const [deleteItem, setDeleteItem] = useState<Configuration | null>(null);
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    description: "",
  });

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["adminSettings"],
    queryFn: () => adminApi.getAllSettings(),
  });

  // Regular settings (non-logo)
  const regularSettings = useMemo(() => {
    return settings.filter(
      (s) => !["logo_url", "logo_light_url", "favicon_url"].includes(s.key)
    );
  }, [settings]);

  const createMutation = useMutation({
    mutationFn: (data: { key: string; value: unknown; description?: string }) =>
      adminApi.upsertSetting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSettings"] });
      queryClient.invalidateQueries({ queryKey: ["publicConfig"] });
      toast({ title: "Thành công", description: "Đã tạo cấu hình mới", variant: "success" });
      closeModal();
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Không thể tạo cấu hình", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, data }: { key: string; data: { value: unknown; description?: string } }) =>
      adminApi.updateSetting(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSettings"] });
      queryClient.invalidateQueries({ queryKey: ["publicConfig"] });
      toast({ title: "Thành công", description: "Đã cập nhật cấu hình", variant: "success" });
      closeModal();
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Không thể cập nhật cấu hình", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => adminApi.deleteSetting(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSettings"] });
      queryClient.invalidateQueries({ queryKey: ["publicConfig"] });
      toast({ title: "Thành công", description: "Đã xóa cấu hình", variant: "success" });
      setDeleteItem(null);
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Không thể xóa cấu hình", variant: "destructive" });
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      key: "",
      value: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Configuration) => {
    setEditingItem(item);
    setFormData({
      key: item.key,
      value: JSON.stringify(item.value, null, 2),
      description: item.description || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = () => {
    if (!formData.key || !formData.value) {
      toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin", variant: "destructive" });
      return;
    }

    let parsedValue;
    try {
      parsedValue = JSON.parse(formData.value);
    } catch {
      toast({ title: "Lỗi", description: "Giá trị phải là JSON hợp lệ", variant: "destructive" });
      return;
    }

    if (editingItem) {
      updateMutation.mutate({
        key: formData.key,
        data: {
          value: parsedValue,
          description: formData.description || undefined,
        },
      });
    } else {
      createMutation.mutate({
        key: formData.key,
        value: parsedValue,
        description: formData.description || undefined,
      });
    }
  };

  const formatValue = (value: unknown): string => {
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Current Logo Display (Read-only) */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-adk-green" />
            <h2 className="text-lg font-semibold">Logo Hiện Tại</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Logo đang được sử dụng trên website (không thể chỉnh sửa)
          </p>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center">
            <div className="bg-gray-50 p-8 rounded-lg border-2 border-dashed inline-block">
              <img
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgPHJlY3Qgd2lkdGg9IjkwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiNGRkZGRkYiLz4KICAgIDxwYXRoIGQ9Ik0zMDAsMjAwIEMzMDAsMTgwIDMyMCwxNjAgMzQwLDE2MCBMMzYwLDE2MCBDMzgwLDE2MCA0MDAsMTgwIDQwMCwyMDAgTDQwMCwyMjAgQzQwMCwyNDAgMzgwLDI2MCAzNjAsMjYwIEMzNDAsMjYwIDMyMCwyODAgMzAwLDMwMCBMMzAwLDMzMCBDMzAwLDM2MCAzMjAsMzgwIDM0MCwzODAgTDM2MCwzODAgQzM4MCwzODAgNDAwLDM2MCA0MDAsMzMwIEw0MDAsMzAwIEw0NDAsMzAwIEM0NjAsMzAwIDQ4MCwyODAgNDgwLDI2MCBDNDgwLDI0MCA0NjAsMjIwIDQ0MCwyMjAgTDQwMCwyMjAgTDQwMCwyMDAgWiIgZmlsbD0iIzQ4QkI3OCIvPgogICAgPHBhdGggZD0iTTM0MCwxODAgQzM1MCwxODAgMzYwLDE5MCAzNjAsMjAwIEMzNjAsMjEwIDM1MCwyMjAgMzQwLDIyMCBDMzMwLDIyMCAzMjAsMjEwIDMyMCwyMDAgQzMyMCwxOTAgMzMwLDE4MCAzNDAsMTgwIFoiIGZpbGw9IiM3MkNBOUIiLz4KICAgIDxwYXRoIGQ9Ik0zMjAsMjQwIEMzMjAsMjMwIDMzMCwyMjAgMzQwLDIyMCBMMzYwLDIyMCBDMzcwLDIyMCAzODAsMjMwIDM4MCwyNDAgTDM4MCwyNjAgQzM4MCwyNzAgMzcwLDI4MCAzNjAsMjgwIEMzNTAsMjgwIDM0MCwyOTAgMzQwLDMwMCBMMzQwLDMyMCBDMzQwLDMzMCAzNTAsMzQwIDM2MCwzNDAgQzM3MCwzNDAgMzgwLDMzMCAzODAsMzIwIEwzODAsMzAwIEw0MjAsMzAwIEM0MzAsMzAwIDQ0MCwyOTAgNDQwLDI4MCBDNDQwLDI3MCA0MzAsMjYwIDQyMCwyNjAgTDM4MCwyNjAgTDM4MCwyNDAgWiIgZmlsbD0iIzJFODU1QSIvPgogICAgPHRleHQgeD0iNDYwIiB5PSIyNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI3MiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMyRTg1NUEiPk5IxICgVEhV4buMQzwvdGV4dD4KICAgIDx0ZXh0IHg9IjQ3MCIgeT0iMzQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iODAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMkU4NTVBIJ5BREsgPC90ZXh0PgogICAgPHRleHQgeD0iNDcwIiB5PSI0MDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzNiIgZm9udC1zdHlsZT0iaXRhbGljIiBmaWxsPSIjNDhCQjc4Ij7DgG4gROG7gSBLaG/hur88L3RleHQ+CiAgPC9nPgo8L3N2Zz4="
                alt="Logo ADK - Ăn Dễ Khỏe"
                className="h-32 object-contain"
              />
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            Logo đang được hard-coded trong source code
          </p>
        </div>
      </div>

      {/* Regular Settings Section */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Cấu hình hệ thống khác</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["adminSettings"] })}
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
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Key</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Giá trị</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Mô tả</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : regularSettings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Chưa có cấu hình nào
                  </td>
                </tr>
              ) : (
                regularSettings.map((setting) => (
                  <tr key={setting.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">{setting.key}</code>
                    </td>
                    <td className="px-4 py-3">
                      <pre className="text-xs bg-gray-50 p-2 rounded max-w-md overflow-auto max-h-24">
                        {formatValue(setting.value)}
                      </pre>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{setting.description || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(setting)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteItem(setting)}>
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
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Chỉnh sửa Cấu hình" : "Thêm Cấu hình mới"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="key">Key *</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="VD: hero_stats, contact_hotline"
                disabled={!!editingItem}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Giá trị (JSON) *</Label>
              <Textarea
                id="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder='{"key": "value"}'
                rows={6}
                className="font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả (tùy chọn)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả cấu hình này"
              />
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
              <Save className="w-4 h-4 mr-2" />
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
        description={`Bạn có chắc chắn muốn xóa cấu hình "${deleteItem?.key}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.key)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
