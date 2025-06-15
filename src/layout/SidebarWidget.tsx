
import React from "react";
import { HelpCircle, Mail, Phone } from "lucide-react";

export default function SupportSidebar() {
  return (
    <div
      className="
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]"
    >
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        Need Help?
      </h3>
      <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
        Our support team is available 24/7. Get help with FAQs or contact us directly.
      </p>

      {/* FAQ Link */}
      <a
        href="https://xtottel.com/support/"
        className="flex items-center justify-center p-2 mb-2 font-medium text-gray-900 rounded-lg bg-gray-200 text-theme-sm hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        Browse FAQs
      </a>

      {/* Contact Support */}
      <a
        href="https://xtottel.com/contact"
        className="flex items-center justify-center p-2 mb-2 font-medium text-white rounded-lg bg-brand-500 text-theme-sm hover:bg-brand-600"
      >
        <Mail className="w-4 h-4 mr-2" />
        Contact Support
      </a>

      {/* Call Support */}
      <a
        href="tel:+1234567890"
        className="flex items-center justify-center p-2 font-medium text-white rounded-lg bg-green-500 text-theme-sm hover:bg-green-600"
      >
        <Phone className="w-4 h-4 mr-2" />
        Call Us Now
      </a>
    </div>
  );
}
