import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Pill, Leaf, TrendingUp, CheckCircle } from "lucide-react";
import { sectionApi, partnershipFaqApi, businessModelApi } from "@/api";
import { publicApi } from "@/services/api";
import type { Section, PartnershipFaq, BusinessModel } from "@/types";
import Navbar from "@/components/landing/Navbar";
import { DynamicSectionRenderer } from "@/components/sections";
import FeaturesSection from "@/components/landing/FeaturesSection";
import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";
import RedirectButton from "@/components/common/RedirectButton";

interface LogoConfig {
  main?: string;
  light?: string;
  favicon?: string;
}

interface SiteNameConfig {
  shortName?: string;
  fullName?: string;
  tagline?: string;
}

export default function LandingPage() {
  const { data: sections = [], isLoading } = useQuery<Section[]>({
    queryKey: ["sections", "all"],
    queryFn: sectionApi.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const { data: faqs = [] } = useQuery<PartnershipFaq[]>({
    queryKey: ["faqs"],
    queryFn: partnershipFaqApi.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const { data: _businessModels = [] } = useQuery<BusinessModel[]>({
    queryKey: ["businessModels"],
    queryFn: businessModelApi.getAll,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch public config
  const { data: config } = useQuery({
    queryKey: ["publicConfig"],
    queryFn: () => publicApi.getPublicConfig(),
    staleTime: 10 * 60 * 1000,
  });

  const siteNameConfig = (config?.site_name as SiteNameConfig) || {};

  // Logo được sử dụng trực tiếp từ public folder
  const logoUrl = "/logo.png";
  const shortName = siteNameConfig.shortName || "NHÀ THUỐC ADK";

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Dynamic Sections from CMS */}
      {!isLoading && sections.length > 0 ? (
        <>
          <DynamicSectionRenderer sections={sections} />
          <FAQSection faqs={faqs} />
        </>
      ) : (
        <>
          {/* Fallback to static content when CMS is empty */}
          <StaticHeroSection logoUrl={logoUrl} shortName={shortName} />
          <MarketInsightSection />
          <ADKModelSection />
          <FeaturesSection />
          <FAQSection faqs={faqs} />
        </>
      )}

      <Footer />
    </main>
  );
}

// B2B Hero Section - Project Introduction
function StaticHeroSection({ logoUrl, shortName }: { logoUrl: string; shortName: string }) {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-adk-green-dark py-12 lg:py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-adk-green/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-adk-blue/10 to-transparent" />
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" />
      </div>

      <div className="container-full relative z-10">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-adk-green/20 border border-adk-green/30 mb-6"
          >
            <TrendingUp className="w-4 h-4 text-adk-green" />
            <span className="text-adk-green font-medium text-sm">Xu Hướng Đầu Tư 2025</span>
          </motion.div>

          {/* Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-white shadow-xl shadow-adk-green/30 mb-8"
          >
            <img
              src={logoUrl}
              alt={shortName}
              className="w-20 h-20 lg:w-28 lg:h-28 object-contain rounded-full"
            />
          </motion.div>

          {/* Title - B2B Focused */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-5xl"
          >
            DỰ ÁN PHÁT TRIỂN CHUỖI
            <br />
            <span className="text-adk-green">{shortName}</span>
          </motion.h1>

          {/* Subtitle - Investment Pitch */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl lg:text-2xl text-gray-300 mb-10 max-w-3xl"
          >
            Mô hình Siêu thị Thuốc & Thực phẩm sạch - Xu hướng kinh doanh bền vững 2025.
            <br />
            <span className="text-adk-green font-semibold">Cơ hội đầu tư sinh lời.</span>
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <RedirectButton 
              size="xl" 
              variant="primary"
              buttonName="hero_register_partnership"
            >
              Đăng Ký Hợp Tác Ngay
            </RedirectButton>
          </motion.div>

          {/* Stats - B2B Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-8 lg:gap-16 mt-16 pt-8 border-t border-white/20"
          >
            {[
              { value: "10+", label: "Năm Kinh Nghiệm" },
              { value: "100+", label: "Đối Tác Toàn Quốc" },
              { value: "2025", label: "Xu Hướng Mới" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-5xl font-bold text-adk-green">{stat.value}</div>
                <div className="text-sm lg:text-base text-gray-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Market Insight Section - Why Now?
function MarketInsightSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container-full">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block px-4 py-1.5 bg-adk-blue/10 text-adk-blue rounded-full text-sm font-medium mb-4">
              Thị Trường 2025
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
              Nắm Bắt <span className="text-adk-green">Xu Hướng Tương Lai</span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Năm 2025, người tiêu dùng chuyển dịch từ <strong>"Chữa bệnh"</strong> sang{" "}
              <strong>"Chăm sóc sức khỏe chủ động"</strong>. Mô hình ADK giải quyết bài toán này
              bằng sự kết hợp hoàn hảo giữa Nhà thuốc GPP và Siêu thị thực phẩm sạch.
            </p>
          </motion.div>

          {/* Key Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid sm:grid-cols-3 gap-6"
          >
            {[
              { icon: TrendingUp, text: "Tăng trưởng ngành dược phẩm 8-10%/năm" },
              { icon: CheckCircle, text: "Xu hướng Healthy Living lan rộng" },
              { icon: CheckCircle, text: "Người tiêu dùng ưu tiên nguồn gốc rõ ràng" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                <item.icon className="w-6 h-6 text-adk-green flex-shrink-0" />
                <span className="text-gray-700 font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ADK Model Section - Visual Split Layout
function ADKModelSection() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-adk-green/10 text-adk-green rounded-full text-sm font-medium mb-4">
            Mô Hình Tiên Phong
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
            Giao Thoa <span className="text-adk-green">Y Học & Dinh Dưỡng</span>
          </h2>
        </motion.div>

        {/* Two Column Model */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Left - Pharmacy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-lg border-2 border-adk-green/20"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-adk-green flex items-center justify-center">
                <Pill className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Nhà Thuốc GPP Hiện Đại</h3>
            </div>
            <ul className="space-y-3">
              {["Thuốc kê đơn & OTC", "Thực phẩm chức năng", "Dược mỹ phẩm chính hãng"].map(
                (item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-adk-green flex-shrink-0" />
                    {item}
                  </li>
                )
              )}
            </ul>
          </motion.div>

          {/* Right - Supermarket */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-lg border-2 border-adk-blue/20"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-adk-blue flex items-center justify-center">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Siêu Thị Tự Chọn</h3>
            </div>
            <ul className="space-y-3">
              {["Sữa hạt, Sữa tươi hữu cơ", "Thực phẩm Organic", "Đặc sản OCOP các vùng miền"].map(
                (item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-adk-blue flex-shrink-0" />
                    {item}
                  </li>
                )
              )}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center"
        >
          <p className="text-xl text-gray-700 font-medium">
            Biến nhà thuốc truyền thống thành điểm đến{" "}
            <span className="text-adk-green font-bold">Healthy Living Hub</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
