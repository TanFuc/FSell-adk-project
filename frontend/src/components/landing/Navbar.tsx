import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import RedirectButton from "@/components/common/RedirectButton";
import { publicApi } from "@/services/api";

interface LogoConfig {
  main?: string;
  light?: string;
  favicon?: string;
}

interface SiteNameConfig {
  prefix?: string;
  shortName?: string;
  name?: string;
  fullName?: string;
  tagline?: string;
}

// B2B Navigation Links
const navLinks = [
  { href: "/", label: "Dự Án" },
  { href: "/mo-hinh", label: "Mô Hình Hợp Tác" },
  { href: "/su-kien", label: "Sự Kiện Đầu Tư" },
  { href: "/thu-vien", label: "Tiêu Chuẩn Cửa Hàng" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Fetch public config
  const { data: config } = useQuery({
    queryKey: ["publicConfig"],
    queryFn: () => publicApi.getPublicConfig(),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const siteNameConfig = (config?.site_name as SiteNameConfig) || {};

  // Logo được sử dụng trực tiếp từ public folder
  const logoUrl = "/logo.png";
  const shortName = siteNameConfig.shortName || "Nhà Thuốc ADK";
  const derivedPrefix =
    (siteNameConfig.fullName || siteNameConfig.name || "").replace(shortName, "").trim();
  const prefix = siteNameConfig.prefix || derivedPrefix || "Dự Án";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-md py-2" : "bg-transparent py-4"
        )}
      >
        <div className="container-full">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white shadow-md flex items-center justify-center"
              >
                <img
                  src={logoUrl}
                  alt={shortName}
                  className="w-8 h-8 lg:w-10 lg:h-10 object-contain rounded-full"
                />
              </motion.div>
              <div className="hidden sm:block">
                <span
                  className={cn(
                    "text-lg lg:text-xl font-bold transition-colors",
                    isScrolled ? "text-gray-900" : "text-gray-900"
                  )}
                >
                  {prefix} <span className="text-adk-green">{shortName}</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all",
                    location.pathname === link.href
                      ? "text-adk-green bg-adk-green/10"
                      : isScrolled
                        ? "text-gray-600 hover:text-adk-green hover:bg-gray-100"
                        : "text-gray-700 hover:text-adk-green hover:bg-white/50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <RedirectButton 
                size="md" 
                variant="primary"
                buttonName="navbar_register_partnership"
              >
                Đăng Ký Hợp Tác
              </RedirectButton>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "lg:hidden w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-gray-700 hover:bg-white/50"
              )}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 lg:hidden"
          >
            <div className="container-full py-4">
              <div className="bg-white rounded-2xl shadow-xl p-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "block px-4 py-3 rounded-xl font-medium transition-colors",
                      location.pathname === link.href
                        ? "text-adk-green bg-adk-green/10"
                        : "text-gray-600 hover:text-adk-green hover:bg-gray-50"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="pt-2 border-t">
                  <RedirectButton
                    size="md"
                    variant="primary"
                    className="w-full"
                    buttonName="mobile_navbar_register_partnership"
                  >
                    Đăng Ký Hợp Tác
                  </RedirectButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
