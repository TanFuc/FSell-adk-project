import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Copy,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Image,
  Calendar,
  Briefcase,
  HelpCircle,
  LayoutGrid,
  ImagePlus,
  Layers,
  Palette,
  UserCircle,
  ShieldCheck,
  BarChart3,
  FileImage,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/services/api";
import { authApi } from "@/services/api";
import { publicApi } from "@/services/api";
import type { Registration, RegistrationStats, RegistrationStatus } from "@/types";
import { getProvinceLabel, getDistrictLabel } from "@/data/locations";
import {
  SectionsTab,
  BannersTab,
  EventsTab,
  BusinessModelsTab,
  FAQTab,
  SettingsTab,
  GalleryTab,
  PhotoCategoriesTab,
  BrandingTab,
  ProfileTab,
  AdminUsersTab,
  AnalyticsTab,
  ContentTab,
} from "@/components/admin/tabs";

const STATUS_LABELS: Record<RegistrationStatus, { label: string; color: string }> = {
  PENDING: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
  CONTACTED: { label: "Đang liên hệ", color: "bg-blue-100 text-blue-800" },
  SUCCESSFUL: { label: "Thành công", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Từ chối", color: "bg-red-100 text-red-800" },
};

interface SiteNameConfig {
  shortName?: string;
  name?: string;
  fullName?: string;
}

type AdminTabKey =
  | "registrations"
  | "analytics"
  | "sections"
  | "banners"
  | "events"
  | "business"
  | "faq"
  | "content"
  | "gallery"
  | "photo-categories"
  | "branding"
  | "admin-users"
  | "profile"
  | "settings";

interface AdminTabGuide {
  title: string;
  description: string;
  affects: string;
  affectedComponents: string[];
  previewPath?: string;
  quickLinks: Array<{ label: string; href: string }>;
}

const TAB_GUIDES: Record<AdminTabKey, AdminTabGuide> = {
  registrations: {
    title: "Đăng ký",
    description: "Quản lý lead từ form đăng ký hợp tác.",
    affects: "Trang chủ: form CTA đăng ký hợp tác.",
    affectedComponents: ["CTA Form", "Nút Đăng Ký"],
    quickLinks: [{ label: "Mở trang chủ", href: "/" }],
    previewPath: "/",
  },
  analytics: {
    title: "Phân tích Click",
    description: "Theo dõi hiệu quả CTA và chuyển hướng.",
    affects: "Trang chủ và trang sự kiện (các nút CTA có tracking).",
    affectedComponents: ["Hero CTA", "Event CTA", "CTA Banner"],
    quickLinks: [
      { label: "Mở trang chủ", href: "/" },
      { label: "Mở trang sự kiện", href: "/su-kien" },
    ],
    previewPath: "/",
  },
  sections: {
    title: "Phần mục",
    description: "Chỉnh layout và nội dung động của landing page.",
    affects: "Trang chủ: hero, section text/image, CTA banner...",
    affectedComponents: ["Hero", "CTA Banner", "FAQ Block", "Gallery Block"],
    quickLinks: [{ label: "Mở trang chủ", href: "/" }],
    previewPath: "/",
  },
  banners: {
    title: "Banner",
    description: "Quản lý popup/banner nổi bật.",
    affects: "Popup hiển thị ở trang public theo rule kích hoạt.",
    affectedComponents: ["Popup Banner", "Landing Overlay"],
    quickLinks: [{ label: "Mở trang chủ", href: "/" }],
    previewPath: "/",
  },
  events: {
    title: "Sự kiện",
    description: "Quản lý danh sách sự kiện và sự kiện nổi bật.",
    affects: "Trang sự kiện và một phần nổi bật ở landing page.",
    affectedComponents: ["Event List", "Featured Event Block"],
    quickLinks: [
      { label: "Mở trang sự kiện", href: "/su-kien" },
      { label: "Mở trang chủ", href: "/" },
    ],
    previewPath: "/su-kien",
  },
  business: {
    title: "Mô hình KD",
    description: "Quản lý các khối lợi ích/điểm mạnh mô hình.",
    affects: "Trang mô hình kinh doanh.",
    affectedComponents: ["Business Model Grid", "Benefit Cards"],
    quickLinks: [{ label: "Mở trang mô hình", href: "/mo-hinh" }],
    previewPath: "/mo-hinh",
  },
  faq: {
    title: "Hỏi đáp",
    description: "Câu hỏi thường gặp cho đối tác/khách hàng.",
    affects: "Trang mô hình và các block FAQ liên quan.",
    affectedComponents: ["FAQ Block", "FAQ Accordion"],
    quickLinks: [{ label: "Mở trang mô hình", href: "/mo-hinh" }],
    previewPath: "/mo-hinh",
  },
  content: {
    title: "Nội dung",
    description: "Nội dung module theo type (FAQ/Feature/...).",
    affects: "Nhiều khu vực public tùy content type.",
    affectedComponents: ["Hero Text", "CTA Text", "FAQ Block", "Feature Block"],
    quickLinks: [
      { label: "Mở trang chủ", href: "/" },
      { label: "Mở trang sự kiện", href: "/su-kien" },
      { label: "Mở trang mô hình", href: "/mo-hinh" },
    ],
    previewPath: "/",
  },
  gallery: {
    title: "Thư viện ảnh",
    description: "Quản lý ảnh hiển thị công khai.",
    affects: "Trang thư viện ảnh.",
    affectedComponents: ["Gallery Block", "Image Masonry"],
    quickLinks: [{ label: "Mở trang thư viện", href: "/thu-vien" }],
    previewPath: "/thu-vien",
  },
  "photo-categories": {
    title: "Danh mục ảnh",
    description: "Nhóm ảnh theo category/filter.",
    affects: "Bộ lọc và nhóm hiển thị ở trang thư viện ảnh.",
    affectedComponents: ["Gallery Filter", "Gallery Block"],
    quickLinks: [{ label: "Mở trang thư viện", href: "/thu-vien" }],
    previewPath: "/thu-vien",
  },
  branding: {
    title: "Thương hiệu",
    description: "Tên dự án, brand text, logo và thông tin hiển thị chung.",
    affects: "Navbar/Footer và nhiều vị trí nhận diện trên trang public.",
    affectedComponents: ["Navbar", "Footer", "Hero Brand"],
    quickLinks: [{ label: "Mở trang chủ", href: "/" }],
    previewPath: "/",
  },
  "admin-users": {
    title: "Quản lý Admin",
    description: "Tạo/sửa quyền tài khoản quản trị.",
    affects: "Không hiển thị public, chỉ ảnh hưởng phân quyền trong admin.",
    affectedComponents: ["Admin Permission", "Auth Access"],
    quickLinks: [{ label: "Mở admin", href: "/admin" }],
  },
  profile: {
    title: "Tài khoản",
    description: "Cập nhật thông tin và mật khẩu tài khoản đăng nhập hiện tại.",
    affects: "Không hiển thị public, ảnh hưởng hồ sơ người quản trị.",
    affectedComponents: ["Profile Info", "Login Security"],
    quickLinks: [{ label: "Mở admin", href: "/admin" }],
  },
  settings: {
    title: "Cấu hình",
    description: "Thông số hệ thống, link, cấu hình hiển thị toàn cục.",
    affects: "Ảnh hưởng nhiều module public theo từng key cấu hình.",
    affectedComponents: ["Hero", "CTA Banner", "Contact Block", "FAQ Block"],
    quickLinks: [
      { label: "Mở trang chủ", href: "/" },
      { label: "Mở trang sự kiện", href: "/su-kien" },
      { label: "Mở trang mô hình", href: "/mo-hinh" },
    ],
    previewPath: "/",
  },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminTabKey>("registrations");
  const [previewReloadKey, setPreviewReloadKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | "all">("all");

  // Get admin info from localStorage
  const adminInfo = JSON.parse(localStorage.getItem("admin") || "{}");

  const { data: currentAdmin } = useQuery({
    queryKey: ["currentAdmin"],
    queryFn: () => authApi.getMe(),
    staleTime: 5 * 60 * 1000,
  });

  const displayAdminName =
    currentAdmin?.fullName || adminInfo.fullName || adminInfo.hoTen || adminInfo.email || "Admin";

  // Fetch stats
  const { data: stats } = useQuery<RegistrationStats>({
    queryKey: ["registrationStats"],
    queryFn: () => adminApi.getRegistrationStats(),
  });

  const { data: config } = useQuery({
    queryKey: ["publicConfig"],
    queryFn: () => publicApi.getPublicConfig(),
    staleTime: 10 * 60 * 1000,
  });

  const siteNameConfig = (config?.site_name as SiteNameConfig) || {};
  const adminBrandName =
    siteNameConfig.fullName || siteNameConfig.name || siteNameConfig.shortName || "Nhà Thuốc ADK";
  const activeGuide = TAB_GUIDES[activeTab];
  const previewUrl =
    typeof window !== "undefined" && activeGuide.previewPath
      ? `${window.location.origin}${activeGuide.previewPath}`
      : "";

  // Fetch registrations
  const { data: registrationsData, isLoading } = useQuery({
    queryKey: ["registrations", statusFilter],
    queryFn: () =>
      adminApi.getRegistrations(1, 100, statusFilter === "all" ? undefined : statusFilter),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RegistrationStatus }) =>
      adminApi.updateRegistrationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["registrationStats"] });
      toast({
        title: "Cập nhật thành công",
        description: "Trạng thái đăng ký đã được cập nhật.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Cập nhật thất bại",
        description: "Đã xảy ra lỗi. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopyPreviewLink = async () => {
    if (!previewUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(previewUrl);
      toast({
        title: "Đã copy link preview",
        description: previewUrl,
        variant: "success",
      });
    } catch {
      toast({
        title: "Không thể copy link",
        description: "Trình duyệt không cho phép copy tự động. Hãy copy thủ công.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container-full py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-adk-green/10 flex items-center justify-center">
              <img src="/logo.png" alt="ADK Logo" className="w-8 h-8 object-contain rounded-full" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">{adminBrandName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Xin chào, <strong>{displayAdminName}</strong>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-full py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng đăng ký</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Chờ xử lý</p>
                <p className="text-2xl font-bold">{stats?.pending || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Thành công</p>
                <p className="text-2xl font-bold">{stats?.successful || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Từ chối</p>
                <p className="text-2xl font-bold">{stats?.rejected || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="registrations"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as AdminTabKey)}
          className="space-y-4"
        >
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="registrations" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Đăng ký
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Phân tích Click
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Phần mục
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Banner
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Sự kiện
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Mô hình KD
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Hỏi đáp
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileImage className="w-4 h-4" />
              Nội dung
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <ImagePlus className="w-4 h-4" />
              Thư viện ảnh
            </TabsTrigger>
            <TabsTrigger value="photo-categories" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Danh mục ảnh
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Thương hiệu
            </TabsTrigger>
            <TabsTrigger value="admin-users" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Quản lý Admin
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              Tài khoản
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Cấu hình
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-1 bg-white rounded-xl shadow-sm border p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-adk-green uppercase">
                  Tab Đang Chỉnh
                </p>
                <h3 className="text-lg font-semibold text-gray-900">{activeGuide.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{activeGuide.description}</p>
              </div>

              <div className="rounded-lg bg-gray-50 border p-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">Hiển thị ở đâu?</p>
                <p className="text-sm text-gray-600">{activeGuide.affects}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeGuide.affectedComponents.map((component) => (
                    <span
                      key={`${activeTab}-${component}`}
                      className="inline-flex items-center rounded-full bg-white border px-2 py-1 text-xs text-gray-700"
                    >
                      Ảnh hưởng: {component}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700">Link truy cập trực tiếp</p>
                <div className="flex flex-wrap gap-2">
                  {activeGuide.quickLinks.map((link) => (
                    <Button
                      key={`${activeTab}-${link.href}`}
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(link.href, "_blank", "noopener,noreferrer")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {link.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Eye className="w-4 h-4" />
                  <p className="text-sm font-semibold">Review / Xem Trước</p>
                </div>
                <div className="flex items-center gap-2">
                  {previewUrl ? (
                    <>
                      <Button variant="outline" size="sm" onClick={handleCopyPreviewLink}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy link preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewReloadKey((v) => v + 1)}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reload preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(previewUrl, "_blank", "noopener,noreferrer")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Mở trang preview
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>

              {previewUrl ? (
                <iframe
                  key={`${activeTab}-${previewReloadKey}`}
                  title={`preview-${activeTab}`}
                  src={previewUrl}
                  className="w-full h-[380px] rounded-lg border bg-white"
                />
              ) : (
                <div className="h-[380px] rounded-lg border bg-gray-50 flex items-center justify-center text-sm text-gray-600">
                  Tab này không có trang public riêng để preview trực tiếp.
                </div>
              )}
            </div>
          </div>

          {/* Registrations Tab */}
          <TabsContent value="registrations">
            <div className="bg-white rounded-xl shadow-sm border">
              {/* Filter Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">Danh sách đăng ký</h2>
                <div className="flex items-center gap-4">
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as RegistrationStatus | "all")}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Lọc trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                      <SelectItem value="CONTACTED">Đã liên hệ</SelectItem>
                      <SelectItem value="SUCCESSFUL">Thành công</SelectItem>
                      <SelectItem value="REJECTED">Từ chối</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      queryClient.invalidateQueries({
                        queryKey: ["registrations"],
                      })
                    }
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Họ tên
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">SĐT</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Địa chỉ
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Ngày đăng ký
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          Đang tải...
                        </td>
                      </tr>
                    ) : registrationsData?.data.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      registrationsData?.data.map((reg: Registration) => (
                        <tr key={reg.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{reg.fullName}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {reg.phone}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {getDistrictLabel(reg.province, reg.district)},{" "}
                            {getProvinceLabel(reg.province)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDate(reg.registeredAt)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_LABELS[reg.status].color
                            }`}
                            >
                              {STATUS_LABELS[reg.status].label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Select
                              value={reg.status}
                              onValueChange={(value) =>
                                updateStatusMutation.mutate({
                                  id: reg.id,
                                  status: value as RegistrationStatus,
                                })
                              }
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                                <SelectItem value="CONTACTED">Đã liên hệ</SelectItem>
                                <SelectItem value="SUCCESSFUL">Thành công</SelectItem>
                                <SelectItem value="REJECTED">Từ chối</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsTab />
          </TabsContent>

          {/* Sections Tab */}
          <TabsContent value="sections">
            <SectionsTab />
          </TabsContent>

          {/* Banners Tab */}
          <TabsContent value="banners">
            <BannersTab />
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <EventsTab />
          </TabsContent>

          {/* Business Models Tab */}
          <TabsContent value="business">
            <BusinessModelsTab />
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <FAQTab />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <ContentTab />
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <GalleryTab />
          </TabsContent>

          {/* Photo Categories Tab */}
          <TabsContent value="photo-categories">
            <PhotoCategoriesTab />
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <BrandingTab />
          </TabsContent>

          {/* Admin Users Tab */}
          <TabsContent value="admin-users">
            <AdminUsersTab />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
