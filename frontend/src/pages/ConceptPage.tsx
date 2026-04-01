import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Pill, Leaf, Users, Award, TrendingUp, Shield, Heart, Store } from "lucide-react";
import { businessModelApi } from "@/api";
import type { BusinessModel } from "@/types";
import RedirectButton from "@/components/common/RedirectButton";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const features = [
  {
    icon: Pill,
    title: "Nhà Thuốc GPP",
    description: "Đạt chuẩn GPP theo quy định Bộ Y tế, đảm bảo chất lượng dược phẩm",
    color: "bg-adk-green",
  },
  {
    icon: Leaf,
    title: "Thực Phẩm Hữu Cơ",
    description: "Nguồn thực phẩm sạch, hữu cơ từ các vùng miền Việt Nam",
    color: "bg-green-500",
  },
  {
    icon: Award,
    title: "Sản Phẩm OCOP",
    description: "Đặc sản OCOP 3-5 sao, chất lượng được chứng nhận",
    color: "bg-amber-500",
  },
  {
    icon: Users,
    title: "Đội Ngũ Chuyên Gia",
    description: "Dược sĩ có chứng chỉ hành nghề, tư vấn chuyên nghiệp",
    color: "bg-blue-500",
  },
];

const benefits = [
  {
    icon: TrendingUp,
    title: "Mô Hình Tiên Phong",
    description: "Xu hướng kinh doanh mới năm 2025, kết hợp y học và dinh dưỡng",
  },
  {
    icon: Shield,
    title: "Thương Hiệu Uy Tín",
    description: "Hệ thống nhận diện thương hiệu đồng bộ, chuyên nghiệp",
  },
  {
    icon: Heart,
    title: "Chăm Sóc Toàn Diện",
    description: "Giải pháp sức khỏe toàn diện cho mọi gia đình Việt",
  },
  {
    icon: Store,
    title: "Hỗ Trợ Đối Tác",
    description: "Hỗ trợ vốn, setup, vận hành từ A-Z cho đối tác",
  },
];

export default function ConceptPage() {
  const { data: businessModels = [] } = useQuery<BusinessModel[]>({
    queryKey: ["businessModels", "concept"],
    queryFn: businessModelApi.getAll,
  });

  const visibleBusinessModels = businessModels
    .filter((model) => model.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-adk-green/5 via-white to-adk-blue/5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-adk-green/5 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-adk-blue/5 to-transparent" />
        </div>

        <div className="container-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 bg-adk-green/10 text-adk-green rounded-full text-sm font-medium mb-4">
                Mô Hình Tiên Phong
              </span>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Giao Thoa
                <span className="block text-adk-green">Y Học & Dinh Dưỡng</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Siêu Thị Thuốc ADK - Mô hình kết hợp Nhà thuốc GPP đạt chuẩn và Siêu thị thực phẩm
                sạch, hữu cơ. Giải pháp chăm sóc sức khỏe toàn diện cho mọi gia đình.
              </p>
              <RedirectButton 
                size="lg"
                buttonName="concept_page_learn_more"
              >
                Tìm Hiểu Thêm
              </RedirectButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src="/images/concept/pharmacy.jpg"
                      alt="Nhà thuốc"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src="/images/concept/team.jpg"
                      alt="Đội ngũ"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src="/images/concept/organic-food.jpg"
                      alt="Thực phẩm hữu cơ"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src="/images/concept/products.jpg"
                      alt="Sản phẩm"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-adk-green/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-adk-green" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-adk-green">2025</div>
                    <div className="text-sm text-gray-500">Xu hướng mới</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 lg:py-24">
        <div className="container-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 lg:mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Đặc Điểm Nổi Bật</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Sự kết hợp hoàn hảo giữa dược phẩm chất lượng và thực phẩm lành mạnh
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-adk-green/20 hover:shadow-xl transition-all"
              >
                <div
                  className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Split Section */}
      <section id="loi-ich-hop-tac" className="py-16 lg:py-24 bg-gray-50 scroll-mt-24">
        <div className="container-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/concept/store-interior.jpg"
                  alt="Không gian cửa hàng"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-adk-green/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Không Gian Hiện Đại</h3>
                  <p className="text-white/80">
                    Thiết kế đồng bộ, chuyên nghiệp theo tiêu chuẩn ADK
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Lợi Ích Khi Hợp Tác Cùng ADK
              </h2>

              <p className="text-sm text-gray-500 mb-6">
                Nội dung phần này được đồng bộ từ Admin - tab "Mô hình KD".
              </p>

              <div className="space-y-6">
                {visibleBusinessModels.length > 0
                  ? visibleBusinessModels.map((model, index) => (
                      <motion.div
                        key={model.id}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-adk-green/10 flex items-center justify-center overflow-hidden">
                          {model.iconUrl ? (
                            <img src={model.iconUrl} alt={model.name} className="w-7 h-7 object-contain" />
                          ) : (
                            <TrendingUp className="w-6 h-6 text-adk-green" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{model.name}</h3>
                          <p className="text-gray-600">{model.description}</p>
                          {model.profitPotential && (
                            <p className="text-sm text-adk-green font-medium mt-1">
                              Tiềm năng: {model.profitPotential}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))
                  : benefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-adk-green/10 flex items-center justify-center">
                          <benefit.icon className="w-6 h-6 text-adk-green" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                          <p className="text-gray-600">{benefit.description}</p>
                        </div>
                      </motion.div>
                    ))}
              </div>

              <div className="mt-8">
                <RedirectButton 
                  size="lg"
                  buttonName="concept_page_register_partnership"
                >
                  Đăng Ký Hợp Tác Ngay
                </RedirectButton>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-24 bg-adk-green">
        <div className="container-full">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: "10+", label: "Năm Kinh Nghiệm" },
              { value: "50K+", label: "Khách Hàng" },
              { value: "100+", label: "Đối Tác" },
              { value: "24/7", label: "Hỗ Trợ" },
            ].map((stat, index) => (
              <motion.div key={index} variants={itemVariants}>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/70">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
