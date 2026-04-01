import { forwardRef, useCallback } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { appLogger } from "@/lib/logger";
import { ExternalLink, ArrowRight } from "lucide-react";
import { clickTrackingApi } from "@/api";
import { useRegisterUrl } from "@/stores/configStore";

interface RedirectButtonProps extends Omit<HTMLMotionProps<"button">, "onClick"> {
  href?: string; // Optional - defaults to primary_register_url from config
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "xl";
  showIcon?: boolean;
  iconType?: "external" | "arrow";
  buttonName?: string; // For click tracking
  children: React.ReactNode;
}

const variants = {
  primary:
    "bg-adk-green text-white hover:bg-adk-green-dark shadow-lg shadow-adk-green/25 hover:shadow-xl hover:shadow-adk-green/30",
  secondary:
    "bg-adk-blue text-white hover:bg-adk-blue-dark shadow-lg shadow-adk-blue/25 hover:shadow-xl hover:shadow-adk-blue/30",
  outline: "border-2 border-adk-green text-adk-green hover:bg-adk-green hover:text-white",
  ghost: "text-adk-green hover:bg-adk-green/10",
  link: "text-current hover:text-current", // Link variant for inline text buttons
};

const sizes = {
  sm: "px-4 py-2 text-sm gap-1.5",
  md: "px-6 py-3 text-base gap-2",
  lg: "px-8 py-4 text-lg gap-2.5",
  xl: "px-10 py-5 text-xl gap-3",
};

const RedirectButton = forwardRef<HTMLButtonElement, RedirectButtonProps>(
  (
    {
      href,
      variant = "primary",
      size = "md",
      showIcon = true,
      iconType = "arrow",
      buttonName,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    // Get register URL from global config
    const { url: defaultRegisterUrl } = useRegisterUrl();
    const targetUrl = href || defaultRegisterUrl;

    const handleRedirect = useCallback(async () => {
      if (disabled) return;

      // Track click before redirecting
      if (buttonName) {
        try {
          await clickTrackingApi.trackClick({
            buttonName,
            pageUrl: window.location.href,
            redirectUrl: targetUrl,
            referrer: document.referrer,
          });
        } catch (error) {
          // Tracking error should not prevent redirect
          appLogger.warn("redirect-button", "Click tracking failed", { error });
        }
      }

      // Small delay to ensure tracking request is sent
      setTimeout(() => {
        if (targetUrl) {
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
        }
      }, 100);
    }, [targetUrl, disabled, buttonName]);

    const Icon = iconType === "external" ? ExternalLink : ArrowRight;

    return (
      <motion.button
        ref={ref}
        onClick={handleRedirect}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.03 }}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-adk-green focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        <span>{children}</span>
        {showIcon && (
          <motion.span
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon
              className={cn(
                size === "sm" && "w-4 h-4",
                size === "md" && "w-5 h-5",
                size === "lg" && "w-6 h-6",
                size === "xl" && "w-7 h-7"
              )}
            />
          </motion.span>
        )}
      </motion.button>
    );
  }
);

RedirectButton.displayName = "RedirectButton";

export default RedirectButton;
