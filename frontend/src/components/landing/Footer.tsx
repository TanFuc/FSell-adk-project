import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Youtube } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/services/api";
import RedirectButton from "@/components/common/RedirectButton";

interface SiteNameConfig {
  name?: string;
  shortName?: string;
  tagline?: string;
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
}

export default function Footer() {
  // Fetch public config
  const { data: config } = useQuery({
    queryKey: ["publicConfig"],
    queryFn: () => publicApi.getPublicConfig(),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const siteName = (config?.site_name as SiteNameConfig) || {};
  const contactInfo = (config?.contact_info as ContactInfoConfig) || {};
  const socialLinks = (config?.social_links as SocialLinksConfig) || {};
  const primaryRegisterUrl = (config?.primary_register_url as PrimaryRegisterUrlConfig) || {};

  const registerUrl = primaryRegisterUrl.url || "https://bizmall.vn";
  // Logo được sử dụng trực tiếp từ public folder
  const logoUrl = "/logo.png";
  const shortName = siteName.shortName || "ADK Franchise";
  const tagline = siteName.tagline || "Mô hình Siêu thị Thuốc & Thực phẩm sạch - Xu hướng 2025";
  const hotline = contactInfo.hotline || "1800-1234";
  const email = contactInfo.email || "partnership@adkpharma.vn";
  const address = contactInfo.address || "Trụ sở: Số 123, Đường ABC, Quận XYZ, TP.HCM";
  const facebookUrl = socialLinks.facebook || "https://facebook.com/adkpharma";
  const youtubeUrl = socialLinks.youtube || "https://youtube.com/@adkpharma";
  const zaloUrl = socialLinks.zalo || "https://zalo.me/adkpharma";

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* CTA Section - B2B Focus */}
      <div className="border-b border-gray-800">
        <div className="container-full py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">
                Sẵn sàng trở thành Đối Tác ADK?
              </h3>
              <p className="text-gray-400">
                Đăng ký ngay để nhận tư vấn miễn phí và bảng dự toán chi tiết
              </p>
            </div>
            <RedirectButton 
              href={registerUrl} 
              size="lg" 
              variant="primary"
              buttonName="footer_register_partnership"
            >
              Đăng Ký Hợp Tác
            </RedirectButton>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-full py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info - B2B Focused */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center"
              >
                <img
                  src={logoUrl}
                  alt={shortName}
                  className="w-10 h-10 object-contain rounded-full"
                />
              </motion.div>
              <span className="text-xl font-bold text-white">{shortName}</span>
            </Link>
            <p className="text-gray-400 mb-6">
              {tagline}
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-adk-green flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-red-600 flex items-center justify-center transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href={zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-500 flex items-center justify-center transition-colors"
              >
                <span className="text-sm font-bold">Z</span>
              </a>
            </div>
          </div>

          {/* B2B Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Khám Phá Dự Án</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="hover:text-adk-green transition-colors">
                  Giới Thiệu Dự Án
                </Link>
              </li>
              <li>
                <Link to="/mo-hinh" className="hover:text-adk-green transition-colors">
                  Mô Hình Hợp Tác
                </Link>
              </li>
              <li>
                <Link to="/su-kien" className="hover:text-adk-green transition-colors">
                  Sự Kiện Đầu Tư
                </Link>
              </li>
              <li>
                <Link to="/thu-vien" className="hover:text-adk-green transition-colors">
                  Tiêu Chuẩn Cửa Hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Partnership Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Liên Hệ Hợp Tác</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-adk-green flex-shrink-0" />
                <a 
                  href={`tel:${hotline.replace(/\D/g, '')}`} 
                  className="hover:text-adk-green transition-colors"
                >
                  {hotline} (Miễn phí)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-adk-green flex-shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-adk-green transition-colors"
                >
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-adk-green flex-shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>
            </ul>
          </div>

          {/* Partnership Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Thông Tin Đối Tác</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="hover:text-adk-green transition-colors">
                  Quy Trình Hợp Tác
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-adk-green transition-colors">
                  Điều Kiện Nhượng Quyền
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-adk-green transition-colors">
                  Hỏi Đáp Hợp Tác
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-adk-green transition-colors">
                  Tải Hồ Sơ Dự Án
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="container-full py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Dự Án ADK Franchise. Bảo lưu mọi quyền.</p>
            <p>
              Phát triển bởi{" "}
              <a
                href="https://bizmall.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-adk-green hover:underline"
              >
                BizMall
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
