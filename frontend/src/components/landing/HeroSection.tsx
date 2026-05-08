import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import DangKyForm from "./DangKyForm";
import { publicApi } from "@/services/api";

interface SiteNameConfig {
  shortName?: string;
  fullName?: string;
  tagline?: string;
}

export default function HeroSection() {
  // Fetch public config
  const { data: config } = useQuery({
    queryKey: ["publicConfig"],
    queryFn: () => publicApi.getPublicConfig(),
    staleTime: 10 * 60 * 1000,
  });

  const siteNameConfig = (config?.site_name as SiteNameConfig) || {};

  // Logo được sử dụng trực tiếp từ public folder
  const logoUrl = "/logo.png";
  const shortName = siteNameConfig.shortName || "Nhà Thuốc ADK";
  return (
    <section className="relative min-h-screen bg-gradient-adk py-12 lg:py-20 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-adk-green/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-adk-blue/10 rounded-full blur-3xl" />
      </div>

      <div className="container-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-white shadow-xl shadow-adk-green/20 mb-8"
            >
              <img
                src={logoUrl}
                alt={shortName}
                className="w-20 h-20 lg:w-28 lg:h-28 object-contain rounded-full"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6"
            >
              Chào mừng đến
              <span className="block text-adk-green">{shortName}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Nhà thuốc uy tín hàng đầu với hơn 10 năm kinh nghiệm. Đăng ký ngay để nhận ưu đãi đặc
              biệt và được tư vấn miễn phí từ dược sĩ chuyên nghiệp.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0"
            >
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-adk-green">10+</div>
                <div className="text-sm text-gray-500">Năm kinh nghiệm</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-adk-green">50K+</div>
                <div className="text-sm text-gray-500">Khách hàng</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-adk-green">100%</div>
                <div className="text-sm text-gray-500">Hài lòng</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Registration Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass rounded-2xl p-6 lg:p-8 shadow-2xl max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng Ký Nhận Ưu Đãi</h2>
                <p className="text-gray-600">Điền thông tin để nhận ưu đãi đặc biệt</p>
              </div>
              <DangKyForm />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
