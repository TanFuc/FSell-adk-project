import { motion } from "framer-motion";
import type { PhanMuc } from "@/types";
import { Pill, Leaf, Users } from "lucide-react";

interface SplitImageTextSectionProps {
  section: PhanMuc;
}

interface SplitContent {
  title?: string;
  titleHighlight?: string;
  subtitle?: string;
  description?: string;
  leftColumn?: { title?: string; items?: string[] };
  rightColumn?: { title?: string; items?: string[] };
  bottomText?: string;
  features?: Array<{ icon: string; text: string }>;
}

const iconMap: Record<string, typeof Pill> = {
  pharmacy: Pill,
  organic: Leaf,
  expert: Users,
};

export default function SplitImageTextSection({ section }: SplitImageTextSectionProps) {
  const content = section.content as SplitContent;
  const leftImage = section.images[0];
  const rightImage = section.images[1];
  const hasColumns = Boolean(content.leftColumn || content.rightColumn);

  return (
    <section className="py-16 lg:py-24 bg-white overflow-hidden">
      <div className="container-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-16"
        >
          {content.subtitle && (
            <span className="inline-block px-4 py-1.5 rounded-full bg-adk-green/10 text-adk-green text-sm font-medium mb-4">
              {content.subtitle}
            </span>
          )}
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
            {content.title}
            {content.titleHighlight && (
              <span className="text-adk-green"> {content.titleHighlight}</span>
            )}
          </h2>
        </motion.div>

        {hasColumns ? (
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
                {content.leftColumn?.title && (
                  <h3 className="text-2xl font-bold text-gray-900">{content.leftColumn.title}</h3>
                )}
              </div>
              {content.leftColumn?.items && content.leftColumn.items.length > 0 && (
                <ul className="space-y-3">
                  {content.leftColumn.items.map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-600">
                      <Pill className="w-5 h-5 text-adk-green flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>

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
                {content.rightColumn?.title && (
                  <h3 className="text-2xl font-bold text-gray-900">{content.rightColumn.title}</h3>
                )}
              </div>
              {content.rightColumn?.items && content.rightColumn.items.length > 0 && (
                <ul className="space-y-3">
                  {content.rightColumn.items.map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-600">
                      <Leaf className="w-5 h-5 text-adk-blue flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {leftImage && (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={leftImage}
                    alt=""
                    className="w-full h-80 lg:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-adk-green/80 to-transparent" />
                  {content.leftColumn?.title && (
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="text-lg font-semibold">{content.leftColumn.title}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {rightImage && (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={rightImage}
                    alt=""
                    className="w-full h-80 lg:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-adk-blue/80 to-transparent" />
                  {content.rightColumn?.title && (
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="text-lg font-semibold">{content.rightColumn.title}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Description & Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 lg:mt-16 text-center max-w-4xl mx-auto"
        >
          {content.description && (
            <p className="text-lg lg:text-xl text-gray-600 mb-8">{content.description}</p>
          )}

          {content.bottomText && (
            <p className="text-xl text-gray-700 font-medium mb-8">
              {content.bottomText}
            </p>
          )}

          {content.features && content.features.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
              {content.features.map((feature, index) => {
                const Icon = iconMap[feature.icon] || Pill;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3 px-5 py-3 rounded-full bg-gray-100 hover:bg-adk-green/10 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-adk-green" />
                    <span className="text-gray-700 font-medium">{feature.text}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
