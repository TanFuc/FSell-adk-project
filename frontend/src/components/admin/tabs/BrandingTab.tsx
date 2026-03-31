import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, RefreshCw, Image, Type, Phone, Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/services/api";
import type { Configuration } from "@/types";

interface SiteNameConfig {
  prefix?: string;
  shortName?: string;
  name?: string;
  fullName?: string;
  tagline?: string;
}

interface LogoConfig {
  main?: string;
  light?: string;
  favicon?: string;
}

interface ContactInfoConfig {
  hotline?: string;
  email?: string;
  address?: string;
}

interface SocialLinksConfig {
  facebook?: string;
  youtube?: string;
  zalo?: string;
}

interface PrimaryRegisterUrlConfig {
  url?: string;
  label?: string;
}

export function BrandingTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [siteName, setSiteName] = useState<SiteNameConfig>({
    prefix: "",
    shortName: "",
    fullName: "",
    tagline: "",
  });

  const [logo, setLogo] = useState<LogoConfig>({
    main: "",
    light: "",
    favicon: "",
  });

  const [contactInfo, setContactInfo] = useState<ContactInfoConfig>({
    hotline: "",
    email: "",
    address: "",
  });

  const [socialLinks, setSocialLinks] = useState<SocialLinksConfig>({
    facebook: "",
    youtube: "",
    zalo: "",
  });

  const [primaryRegisterUrl, setPrimaryRegisterUrl] = useState<PrimaryRegisterUrlConfig>({
    url: "",
    label: "",
  });

  // Fetch all settings
  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["adminSettings"],
    queryFn: () => adminApi.getAllSettings(),
  });

  // Load settings into form states
  useEffect(() => {
    if (settings.length > 0) {
      const getConfig = <T,>(key: string): T => {
        const config = settings.find((s: Configuration) => s.key === key);
        return (config?.value || {}) as T;
      };

      const siteNameData = getConfig<SiteNameConfig>("site_name");
      const shortName = siteNameData.shortName || "";
      const fullName = siteNameData.fullName || siteNameData.name || "";
      const derivedPrefix = fullName.replace(shortName, "").trim();
      setSiteName({
        prefix: siteNameData.prefix || derivedPrefix,
        shortName,
        fullName,
        tagline: siteNameData.tagline || "",
      });

      const logoData = getConfig<LogoConfig>("logo");
      setLogo({
        main: logoData.main || "",
        light: logoData.light || "",
        favicon: logoData.favicon || "",
      });

      const contactData = getConfig<ContactInfoConfig>("contact_info");
      setContactInfo({
        hotline: contactData.hotline || "",
        email: contactData.email || "",
        address: contactData.address || "",
      });

      const socialData = getConfig<SocialLinksConfig>("social_links");
      setSocialLinks({
        facebook: socialData.facebook || "",
        youtube: socialData.youtube || "",
        zalo: socialData.zalo || "",
      });

      const registerData = getConfig<PrimaryRegisterUrlConfig>("primary_register_url");
      setPrimaryRegisterUrl({
        url: registerData.url || "",
        label: registerData.label || "",
      });
    }
  }, [settings]);

  // Mutation to save settings
  const saveMutation = useMutation({
    mutationFn: async (data: { key: string; value: unknown; description: string }) => {
      return adminApi.upsertSetting(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSettings"] });
      queryClient.invalidateQueries({ queryKey: ["publicConfig"] });
    },
  });

  const handleSaveAll = async () => {
    try {
      await Promise.all([
        saveMutation.mutateAsync({
          key: "site_name",
          value: {
            ...siteName,
            // Keep backward compatibility and store a combined full name.
            fullName: `${siteName.prefix || ""} ${siteName.shortName || ""}`.trim(),
            name: `${siteName.prefix || ""} ${siteName.shortName || ""}`.trim(),
          },
          description: "Tên và slogan của website",
        }),
        saveMutation.mutateAsync({
          key: "logo",
          value: logo,
          description: "Logo của website (main, light, favicon)",
        }),
        saveMutation.mutateAsync({
          key: "contact_info",
          value: contactInfo,
          description: "Thông tin liên hệ (hotline, email, địa chỉ)",
        }),
        saveMutation.mutateAsync({
          key: "social_links",
          value: socialLinks,
          description: "Liên kết mạng xã hội",
        }),
        saveMutation.mutateAsync({
          key: "primary_register_url",
          value: primaryRegisterUrl,
          description: "URL đăng ký chính (Bizmall)",
        }),
      ]);

      toast({
        title: "Thành công",
        description: "Đã lưu tất cả cấu hình thương hiệu",
        variant: "success",
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể lưu cấu hình. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Quản lý Thương hiệu</h2>
            <p className="text-sm text-gray-500">Cấu hình logo, tên, thông tin liên hệ và mạng xã hội</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["adminSettings"] })}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={handleSaveAll} disabled={saveMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? "Đang lưu..." : "Lưu tất cả"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Name Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5 text-adk-green" />
              Tên Website
            </CardTitle>
            <CardDescription>Tên và slogan hiển thị trên website</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="prefix">Phần chữ đen (tiền tố)</Label>
              <Input
                id="prefix"
                value={siteName.prefix}
                onChange={(e) => setSiteName({ ...siteName, prefix: e.target.value })}
                placeholder="VD: Dự Án"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shortName">Tên ngắn</Label>
              <Input
                id="shortName"
                value={siteName.shortName}
                onChange={(e) => setSiteName({ ...siteName, shortName: e.target.value })}
                placeholder="VD: ADK Franchise"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fullName">Tên đầy đủ</Label>
              <div
                id="fullName"
                className="min-h-11 rounded-md border border-adk-green/40 bg-white px-3 py-2 flex items-center"
              >
                <span className="text-gray-900 font-semibold">
                  {(siteName.prefix || "").trim() || "Dự Án"}
                </span>
                <span className="text-adk-green font-semibold ml-2">
                  {(siteName.shortName || "").trim() || "Nhượng Quyền ADK"}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Bản xem trước tên thương hiệu: phần chữ đen + phần chữ xanh.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tagline">Slogan</Label>
              <Textarea
                id="tagline"
                value={siteName.tagline}
                onChange={(e) => setSiteName({ ...siteName, tagline: e.target.value })}
                placeholder="VD: Mô hình Siêu thị Thuốc & Thực phẩm sạch"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-adk-green" />
              Logo
            </CardTitle>
            <CardDescription>Hình ảnh logo cho website</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="logoMain">Logo chính (URL)</Label>
              <Input
                id="logoMain"
                value={logo.main}
                onChange={(e) => setLogo({ ...logo, main: e.target.value })}
                placeholder="https://... hoặc /logo.png"
              />
              {logo.main && (
                <div className="mt-2 p-4 bg-gray-100 rounded-lg flex items-center justify-center">
                  <img src={logo.main} alt="Logo Preview" className="max-h-16 object-contain" />
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="logoLight">Logo sáng (cho nền tối)</Label>
              <Input
                id="logoLight"
                value={logo.light}
                onChange={(e) => setLogo({ ...logo, light: e.target.value })}
                placeholder="https://... hoặc /logo-light.png"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="favicon">Favicon</Label>
              <Input
                id="favicon"
                value={logo.favicon}
                onChange={(e) => setLogo({ ...logo, favicon: e.target.value })}
                placeholder="https://... hoặc /favicon.ico"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-adk-green" />
              Thông tin liên hệ
            </CardTitle>
            <CardDescription>Hotline, email và địa chỉ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="hotline">Hotline</Label>
              <Input
                id="hotline"
                value={contactInfo.hotline}
                onChange={(e) => setContactInfo({ ...contactInfo, hotline: e.target.value })}
                placeholder="VD: 1800-1234"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                placeholder="VD: partnership@adkpharma.vn"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Textarea
                id="address"
                value={contactInfo.address}
                onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                placeholder="VD: Số 123, Đường ABC, Quận XYZ, TP.HCM"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-adk-green" />
              Mạng xã hội
            </CardTitle>
            <CardDescription>Liên kết đến các trang mạng xã hội</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={socialLinks.facebook}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={socialLinks.youtube}
                onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                placeholder="https://youtube.com/..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="zalo">Zalo</Label>
              <Input
                id="zalo"
                value={socialLinks.zalo}
                onChange={(e) => setSocialLinks({ ...socialLinks, zalo: e.target.value })}
                placeholder="https://zalo.me/..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Primary Register URL Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-adk-green" />
              URL Đăng ký chính
            </CardTitle>
            <CardDescription>Liên kết đến trang đăng ký đối tác (Bizmall)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="registerUrl">URL</Label>
                <Input
                  id="registerUrl"
                  value={primaryRegisterUrl.url}
                  onChange={(e) => setPrimaryRegisterUrl({ ...primaryRegisterUrl, url: e.target.value })}
                  placeholder="https://bizmall.vn/..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="registerLabel">Nhãn nút</Label>
                <Input
                  id="registerLabel"
                  value={primaryRegisterUrl.label}
                  onChange={(e) => setPrimaryRegisterUrl({ ...primaryRegisterUrl, label: e.target.value })}
                  placeholder="VD: Đăng ký ngay"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
